"""SIE-102: Robots-aware async HTML fetcher with ETag, hash dedup, and retry/backoff."""

import hashlib
import time
from dataclasses import dataclass, field
from typing import Optional
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import httpx


@dataclass
class FetchResult:
    url: str
    canonical_url: str
    status_code: int
    html: Optional[str] = None
    content_hash: Optional[str] = None
    etag: Optional[str] = None
    last_modified: Optional[str] = None
    fetch_ms: int = 0
    skipped: bool = False
    skip_reason: Optional[str] = None
    error: Optional[str] = None


_robots_cache: dict[str, tuple[RobotFileParser, float]] = {}
ROBOTS_TTL = 3600


async def _check_robots(client: httpx.AsyncClient, url: str) -> bool:
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    now = time.time()

    if robots_url in _robots_cache:
        rp, cached_at = _robots_cache[robots_url]
        if now - cached_at < ROBOTS_TTL:
            return rp.can_fetch("TrustCopilotBot", url)

    rp = RobotFileParser()
    try:
        resp = await client.get(robots_url, timeout=10)
        rp.parse(resp.text.splitlines())
    except Exception:
        rp.parse([])  # permissive on failure

    _robots_cache[robots_url] = (rp, now)
    return rp.can_fetch("TrustCopilotBot", url)


def _content_hash(html: str) -> str:
    return hashlib.sha256(html.encode("utf-8", errors="replace")).hexdigest()


async def fetch_page(
    url: str,
    *,
    client: httpx.AsyncClient | None = None,
    prev_etag: str | None = None,
    prev_hash: str | None = None,
    timeout: float = 30.0,
) -> FetchResult:
    own_client = client is None
    if own_client:
        client = httpx.AsyncClient(
            follow_redirects=True,
            headers={"User-Agent": "TrustCopilotBot/1.0"},
            timeout=timeout,
        )

    try:
        if not await _check_robots(client, url):
            return FetchResult(
                url=url, canonical_url=url, status_code=0,
                skipped=True, skip_reason="robots_disallowed",
            )

        headers: dict[str, str] = {}
        if prev_etag:
            headers["If-None-Match"] = prev_etag

        start = time.monotonic()
        resp = await client.get(url, headers=headers, timeout=timeout)
        elapsed_ms = int((time.monotonic() - start) * 1000)

        canonical = str(resp.url)

        if resp.status_code == 304:
            return FetchResult(
                url=url, canonical_url=canonical, status_code=304,
                etag=prev_etag, fetch_ms=elapsed_ms,
                skipped=True, skip_reason="not_modified",
            )

        if resp.status_code == 429:
            retry_after = resp.headers.get("Retry-After", "60")
            return FetchResult(
                url=url, canonical_url=canonical, status_code=429,
                fetch_ms=elapsed_ms,
                error=f"rate_limited:retry_after={retry_after}",
            )

        if resp.status_code >= 400:
            return FetchResult(
                url=url, canonical_url=canonical, status_code=resp.status_code,
                fetch_ms=elapsed_ms, error=f"http_{resp.status_code}",
            )

        html = resp.text
        h = _content_hash(html)

        if prev_hash and h == prev_hash:
            return FetchResult(
                url=url, canonical_url=canonical, status_code=resp.status_code,
                content_hash=h, fetch_ms=elapsed_ms,
                skipped=True, skip_reason="content_unchanged",
            )

        return FetchResult(
            url=url,
            canonical_url=canonical,
            status_code=resp.status_code,
            html=html,
            content_hash=h,
            etag=resp.headers.get("ETag"),
            last_modified=resp.headers.get("Last-Modified"),
            fetch_ms=elapsed_ms,
        )

    except httpx.TimeoutException:
        return FetchResult(
            url=url, canonical_url=url, status_code=0, error="timeout",
        )
    except Exception as e:
        return FetchResult(
            url=url, canonical_url=url, status_code=0, error=str(e)[:500],
        )
    finally:
        if own_client:
            await client.aclose()
