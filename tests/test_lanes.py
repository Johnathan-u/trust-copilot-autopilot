"""ARC-001: Lane budget service tests using fake Redis."""

import uuid
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from db.models.lanes import LaneBudget
from services.lanes import BudgetExhausted, LaneBudgetService, QUEUE_NAMES


class FakeDB:
    """Minimal async session fake for budget tests."""

    def __init__(self):
        self._store: dict[tuple[str, str], LaneBudget] = {}
        self._flushed = False

    async def execute(self, stmt):
        result = MagicMock()
        key = None
        for lane, scope in self._store:
            result.scalar_one_or_none = MagicMock(return_value=self._store[(lane, scope)])
            return result
        result.scalar_one_or_none = MagicMock(return_value=None)
        return result

    def add(self, obj):
        if isinstance(obj, LaneBudget):
            self._store[(obj.lane, obj.scope)] = obj

    async def flush(self):
        self._flushed = True


class FakeRedis:
    def __init__(self):
        self._queues: dict[str, list[str]] = {}

    async def lpush(self, key, value):
        self._queues.setdefault(key, []).insert(0, value)

    async def rpop(self, key):
        lst = self._queues.get(key, [])
        return lst.pop() if lst else None


class TestBudgetChecks:
    @pytest.fixture
    def budget(self):
        b = LaneBudget(
            id=uuid.uuid4(),
            lane="discovery",
            scope="global",
            daily_limit=100,
            hourly_limit=20,
            used_today=0,
            used_this_hour=0,
            daily_reset_at=datetime.now(timezone.utc),
            hourly_reset_at=datetime.now(timezone.utc),
            hard_pause=False,
        )
        return b

    @pytest.mark.asyncio
    async def test_check_within_budget(self, budget):
        db = FakeDB()
        db._store[("discovery", "global")] = budget
        redis = FakeRedis()
        svc = LaneBudgetService(db, redis)
        assert await svc.check_budget("discovery") is True

    @pytest.mark.asyncio
    async def test_check_paused_returns_false(self, budget):
        budget.hard_pause = True
        db = FakeDB()
        db._store[("discovery", "global")] = budget
        redis = FakeRedis()
        svc = LaneBudgetService(db, redis)
        assert await svc.check_budget("discovery") is False

    @pytest.mark.asyncio
    async def test_consume_increments_counters(self, budget):
        db = FakeDB()
        db._store[("discovery", "global")] = budget
        redis = FakeRedis()
        svc = LaneBudgetService(db, redis)
        await svc.consume("discovery", "global", 5)
        assert budget.used_today == 5
        assert budget.used_this_hour == 5

    @pytest.mark.asyncio
    async def test_consume_raises_when_daily_exhausted(self, budget):
        budget.used_today = 99
        db = FakeDB()
        db._store[("discovery", "global")] = budget
        redis = FakeRedis()
        svc = LaneBudgetService(db, redis)
        with pytest.raises(BudgetExhausted) as exc_info:
            await svc.consume("discovery", "global", 5)
        assert "daily" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_consume_raises_when_hourly_exhausted(self, budget):
        budget.used_this_hour = 19
        db = FakeDB()
        db._store[("discovery", "global")] = budget
        redis = FakeRedis()
        svc = LaneBudgetService(db, redis)
        with pytest.raises(BudgetExhausted) as exc_info:
            await svc.consume("discovery", "global", 5)
        assert "hourly" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_daily_reset(self, budget):
        budget.daily_reset_at = datetime.now(timezone.utc) - timedelta(days=1)
        budget.used_today = 50
        db = FakeDB()
        db._store[("discovery", "global")] = budget
        redis = FakeRedis()
        svc = LaneBudgetService(db, redis)
        assert await svc.check_budget("discovery") is True
        assert budget.used_today == 0

    @pytest.mark.asyncio
    async def test_hourly_reset(self, budget):
        budget.hourly_reset_at = datetime.now(timezone.utc) - timedelta(hours=2)
        budget.used_this_hour = 20
        db = FakeDB()
        db._store[("discovery", "global")] = budget
        redis = FakeRedis()
        svc = LaneBudgetService(db, redis)
        assert await svc.check_budget("discovery") is True
        assert budget.used_this_hour == 0


class TestQueueOperations:
    @pytest.mark.asyncio
    async def test_enqueue_and_promote(self):
        db = FakeDB()
        budget = LaneBudget(
            id=uuid.uuid4(),
            lane="discovery",
            scope="global",
            daily_limit=100,
            hourly_limit=20,
            used_today=0,
            used_this_hour=0,
            daily_reset_at=datetime.now(timezone.utc),
            hourly_reset_at=datetime.now(timezone.utc),
            hard_pause=False,
        )
        db._store[("discovery", "global")] = budget
        redis = FakeRedis()
        svc = LaneBudgetService(db, redis)

        await svc.enqueue("discovery.raw", '{"domain":"test.com"}')
        result = await svc.try_promote("discovery.raw", "discovery.enriched", "discovery")
        assert result is True
        assert budget.used_today == 1

    @pytest.mark.asyncio
    async def test_promote_empty_queue(self):
        db = FakeDB()
        budget = LaneBudget(
            id=uuid.uuid4(),
            lane="discovery",
            scope="global",
            daily_limit=100,
            hourly_limit=20,
            used_today=0,
            used_this_hour=0,
            daily_reset_at=datetime.now(timezone.utc),
            hourly_reset_at=datetime.now(timezone.utc),
            hard_pause=False,
        )
        db._store[("discovery", "global")] = budget
        redis = FakeRedis()
        svc = LaneBudgetService(db, redis)

        result = await svc.try_promote("discovery.raw", "discovery.enriched", "discovery")
        assert result is False
