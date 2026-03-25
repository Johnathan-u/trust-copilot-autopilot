"""SIE-005: Event topics and worker contracts — defines the async event bus."""

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class EventEnvelope(BaseModel):
    """Standard wrapper for all async events published through the outbox."""

    event_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    event_type: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now())
    source_worker: str
    payload: dict[str, Any]
    idempotency_key: str
    version: int = 1


# ── Discovery lane events ──

class SignalDiscovered(BaseModel):
    raw_signal_id: uuid.UUID
    source_type: str
    source_url: str
    candidate_domain: Optional[str] = None

    @property
    def event_type(self) -> str:
        return "signal.discovered"


class SignalNormalized(BaseModel):
    normalized_signal_id: uuid.UUID
    account_id: uuid.UUID
    signal_type: str
    confidence: float

    @property
    def event_type(self) -> str:
        return "signal.normalized"


class AccountFused(BaseModel):
    account_id: uuid.UUID
    signal_count: int
    top_trigger: Optional[str] = None

    @property
    def event_type(self) -> str:
        return "account.fused"


# ── Qualification lane events ──

class AccountScored(BaseModel):
    account_id: uuid.UUID
    icp_score: float
    pain_score: float
    freshness_score: float

    @property
    def event_type(self) -> str:
        return "account.scored"


class ContactDecided(BaseModel):
    account_id: uuid.UUID
    decision_id: uuid.UUID
    verdict: str
    priority_tier: Optional[int] = None

    @property
    def event_type(self) -> str:
        return "contact.decided"


# ── Contact lane events ──

class MessageSent(BaseModel):
    message_id: uuid.UUID
    thread_id: uuid.UUID
    account_id: uuid.UUID
    mailbox_id: uuid.UUID

    @property
    def event_type(self) -> str:
        return "message.sent"


class ReplyReceived(BaseModel):
    reply_event_id: uuid.UUID
    message_id: uuid.UUID
    account_id: uuid.UUID
    classification: str

    @property
    def event_type(self) -> str:
        return "reply.received"


# ── Post-reply events ──

class IntakeOpened(BaseModel):
    intake_room_id: uuid.UUID
    account_id: uuid.UUID
    token: str

    @property
    def event_type(self) -> str:
        return "intake.opened"


class FulfillmentCompleted(BaseModel):
    job_id: uuid.UUID
    account_id: uuid.UUID
    proof_pack_id: uuid.UUID

    @property
    def event_type(self) -> str:
        return "fulfillment.completed"


class PaymentReceived(BaseModel):
    checkout_session_id: uuid.UUID
    account_id: uuid.UUID
    amount_cents: int

    @property
    def event_type(self) -> str:
        return "payment.received"


TOPIC_REGISTRY: dict[str, type[BaseModel]] = {
    "signal.discovered": SignalDiscovered,
    "signal.normalized": SignalNormalized,
    "account.fused": AccountFused,
    "account.scored": AccountScored,
    "contact.decided": ContactDecided,
    "message.sent": MessageSent,
    "reply.received": ReplyReceived,
    "intake.opened": IntakeOpened,
    "fulfillment.completed": FulfillmentCompleted,
    "payment.received": PaymentReceived,
}
