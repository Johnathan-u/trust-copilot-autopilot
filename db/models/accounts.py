"""DATA-003: Core account and contact entities."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base, TimestampMixin, UUIDPrimaryKey
from db.models.enums import AccountState


class Account(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "accounts"

    domain: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    company_name: Mapped[Optional[str]] = mapped_column(String(500))
    company_url: Mapped[Optional[str]] = mapped_column(String(2000))
    alternate_names: Mapped[Optional[dict]] = mapped_column(JSONB, default=list)
    root_domain: Mapped[Optional[str]] = mapped_column(String(255))

    state: Mapped[str] = mapped_column(
        String(30), nullable=False, default=AccountState.RAW_SIGNAL.value, index=True
    )
    state_changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    source_provenance: Mapped[Optional[str]] = mapped_column(String(100))
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    contacts = relationship("Contact", back_populates="account", lazy="selectin")
    scores = relationship("AccountScore", back_populates="account", lazy="selectin")


class Contact(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "contacts"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    email: Mapped[Optional[str]] = mapped_column(String(500), index=True)
    name: Mapped[Optional[str]] = mapped_column(String(500))
    role: Mapped[Optional[str]] = mapped_column(String(200))
    source_url: Mapped[Optional[str]] = mapped_column(String(2000))
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    contact_rank: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    evidence_span: Mapped[Optional[str]] = mapped_column(Text)
    email_type: Mapped[Optional[str]] = mapped_column(String(30))

    account = relationship("Account", back_populates="contacts")


class AccountScore(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "account_scores"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    icp_score: Mapped[Optional[float]] = mapped_column(Float)
    pain_score: Mapped[Optional[float]] = mapped_column(Float)
    freshness_score: Mapped[Optional[float]] = mapped_column(Float)
    contact_score: Mapped[Optional[float]] = mapped_column(Float)
    explanation: Mapped[Optional[str]] = mapped_column(Text)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    account = relationship("Account", back_populates="scores")


class BuyerCandidate(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "buyer_candidates"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(200), nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(500))
    source_url: Mapped[Optional[str]] = mapped_column(String(2000))
    evidence_span: Mapped[Optional[str]] = mapped_column(Text)
    contact_rank: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
