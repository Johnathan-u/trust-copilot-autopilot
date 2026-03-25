"""DATA-003: Account CRUD and state transition endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.deps import get_state_machine
from db.models.accounts import Account
from db.session import get_db
from libs.contracts.schemas import AccountDTO, TransitionRequest
from services.state_machine import InvalidTransition, StateMachine

router = APIRouter()


@router.get("/", response_model=list[AccountDTO])
async def list_accounts(
    state: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Account).offset(offset).limit(limit)
    if state:
        stmt = stmt.where(Account.state == state)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{account_id}", response_model=AccountDTO)
async def get_account(
    account_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    account = await db.get(Account, account_id)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.post("/{account_id}/transition", response_model=AccountDTO)
async def transition_account(
    account_id: uuid.UUID,
    req: TransitionRequest,
    sm: StateMachine = Depends(get_state_machine),
    db: AsyncSession = Depends(get_db),
):
    try:
        account = await sm.transition_by_id(
            str(account_id),
            req.target_state,
            actor=req.actor,
            detail=req.detail,
            idempotency_key=req.idempotency_key,
        )
        await db.commit()
        return account
    except ValueError:
        raise HTTPException(status_code=404, detail="Account not found")
    except InvalidTransition as e:
        raise HTTPException(status_code=409, detail=str(e))
