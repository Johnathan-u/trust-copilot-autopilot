"""SIE-108: Freshness, dedupe, and crawl budget tests."""

import uuid
from datetime import datetime, timedelta, timezone

import pytest

from workers.discovery.dedupe import (
    CrawlBudgetService,
    compute_freshness_score,
    is_content_duplicate,
    is_stale,
)
from db.models.discovery import CrawlMetrics


class FakeDB:
    def __init__(self):
        self._store: dict[str, CrawlMetrics] = {}
        self._flushed = False

    async def execute(self, stmt):
        from unittest.mock import MagicMock
        result = MagicMock()
        for domain, m in self._store.items():
            result.scalar_one_or_none = MagicMock(return_value=m)
            return result
        result.scalar_one_or_none = MagicMock(return_value=None)
        return result

    def add(self, obj):
        if isinstance(obj, CrawlMetrics):
            self._store[obj.domain] = obj

    async def flush(self):
        self._flushed = True


class TestContentDuplicate:
    def test_new_hash_not_duplicate(self):
        seen: set[str] = set()
        assert is_content_duplicate("abc", seen) is False
        assert "abc" in seen

    def test_existing_hash_is_duplicate(self):
        seen = {"abc"}
        assert is_content_duplicate("abc", seen) is True

    def test_different_hashes(self):
        seen: set[str] = set()
        assert is_content_duplicate("a", seen) is False
        assert is_content_duplicate("b", seen) is False
        assert is_content_duplicate("a", seen) is True


class TestFreshnessScore:
    def test_just_now_is_1(self):
        now = datetime.now(timezone.utc)
        assert compute_freshness_score(now) == 1.0

    def test_max_age_is_0(self):
        old = datetime.now(timezone.utc) - timedelta(days=100)
        assert compute_freshness_score(old, max_age_days=90) == 0.0

    def test_half_age(self):
        half = datetime.now(timezone.utc) - timedelta(days=45)
        score = compute_freshness_score(half, max_age_days=90)
        assert 0.4 <= score <= 0.6

    def test_none_returns_default(self):
        assert compute_freshness_score(None) == 0.5


class TestIsStale:
    def test_never_crawled_not_stale(self):
        assert is_stale(None) is False

    def test_recently_crawled_is_stale(self):
        recent = datetime.now(timezone.utc) - timedelta(hours=1)
        assert is_stale(recent, min_recrawl_hours=24) is True

    def test_old_crawl_not_stale(self):
        old = datetime.now(timezone.utc) - timedelta(hours=48)
        assert is_stale(old, min_recrawl_hours=24) is False


class TestCrawlBudgetService:
    @pytest.mark.asyncio
    async def test_budget_check_passes(self):
        db = FakeDB()
        m = CrawlMetrics(
            id=uuid.uuid4(),
            domain="example.com",
            daily_budget=500,
            used_today=0,
            budget_reset_at=datetime.now(timezone.utc),
        )
        db._store["example.com"] = m
        svc = CrawlBudgetService(db)
        result = await svc.check_budget("example.com")
        assert result.allowed is True

    @pytest.mark.asyncio
    async def test_budget_exhausted(self):
        db = FakeDB()
        m = CrawlMetrics(
            id=uuid.uuid4(),
            domain="example.com",
            daily_budget=10,
            used_today=10,
            budget_reset_at=datetime.now(timezone.utc),
            total_skipped_budget=0,
        )
        db._store["example.com"] = m
        svc = CrawlBudgetService(db)
        result = await svc.check_budget("example.com")
        assert result.allowed is False
        assert result.skip_reason == "domain_budget_exhausted"

    @pytest.mark.asyncio
    async def test_consume_increments(self):
        db = FakeDB()
        m = CrawlMetrics(
            id=uuid.uuid4(),
            domain="example.com",
            daily_budget=500,
            used_today=0,
            budget_reset_at=datetime.now(timezone.utc),
            total_fetched=0,
        )
        db._store["example.com"] = m
        svc = CrawlBudgetService(db)
        await svc.consume("example.com")
        assert m.used_today == 1
        assert m.total_fetched == 1
