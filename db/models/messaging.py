"""DATA-003: Campaigns, threads, messages, replies, and policy decisions."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.models.base import Base, TimestampMixin, UUIDPrimaryKey


class Campaign(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "campaigns"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    lane: Mapped[str] = mapped_column(String(30), nullable=False, default="contact")
    active: Mapped[bool] = mapped_column(default=True, nullable=False)
    config: Mapped[Optional[dict]] = mapped_column(JSONB)


class MessageThread(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "message_threads"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    contact_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contacts.id")
    )
    campaign_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campaigns.id")
    )
    subject: Mapped[Optional[str]] = mapped_column(String(1000))
    thread_status: Mapped[str] = mapped_column(String(30), nullable=False, default="active")


class Message(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "messages"

    thread_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("message_threads.id"), nullable=False, index=True
    )
    direction: Mapped[str] = mapped_column(String(10), nullable=False)
    subject: Mapped[Optional[str]] = mapped_column(String(1000))
    body_text: Mapped[Optional[str]] = mapped_column(Text)
    provider_message_id: Mapped[Optional[str]] = mapped_column(String(500), index=True)
    payload_hash: Mapped[Optional[str]] = mapped_column(String(64))
    mailbox_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=True))
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    delivery_status: Mapped[Optional[str]] = mapped_column(String(30))
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(200), unique=True)
    trigger_facts_used: Mapped[Optional[dict]] = mapped_column(JSONB)
    variant_type: Mapped[Optional[str]] = mapped_column(String(50))


class ReplyEvent(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "reply_events"

    message_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("messages.id"), nullable=False, index=True
    )
    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    classification: Mapped[str] = mapped_column(String(30), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    reasoning_summary: Mapped[Optional[str]] = mapped_column(Text)
    next_action: Mapped[Optional[str]] = mapped_column(String(50))
    cleaned_body: Mapped[Optional[str]] = mapped_column(Text)
    raw_body: Mapped[Optional[str]] = mapped_column(Text)


class PolicyDecision(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "policy_decisions"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    verdict: Mapped[str] = mapped_column(String(10), nullable=False)
    reasons: Mapped[Optional[dict]] = mapped_column(JSONB)
    rule_hits: Mapped[Optional[dict]] = mapped_column(JSONB)
    explanation: Mapped[Optional[str]] = mapped_column(Text)
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(200), unique=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
