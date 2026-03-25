"""SIE-601: Lead-quality outcome capture — records whether decisions were
good by linking outcomes back to account and decision versions."""

import enum
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


class OutcomeType(str, enum.Enum):
    DELIVERED = "delivered"
    OPENED = "opened"
    REPLIED_POSITIVE = "replied_positive"
    REPLIED_NEGATIVE = "replied_negative"
    UPLOADED = "uploaded"
    PROOF_DELIVERED = "proof_delivered"
    PAID = "paid"
    BOUNCED = "bounced"
    UNSUBSCRIBED = "unsubscribed"
    IGNORED = "ignored"


@dataclass
class OutcomeEvent:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    account_id: str = ""
    contact_decision_id: str = ""
    decision_version: int = 0
    outcome_type: OutcomeType = OutcomeType.IGNORED
    occurred_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict = field(default_factory=dict)


class OutcomeStore:
    def __init__(self) -> None:
        self._events: list[OutcomeEvent] = []

    def record(self, account_id: str, decision_id: str,
               outcome_type: OutcomeType, decision_version: int = 0,
               metadata: dict = None) -> OutcomeEvent:
        event = OutcomeEvent(
            account_id=account_id,
            contact_decision_id=decision_id,
            decision_version=decision_version,
            outcome_type=outcome_type,
            metadata=metadata or {},
        )
        self._events.append(event)
        return event

    def for_account(self, account_id: str) -> list[OutcomeEvent]:
        return [e for e in self._events if e.account_id == account_id]

    def for_decision(self, decision_id: str) -> list[OutcomeEvent]:
        return [e for e in self._events if e.contact_decision_id == decision_id]

    def conversion_funnel(self) -> dict[str, int]:
        counts: dict[str, int] = {}
        for e in self._events:
            counts[e.outcome_type.value] = counts.get(e.outcome_type.value, 0) + 1
        return counts
