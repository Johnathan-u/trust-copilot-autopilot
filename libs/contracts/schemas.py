"""PLAT-002: Shared Pydantic schemas — DTOs for API and inter-service communication."""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from db.models.enums import AccountState, Lane, PolicyVerdict, ReplyClassification


class AccountDTO(BaseModel):
    id: uuid.UUID
    domain: str
    company_name: Optional[str] = None
    state: AccountState
    state_changed_at: datetime
    version: int = 1

    model_config = {"from_attributes": True}


class ContactDTO(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    email: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    confidence: Optional[float] = None

    model_config = {"from_attributes": True}


class ScoreDTO(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    icp_score: Optional[float] = None
    pain_score: Optional[float] = None
    freshness_score: Optional[float] = None
    contact_score: Optional[float] = None
    explanation: Optional[str] = None

    model_config = {"from_attributes": True}


class BudgetDTO(BaseModel):
    lane: str
    scope: str = "global"
    daily_limit: int
    hourly_limit: int
    used_today: int
    used_this_hour: int
    hard_pause: bool

    model_config = {"from_attributes": True}


class TransitionRequest(BaseModel):
    target_state: AccountState
    actor: str = "system"
    detail: Optional[dict] = None
    idempotency_key: Optional[str] = None


class PolicyDecisionDTO(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    verdict: PolicyVerdict
    reasons: Optional[dict] = None
    explanation: Optional[str] = None

    model_config = {"from_attributes": True}


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
    postgres: bool = False
    redis: bool = False
    features: dict[str, bool] = {}
