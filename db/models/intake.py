"""DATA-003: Intake rooms, uploads, fulfillment jobs, proof packs."""

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.models.base import Base, TimestampMixin, UUIDPrimaryKey


class IntakeRoom(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "intake_rooms"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    token: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="open")
    trust_note: Mapped[Optional[str]] = mapped_column(Text)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(200), unique=True)


class Upload(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "uploads"

    room_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("intake_rooms.id"), nullable=False, index=True
    )
    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    content_type: Mapped[Optional[str]] = mapped_column(String(200))
    size_bytes: Mapped[Optional[int]] = mapped_column(BigInteger)
    storage_key: Mapped[str] = mapped_column(String(1000), nullable=False)
    content_hash: Mapped[Optional[str]] = mapped_column(String(64))
    uploader_context: Mapped[Optional[dict]] = mapped_column(JSONB)


class FulfillmentJob(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "fulfillment_jobs"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    room_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("intake_rooms.id")
    )
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending")
    run_metadata: Mapped[Optional[dict]] = mapped_column(JSONB)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(200), unique=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)


class ProofPack(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "proof_packs"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    job_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fulfillment_jobs.id"), nullable=False
    )
    artifact_url: Mapped[Optional[str]] = mapped_column(String(2000))
    summary_metrics: Mapped[Optional[dict]] = mapped_column(JSONB)
    answered_pct: Mapped[Optional[float]] = mapped_column()
    evidence_gaps: Mapped[Optional[dict]] = mapped_column(JSONB)
    delivery_email_sent: Mapped[bool] = mapped_column(default=False, nullable=False)
