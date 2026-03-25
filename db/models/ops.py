"""OPS-004: Audit events (append-only), outbox events, and suppression entries."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.models.base import Base, TimestampMixin, UUIDPrimaryKey


class AuditEvent(Base, UUIDPrimaryKey):
    """Append-only audit log. No updates allowed."""

    __tablename__ = "audit_events"

    account_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), index=True
    )
    actor: Mapped[str] = mapped_column(String(100), nullable=False, default="system")
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    entity_type: Mapped[Optional[str]] = mapped_column(String(50))
    entity_id: Mapped[Optional[str]] = mapped_column(String(100))
    old_state: Mapped[Optional[str]] = mapped_column(String(50))
    new_state: Mapped[Optional[str]] = mapped_column(String(50))
    detail: Mapped[Optional[dict]] = mapped_column(JSONB)
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(200), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )


class OutboxEvent(Base, UUIDPrimaryKey, TimestampMixin):
    """Transactional outbox for side effects — send email, create checkout, etc."""

    __tablename__ = "outbox_events"

    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", index=True)
    claimed_by: Mapped[Optional[str]] = mapped_column(String(100))
    claimed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    last_error: Mapped[Optional[str]] = mapped_column(Text)
    idempotency_key: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)


class SuppressionEntry(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "suppression_entries"

    email: Mapped[Optional[str]] = mapped_column(String(500), index=True)
    domain: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    account_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), index=True
    )
    reason: Mapped[str] = mapped_column(String(50), nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False, default="system")
    notes: Mapped[Optional[str]] = mapped_column(Text)
