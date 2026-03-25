"""ARC-001: Lane budget management endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.deps import get_lane_service
from db.session import get_db
from libs.contracts.schemas import BudgetDTO
from services.lanes import BudgetExhausted, LaneBudgetService

router = APIRouter()


class SetBudgetRequest(BaseModel):
    lane: str
    scope: str = "global"
    daily_limit: int = 10000
    hourly_limit: int = 1000


class PauseRequest(BaseModel):
    lane: str
    paused: bool
    scope: str = "global"


@router.get("/{lane}", response_model=BudgetDTO)
async def get_budget(
    lane: str,
    scope: str = "global",
    svc: LaneBudgetService = Depends(get_lane_service),
    db: AsyncSession = Depends(get_db),
):
    budget = await svc.get_or_create_budget(lane, scope)
    await db.commit()
    return budget


@router.put("/", response_model=BudgetDTO)
async def set_budget(
    req: SetBudgetRequest,
    svc: LaneBudgetService = Depends(get_lane_service),
    db: AsyncSession = Depends(get_db),
):
    budget = await svc.get_or_create_budget(req.lane, req.scope)
    budget.daily_limit = req.daily_limit
    budget.hourly_limit = req.hourly_limit
    await db.commit()
    return budget


@router.post("/pause")
async def pause_lane(
    req: PauseRequest,
    svc: LaneBudgetService = Depends(get_lane_service),
    db: AsyncSession = Depends(get_db),
):
    await svc.set_pause(req.lane, req.paused, req.scope)
    await db.commit()
    return {"ok": True, "lane": req.lane, "paused": req.paused}


@router.post("/{lane}/consume")
async def consume_budget(
    lane: str,
    count: int = 1,
    scope: str = "global",
    svc: LaneBudgetService = Depends(get_lane_service),
    db: AsyncSession = Depends(get_db),
):
    try:
        await svc.consume(lane, scope, count)
        await db.commit()
        return {"ok": True, "consumed": count}
    except BudgetExhausted as e:
        raise HTTPException(status_code=429, detail=str(e))
