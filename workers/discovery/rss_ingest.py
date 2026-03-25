"""SIE-106: RSS and news/press feed ingest adapter."""

import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

import feedparser
import httpx


@dataclass
class FeedItem:
    guid: str
    title: str
    url: str
    summary: str | None = None
    published_at: datetime | None = None
    source_feed_url: str = ""
    domain: str = ""
    content_hash: str = ""


def _item_hash(title: str, url: str) -> str:
    return hashlib.sha256(f"{title}|{url}".encode()).hexdigest()


def _parse_date(entry: dict) -> datetime | None:
    for key in ("published_parsed", "updated_parsed"):
        tp = entry.get(key)
        if tp:
            try:
                from time import mktime
                return datetime.fromtimestamp(mktime(tp), tz=timezone.utc)
            except Exception:
                continue
    return None


async def fetch_feed(
    feed_url: str,
    domain: str = "",
    client: httpx.AsyncClient | None = None,
) -> list[FeedItem]:
    own = client is None
    if own:
        client = httpx.AsyncClient(timeout=20)
    try:
        resp = await client.get(feed_url)
        if resp.status_code != 200:
            return []
        parsed = feedparser.parse(resp.text)
        items: list[FeedItem] = []
        for entry in parsed.entries:
            guid = entry.get("id") or entry.get("link") or ""
            title = entry.get("title", "")
            url = entry.get("link", "")
            summary = entry.get("summary", "")

            if not guid and not url:
                continue

            item = FeedItem(
                guid=guid,
                title=title,
                url=url,
                summary=summary[:2000] if summary else None,
                published_at=_parse_date(entry),
                source_feed_url=feed_url,
                domain=domain,
                content_hash=_item_hash(title, url),
            )
            items.append(item)
        return items
    except Exception:
        return []
    finally:
        if own:
            await client.aclose()


def dedupe_items(
    new_items: list[FeedItem], seen_hashes: set[str]
) -> list[FeedItem]:
    unique: list[FeedItem] = []
    for item in new_items:
        key = item.content_hash or item.guid
        if key not in seen_hashes:
            seen_hashes.add(key)
            unique.append(item)
    return unique
