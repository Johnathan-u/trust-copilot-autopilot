"""SIE-002: Normalized signal contract — Pydantic models for typed signal exchange."""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from db.models.enums import EvidenceKind, SignalType, SourceType, TriggerCategory


class RawSignalIn(BaseModel):
    source_type: SourceType
    source_url: str = Field(..., max_length=2000)
    page_type: Optional[str] = None
    candidate_company_name: Optional[str] = None
    candidate_domain: Optional[str] = None
    raw_text: Optional[str] = None
    extraction_hints: Optional[dict] = None

    @field_validator("source_url")
    @classmethod
    def must_have_scheme(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("source_url must start with http:// or https://")
        return v


class NormalizedSignalOut(BaseModel):
    id: uuid.UUID
    raw_signal_id: Optional[uuid.UUID] = None
    account_id: Optional[uuid.UUID] = None
    signal_type: SignalType
    evidence_kind: EvidenceKind
    evidence_text: Optional[str] = None
    evidence_url: Optional[str] = None
    observed_at: datetime
    confidence: float = Field(..., ge=0.0, le=1.0)
    source_type: Optional[SourceType] = None
    freshness_days: Optional[int] = None
    trigger_category: Optional[TriggerCategory] = None
    version: int = 1

    model_config = {"from_attributes": True}


class SignalBatch(BaseModel):
    signals: list[NormalizedSignalOut]
    total: int
    has_more: bool = False


class SignalFilter(BaseModel):
    signal_types: Optional[list[SignalType]] = None
    source_types: Optional[list[SourceType]] = None
    trigger_categories: Optional[list[TriggerCategory]] = None
    min_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    max_freshness_days: Optional[int] = None
    account_id: Optional[uuid.UUID] = None
    limit: int = Field(default=50, le=200)
    offset: int = 0
