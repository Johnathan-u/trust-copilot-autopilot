"""DATA-003 + SIE-001: Signal storage — raw (append-only) and normalized."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.models.base import Base, TimestampMixin, UUIDPrimaryKey


class Signal(Base, UUIDPrimaryKey, TimestampMixin):
    """Legacy signal table from DATA-003 — kept for state machine compatibility."""

    __tablename__ = "signals"

    account_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), index=True
    )
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    source_url: Mapped[Optional[str]] = mapped_column(String(2000))
    signal_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    raw_text: Mapped[Optional[str]] = mapped_column(Text)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class RawSignal(Base, UUIDPrimaryKey, TimestampMixin):
    """SIE-001: Append-only raw signal ingestion table."""

    __tablename__ = "raw_signals"

    source_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    source_url: Mapped[str] = mapped_column(String(2000), nullable=False)
    discovered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    page_type: Mapped[Optional[str]] = mapped_column(String(50))
    candidate_company_name: Mapped[Optional[str]] = mapped_column(String(500))
    candidate_domain: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    raw_text: Mapped[Optional[str]] = mapped_column(Text)
    extraction_hints: Mapped[Optional[dict]] = mapped_column(JSONB)
    content_hash: Mapped[Optional[str]] = mapped_column(String(64), index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)


class NormalizedSignal(Base, UUIDPrimaryKey, TimestampMixin):
    """SIE-001 / SIE-002: Typed, validated signal linked to an account."""

    __tablename__ = "normalized_signals"

    raw_signal_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("raw_signals.id"), index=True
    )
    account_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), index=True
    )
    signal_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    evidence_kind: Mapped[str] = mapped_column(String(30), nullable=False)
    evidence_text: Mapped[Optional[str]] = mapped_column(Text)
    evidence_url: Mapped[Optional[str]] = mapped_column(String(2000))
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    source_type: Mapped[Optional[str]] = mapped_column(String(50))
    freshness_days: Mapped[Optional[int]] = mapped_column(Integer)
    trigger_category: Mapped[Optional[str]] = mapped_column(String(20))
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
