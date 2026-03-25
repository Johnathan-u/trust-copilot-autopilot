"""Dependency injection for FastAPI routes."""

import redis.asyncio as aioredis
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db
from services.config import get_settings
from services.lanes import LaneBudgetService
from services.state_machine import StateMachine

_redis_pool = None


async def get_redis() -> aioredis.Redis:
    global _redis_pool
    if _redis_pool is None:
        settings = get_settings()
        _redis_pool = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _redis_pool


async def get_lane_service(
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
) -> LaneBudgetService:
    return LaneBudgetService(db, redis)


async def get_state_machine(
    db: AsyncSession = Depends(get_db),
) -> StateMachine:
    return StateMachine(db)
