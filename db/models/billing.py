"""DATA-003: Offers, checkout sessions, subscriptions, workspace provisioning."""

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.models.base import Base, TimestampMixin, UUIDPrimaryKey


class Offer(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "offers"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    plan_type: Mapped[str] = mapped_column(String(50), nullable=False)
    price_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="usd")
    credit_to_subscription: Mapped[bool] = mapped_column(default=False, nullable=False)
    expiry_days: Mapped[int] = mapped_column(Integer, nullable=False, default=14)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    explanation: Mapped[Optional[str]] = mapped_column(Text)


class CheckoutSession(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "checkout_sessions"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    offer_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("offers.id"), nullable=False
    )
    stripe_session_id: Mapped[Optional[str]] = mapped_column(String(500), unique=True, index=True)
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(500))
    amount_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="usd")
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending")
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(200), unique=True)


class Subscription(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "subscriptions"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(
        String(500), unique=True, index=True
    )
    stripe_invoice_id: Mapped[Optional[str]] = mapped_column(String(500))
    plan_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="active")
    current_period_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))


class WorkspaceProvision(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "workspace_provisions"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    workspace_name: Mapped[Optional[str]] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending")
    provisioned_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    settings: Mapped[Optional[dict]] = mapped_column(JSONB)
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(200), unique=True)
