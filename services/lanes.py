"""ARC-001: Lane budget service — gates promotions between discovery/qualification/contact."""

from datetime import datetime, timezone

import redis.asyncio as aioredis
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.lanes import LaneBudget

QUEUE_NAMES = {
    "discovery.raw": "queue:discovery:raw",
    "discovery.enriched": "queue:discovery:enriched",
    "contact.ready": "queue:contact:ready",
    "contact.send": "queue:contact:send",
}


class BudgetExhausted(Exception):
    def __init__(self, lane: str, scope: str, kind: str):
        self.lane = lane
        self.scope = scope
        self.kind = kind
        super().__init__(f"{lane}/{scope} {kind} budget exhausted")


class LaneBudgetService:
    def __init__(self, db: AsyncSession, redis: aioredis.Redis):
        self.db = db
        self.redis = redis

    async def get_or_create_budget(
        self, lane: str, scope: str = "global"
    ) -> LaneBudget:
        stmt = select(LaneBudget).where(
            LaneBudget.lane == lane, LaneBudget.scope == scope
        )
        result = await self.db.execute(stmt)
        budget = result.scalar_one_or_none()
        if budget is None:
            budget = LaneBudget(lane=lane, scope=scope)
            self.db.add(budget)
            await self.db.flush()
        return budget

    async def check_budget(self, lane: str, scope: str = "global") -> bool:
        budget = await self.get_or_create_budget(lane, scope)
        if budget.hard_pause:
            return False
        now = datetime.now(timezone.utc)
        await self._maybe_reset(budget, now)
        if budget.used_today >= budget.daily_limit:
            return False
        if budget.used_this_hour >= budget.hourly_limit:
            return False
        return True

    async def consume(self, lane: str, scope: str = "global", count: int = 1) -> None:
        """Consume budget units. Raises BudgetExhausted if limits are hit."""
        budget = await self.get_or_create_budget(lane, scope)
        if budget.hard_pause:
            raise BudgetExhausted(lane, scope, "paused")
        now = datetime.now(timezone.utc)
        await self._maybe_reset(budget, now)
        if budget.used_today + count > budget.daily_limit:
            raise BudgetExhausted(lane, scope, "daily")
        if budget.used_this_hour + count > budget.hourly_limit:
            raise BudgetExhausted(lane, scope, "hourly")
        budget.used_today += count
        budget.used_this_hour += count
        await self.db.flush()

    async def _maybe_reset(self, budget: LaneBudget, now: datetime) -> None:
        if budget.daily_reset_at.date() < now.date():
            budget.used_today = 0
            budget.daily_reset_at = now
        if (now - budget.hourly_reset_at).total_seconds() >= 3600:
            budget.used_this_hour = 0
            budget.hourly_reset_at = now
        await self.db.flush()

    async def set_pause(self, lane: str, paused: bool, scope: str = "global") -> None:
        budget = await self.get_or_create_budget(lane, scope)
        budget.hard_pause = paused
        await self.db.flush()

    async def enqueue(self, queue_key: str, payload: str) -> None:
        redis_key = QUEUE_NAMES.get(queue_key, f"queue:{queue_key}")
        await self.redis.lpush(redis_key, payload)

    async def try_promote(
        self, from_queue: str, to_queue: str, lane: str, scope: str = "global"
    ) -> bool:
        """Attempt to move an item from one queue to the next, consuming budget."""
        if not await self.check_budget(lane, scope):
            return False
        item = await self.redis.rpop(QUEUE_NAMES.get(from_queue, f"queue:{from_queue}"))
        if item is None:
            return False
        await self.consume(lane, scope)
        await self.enqueue(to_queue, item if isinstance(item, str) else item.decode())
        return True
