"""Health check endpoint — reports postgres, redis, and feature flag status."""

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.deps import get_redis
from db.session import get_db
from libs.contracts.schemas import HealthResponse
from services.config import get_settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health(
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
):
    settings = get_settings()

    pg_ok = False
    try:
        await db.execute(text("SELECT 1"))
        pg_ok = True
    except Exception:
        pass

    redis_ok = False
    try:
        await redis.ping()
        redis_ok = True
    except Exception:
        pass

    return HealthResponse(
        status="ok" if (pg_ok and redis_ok) else "degraded",
        postgres=pg_ok,
        redis=redis_ok,
        features={
            "discovery": settings.discovery_enabled,
            "contact": settings.contact_enabled,
            "billing": settings.billing_enabled,
            "trust_copilot": settings.trust_copilot_enabled,
        },
    )
