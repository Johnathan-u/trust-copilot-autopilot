"""SIE-101: Crawl scheduler tests."""

import uuid
from datetime import datetime, timedelta, timezone

import pytest

from db.models.discovery import SourceEntry
from workers.discovery.scheduler import CrawlScheduler


class TestNextCrawlTime:
    def test_healthy_source_uses_recrawl_hours(self):
        sched = CrawlScheduler.__new__(CrawlScheduler)
        src = SourceEntry(
            id=uuid.uuid4(),
            source_type="company_site",
            url_pattern="https://example.com/trust",
            domain="example.com",
            recrawl_hours=168,
            consecutive_failures=0,
        )
        now = datetime.now(timezone.utc)
        nxt = sched._next_crawl_time(src, now)
        assert (nxt - now).total_seconds() == pytest.approx(168 * 3600, rel=1)

    def test_failed_source_uses_exponential_backoff(self):
        sched = CrawlScheduler.__new__(CrawlScheduler)
        src = SourceEntry(
            id=uuid.uuid4(),
            source_type="company_site",
            url_pattern="https://example.com/trust",
            domain="example.com",
            recrawl_hours=24,
            consecutive_failures=3,
        )
        now = datetime.now(timezone.utc)
        nxt = sched._next_crawl_time(src, now)
        expected_hours = 24 * (2 ** 3)  # 192 hours
        assert (nxt - now).total_seconds() == pytest.approx(expected_hours * 3600, rel=1)

    def test_backoff_capped_at_max(self):
        sched = CrawlScheduler.__new__(CrawlScheduler)
        src = SourceEntry(
            id=uuid.uuid4(),
            source_type="company_site",
            url_pattern="https://example.com/trust",
            domain="example.com",
            recrawl_hours=24,
            consecutive_failures=20,
        )
        now = datetime.now(timezone.utc)
        nxt = sched._next_crawl_time(src, now)
        max_hours = CrawlScheduler.MAX_BACKOFF_HOURS
        assert (nxt - now).total_seconds() == pytest.approx(max_hours * 3600, rel=1)
