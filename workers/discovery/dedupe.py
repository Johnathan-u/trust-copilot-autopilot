"""SIE-108: Freshness scoring, content dedup, and per-domain crawl budget enforcement."""

import hashlib
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.discovery import CrawlJob, CrawlMetrics


@dataclass
class CrawlGateResult:
    allowed: bool
    skip_reason: str | None = None


class CrawlBudgetService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_metrics(self, domain: str) -> CrawlMetrics:
        stmt = select(CrawlMetrics).where(CrawlMetrics.domain == domain)
        result = await self.db.execute(stmt)
        metrics = result.scalar_one_or_none()
        if metrics is None:
            metrics = CrawlMetrics(domain=domain)
            self.db.add(metrics)
            await self.db.flush()
        return metrics

    async def check_budget(self, domain: str) -> CrawlGateResult:
        metrics = await self.get_or_create_metrics(domain)
        now = datetime.now(timezone.utc)

        if metrics.budget_reset_at.date() < now.date():
            metrics.used_today = 0
            metrics.budget_reset_at = now
            await self.db.flush()

        if metrics.used_today >= metrics.daily_budget:
            metrics.total_skipped_budget += 1
            await self.db.flush()
            return CrawlGateResult(allowed=False, skip_reason="domain_budget_exhausted")

        return CrawlGateResult(allowed=True)

    async def consume(self, domain: str) -> None:
        metrics = await self.get_or_create_metrics(domain)
        metrics.used_today += 1
        metrics.total_fetched += 1
        await self.db.flush()

    async def record_skip(self, domain: str, reason: str) -> None:
        metrics = await self.get_or_create_metrics(domain)
        if reason == "stale":
            metrics.total_skipped_stale += 1
        elif reason == "duplicate":
            metrics.total_skipped_duplicate += 1
        elif reason == "budget":
            metrics.total_skipped_budget += 1
        await self.db.flush()

    async def record_error(self, domain: str) -> None:
        metrics = await self.get_or_create_metrics(domain)
        metrics.total_errors += 1
        await self.db.flush()

    async def record_retry(self, domain: str) -> None:
        metrics = await self.get_or_create_metrics(domain)
        metrics.total_retried += 1
        await self.db.flush()


def is_content_duplicate(new_hash: str, seen_hashes: set[str]) -> bool:
    if new_hash in seen_hashes:
        return True
    seen_hashes.add(new_hash)
    return False


def compute_freshness_score(
    observed_at: datetime | None,
    max_age_days: int = 90,
) -> float:
    if observed_at is None:
        return 0.5
    now = datetime.now(timezone.utc)
    if observed_at.tzinfo is None:
        observed_at = observed_at.replace(tzinfo=timezone.utc)
    age = now - observed_at
    if age.days <= 0:
        return 1.0
    if age.days >= max_age_days:
        return 0.0
    return max(0.0, 1.0 - (age.days / max_age_days))


def is_stale(
    last_crawled_at: datetime | None,
    min_recrawl_hours: int = 24,
) -> bool:
    """Returns True if the page was crawled recently enough to skip."""
    if last_crawled_at is None:
        return False
    if last_crawled_at.tzinfo is None:
        last_crawled_at = last_crawled_at.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    return (now - last_crawled_at) < timedelta(hours=min_recrawl_hours)
