"""SIE-101: Crawl scheduler — emits crawl jobs from the source registry based on priority,
freshness, and source health. Implements exponential backoff on failures."""

import json
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.discovery import CrawlJob, SourceEntry


class CrawlScheduler:
    MAX_BACKOFF_HOURS = 720  # 30 days

    def __init__(self, db: AsyncSession):
        self.db = db

    async def emit_due_jobs(self, batch_size: int = 100) -> list[CrawlJob]:
        now = datetime.now(timezone.utc)
        stmt = (
            select(SourceEntry)
            .where(
                SourceEntry.active == True,
                SourceEntry.next_crawl_at <= now,
            )
            .order_by(SourceEntry.priority.desc(), SourceEntry.next_crawl_at.asc())
            .limit(batch_size)
            .with_for_update(skip_locked=True)
        )
        result = await self.db.execute(stmt)
        sources = list(result.scalars().all())

        jobs: list[CrawlJob] = []
        for src in sources:
            job = CrawlJob(
                source_entry_id=str(src.id),
                url=src.url_pattern,
                domain=src.domain,
                source_type=src.source_type,
                page_type_hint=src.page_type_hint,
                priority=src.priority,
                requires_js=src.requires_js,
            )
            self.db.add(job)
            src.next_crawl_at = self._next_crawl_time(src, now)
            jobs.append(job)

        await self.db.flush()
        return jobs

    def _next_crawl_time(self, src: SourceEntry, now: datetime) -> datetime:
        if src.consecutive_failures > 0:
            backoff_hours = min(
                src.recrawl_hours * (2 ** src.consecutive_failures),
                self.MAX_BACKOFF_HOURS,
            )
            return now + timedelta(hours=backoff_hours)
        return now + timedelta(hours=src.recrawl_hours)

    async def record_success(self, source_entry_id: str) -> None:
        src = await self.db.get(SourceEntry, source_entry_id)
        if src is None:
            return
        src.last_crawled_at = datetime.now(timezone.utc)
        src.consecutive_failures = 0
        src.health_score = min(1.0, src.health_score + 0.1)
        src.last_error = None
        await self.db.flush()

    async def record_failure(self, source_entry_id: str, error: str) -> None:
        src = await self.db.get(SourceEntry, source_entry_id)
        if src is None:
            return
        src.consecutive_failures += 1
        src.health_score = max(0.0, src.health_score - 0.2)
        src.last_error = error[:2000]
        now = datetime.now(timezone.utc)
        src.next_crawl_at = self._next_crawl_time(src, now)
        await self.db.flush()

    async def register_source(
        self,
        source_type: str,
        url_pattern: str,
        domain: str,
        *,
        page_type_hint: str | None = None,
        priority: int = 5,
        recrawl_hours: int = 168,
        requires_js: bool = False,
        rate_limit_rpm: int = 10,
    ) -> SourceEntry:
        now = datetime.now(timezone.utc)
        entry = SourceEntry(
            source_type=source_type,
            url_pattern=url_pattern,
            domain=domain,
            page_type_hint=page_type_hint,
            priority=priority,
            recrawl_hours=recrawl_hours,
            requires_js=requires_js,
            rate_limit_rpm=rate_limit_rpm,
            next_crawl_at=now,
        )
        self.db.add(entry)
        await self.db.flush()
        return entry
