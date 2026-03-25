"""SIE-103: Playwright renderer for JS-heavy pages with browser context pooling."""

import asyncio
import time
from dataclasses import dataclass
from typing import Optional

from workers.discovery.fetcher import FetchResult

try:
    from playwright.async_api import async_playwright, Browser, BrowserContext
    HAS_PLAYWRIGHT = True
except ImportError:
    HAS_PLAYWRIGHT = False


@dataclass
class RenderResult:
    url: str
    html: Optional[str] = None
    render_ms: int = 0
    error: Optional[str] = None
    render_method: str = "playwright"


class PlaywrightPool:
    """Manages a pool of browser contexts for efficient JS rendering."""

    def __init__(self, max_contexts: int = 4, page_timeout_ms: int = 30000):
        self.max_contexts = max_contexts
        self.page_timeout_ms = page_timeout_ms
        self._playwright = None
        self._browser: Optional[Browser] = None  # type: ignore[type-arg]
        self._semaphore = asyncio.Semaphore(max_contexts)

    async def start(self) -> None:
        if not HAS_PLAYWRIGHT:
            raise RuntimeError("Playwright is not installed")
        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch(headless=True)

    async def stop(self) -> None:
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()

    async def render(self, url: str) -> RenderResult:
        if not self._browser:
            return RenderResult(url=url, error="pool_not_started")

        async with self._semaphore:
            context: BrowserContext = await self._browser.new_context(  # type: ignore[union-attr]
                user_agent="TrustCopilotBot/1.0 (Playwright)"
            )
            try:
                page = await context.new_page()
                start = time.monotonic()
                await page.goto(url, wait_until="networkidle", timeout=self.page_timeout_ms)
                html = await page.content()
                elapsed = int((time.monotonic() - start) * 1000)
                return RenderResult(url=url, html=html, render_ms=elapsed)
            except Exception as e:
                return RenderResult(url=url, error=str(e)[:500])
            finally:
                await context.close()


def needs_js_render(static_html: str | None, page_type_hint: str | None = None) -> bool:
    """Heuristic: use Playwright when static fetch returned too little meaningful text,
    or when the page type is known to require JS."""
    js_heavy_types = {"trust_page", "team_page", "careers_page", "security_page"}
    if page_type_hint and page_type_hint in js_heavy_types:
        return True
    if static_html is None:
        return True
    stripped = static_html.strip()
    if len(stripped) < 500:
        return True
    noscript_markers = ["__NEXT_DATA__", "window.__INITIAL_STATE__", "react-root", "app-root"]
    if any(m in stripped for m in noscript_markers):
        text_ratio = len([c for c in stripped if c.isalpha()]) / max(len(stripped), 1)
        if text_ratio < 0.15:
            return True
    return False
