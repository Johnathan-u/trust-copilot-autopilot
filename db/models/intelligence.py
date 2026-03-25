"""SIE-001, SIE-003, SIE-004: Account intelligence — features, narratives, decisions, traces."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.models.base import Base, TimestampMixin, UUIDPrimaryKey


class AccountFeatureSnapshot(Base, UUIDPrimaryKey, TimestampMixin):
    """SIE-003: Versioned feature state for each account."""

    __tablename__ = "account_feature_snapshots"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    feature_version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    icp_fit: Mapped[Optional[float]] = mapped_column(Float)
    trigger_freshness: Mapped[Optional[float]] = mapped_column(Float)
    buyer_confidence: Mapped[Optional[float]] = mapped_column(Float)
    competitor_presence: Mapped[Optional[float]] = mapped_column(Float)
    deal_value_estimate: Mapped[Optional[float]] = mapped_column(Float)
    outreach_recommendation: Mapped[Optional[str]] = mapped_column(String(50))

    top_triggers: Mapped[Optional[dict]] = mapped_column(JSONB)
    negatives: Mapped[Optional[dict]] = mapped_column(JSONB)
    evidence_ids: Mapped[Optional[dict]] = mapped_column(JSONB)
    fused_state: Mapped[Optional[dict]] = mapped_column(JSONB)

    why_now_score: Mapped[Optional[float]] = mapped_column(Float)
    pain_type: Mapped[Optional[str]] = mapped_column(String(50))
    primary_segment: Mapped[Optional[str]] = mapped_column(String(50))
    size_band: Mapped[Optional[str]] = mapped_column(String(30))
    industry: Mapped[Optional[str]] = mapped_column(String(100))

    __table_args__ = ({"comment": "Versioned feature snapshots for downstream scoring"},)


class AccountNarrative(Base, UUIDPrimaryKey, TimestampMixin):
    """SIE-001: Grounded narrative summary per account."""

    __tablename__ = "account_narratives"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    narrative: Mapped[str] = mapped_column(Text, nullable=False)
    grounding_facts: Mapped[Optional[dict]] = mapped_column(JSONB)
    forbidden_claims: Mapped[Optional[dict]] = mapped_column(JSONB)
    cited_evidence_ids: Mapped[Optional[dict]] = mapped_column(JSONB)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)


class BuyerHypothesis(Base, UUIDPrimaryKey, TimestampMixin):
    """SIE-001: Buyer hypothesis linked to account."""

    __tablename__ = "buyer_hypotheses"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(200), nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(500))
    rationale: Mapped[Optional[str]] = mapped_column(Text)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    fallback_rank: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    pain_role_fit: Mapped[Optional[str]] = mapped_column(Text)
    evidence_ids: Mapped[Optional[dict]] = mapped_column(JSONB)


class ContactDecision(Base, UUIDPrimaryKey, TimestampMixin):
    """SIE-001: Contact / no-contact decision with reason codes."""

    __tablename__ = "contact_decisions"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    priority_tier: Mapped[Optional[int]] = mapped_column(Integer)
    target_role: Mapped[Optional[str]] = mapped_column(String(200))
    send_window_hint: Mapped[Optional[str]] = mapped_column(String(50))
    reason_codes: Mapped[Optional[dict]] = mapped_column(JSONB)
    explanation: Mapped[Optional[str]] = mapped_column(Text)
    feature_snapshot_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("account_feature_snapshots.id")
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)


class DecisionTrace(Base, UUIDPrimaryKey, TimestampMixin):
    """SIE-004: Machine-readable trace for every important decision."""

    __tablename__ = "decision_traces"

    decision_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contact_decisions.id"), nullable=False, index=True
    )
    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True
    )
    input_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    rule_hits: Mapped[Optional[dict]] = mapped_column(JSONB)
    model_scores: Mapped[Optional[dict]] = mapped_column(JSONB)
    final_reason_codes: Mapped[Optional[dict]] = mapped_column(JSONB)
    output_verdict: Mapped[str] = mapped_column(String(20), nullable=False)
    replay_diff: Mapped[Optional[dict]] = mapped_column(JSONB)
