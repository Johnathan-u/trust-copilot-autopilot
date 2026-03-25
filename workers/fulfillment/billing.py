"""BILL-305: Stripe checkout integration — checkout sessions, webhook-driven
state changes, and replay-safe activation triggers."""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class CheckoutSession:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    account_id: str = ""
    plan_id: str = ""
    stripe_session_id: str = ""
    stripe_customer_id: str = ""
    amount_cents: int = 0
    currency: str = "usd"
    status: str = "pending"     # "pending" | "paid" | "failed" | "expired"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    paid_at: Optional[datetime] = None
    idempotency_key: str = ""


@dataclass
class SubscriptionRecord:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    account_id: str = ""
    stripe_subscription_id: str = ""
    stripe_customer_id: str = ""
    plan_id: str = ""
    status: str = "active"
    current_period_end: Optional[datetime] = None


@dataclass
class ActivationTask:
    account_id: str
    checkout_id: str
    plan_id: str
    triggered_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class BillingService:
    def __init__(self) -> None:
        self._sessions: dict[str, CheckoutSession] = {}
        self._subscriptions: dict[str, SubscriptionRecord] = {}
        self._activations: list[ActivationTask] = []
        self._processed_events: set[str] = set()

    def create_checkout(self, account_id: str, plan_id: str,
                        amount_cents: int, currency: str = "usd") -> CheckoutSession:
        idem_key = f"checkout:{account_id}:{plan_id}"
        for s in self._sessions.values():
            if s.idempotency_key == idem_key and s.status == "pending":
                return s

        session = CheckoutSession(
            account_id=account_id, plan_id=plan_id,
            amount_cents=amount_cents, currency=currency,
            stripe_session_id=f"cs_{uuid.uuid4().hex[:16]}",
            stripe_customer_id=f"cus_{uuid.uuid4().hex[:12]}",
            idempotency_key=idem_key,
        )
        self._sessions[session.id] = session
        return session

    def process_webhook(self, event_id: str, event_type: str,
                        session_id: str, **data) -> tuple[bool, str]:
        if event_id in self._processed_events:
            return False, "duplicate_event"
        self._processed_events.add(event_id)

        session = None
        for s in self._sessions.values():
            if s.stripe_session_id == session_id:
                session = s
                break

        if not session:
            return False, "session_not_found"

        if event_type == "checkout.session.completed":
            session.status = "paid"
            session.paid_at = datetime.now(timezone.utc)

            if data.get("subscription_id"):
                sub = SubscriptionRecord(
                    account_id=session.account_id,
                    stripe_subscription_id=data["subscription_id"],
                    stripe_customer_id=session.stripe_customer_id,
                    plan_id=session.plan_id,
                )
                self._subscriptions[sub.id] = sub

            self._activations.append(ActivationTask(
                account_id=session.account_id,
                checkout_id=session.id,
                plan_id=session.plan_id,
            ))
            return True, "payment_processed"

        elif event_type == "checkout.session.expired":
            session.status = "expired"
            return True, "session_expired"

        return False, f"unhandled_event:{event_type}"

    def pending_activations(self) -> list[ActivationTask]:
        return list(self._activations)

    def get_session(self, session_id: str) -> Optional[CheckoutSession]:
        return self._sessions.get(session_id)
