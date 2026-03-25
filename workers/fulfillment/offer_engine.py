"""OFFER-304: Fixed-price offer engine — config-driven plans with eligibility,
credit rules, and expiration. No custom quotes in v1."""

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Optional


@dataclass(frozen=True)
class OfferPlan:
    plan_id: str
    name: str
    price_cents: int
    currency: str = "usd"
    billing_type: str = "one_time"  # "one_time" | "monthly" | "annual"
    credit_to_subscription: bool = False
    credit_amount_cents: int = 0
    expiry_days: int = 14
    min_icp_score: float = 0.0
    min_answered_pct: float = 0.0
    max_deal_tier: str = "enterprise"


PLANS: dict[str, OfferPlan] = {
    "pilot_one_time": OfferPlan(
        plan_id="pilot_one_time", name="Pilot — One Questionnaire",
        price_cents=29900, billing_type="one_time",
        credit_to_subscription=True, credit_amount_cents=29900,
        expiry_days=14, min_answered_pct=50.0,
    ),
    "pro_monthly": OfferPlan(
        plan_id="pro_monthly", name="Pro — Monthly",
        price_cents=49900, billing_type="monthly",
        expiry_days=7, min_icp_score=0.4,
    ),
    "business_monthly": OfferPlan(
        plan_id="business_monthly", name="Business — Monthly",
        price_cents=99900, billing_type="monthly",
        expiry_days=7, min_icp_score=0.5,
    ),
    "enterprise_annual": OfferPlan(
        plan_id="enterprise_annual", name="Enterprise — Annual",
        price_cents=250000, billing_type="annual",
        expiry_days=30, min_icp_score=0.6, max_deal_tier="enterprise",
    ),
}


@dataclass
class OfferSelection:
    plan: OfferPlan
    expires_at: datetime
    reasoning: str
    eligible: bool = True


def select_offer(
    deal_tier: str,
    icp_score: float,
    answered_pct: float = 0.0,
    has_proof: bool = False,
) -> OfferSelection:
    if has_proof and answered_pct >= 50.0:
        plan = PLANS["pilot_one_time"]
        reasoning = f"Proof delivered ({answered_pct:.0f}% answered) — pilot offer with subscription credit"
    elif deal_tier in ("business", "enterprise") and icp_score >= 0.6:
        if deal_tier == "enterprise":
            plan = PLANS["enterprise_annual"]
            reasoning = "Enterprise-tier account with strong ICP fit"
        else:
            plan = PLANS["business_monthly"]
            reasoning = "Business-tier account with good ICP fit"
    elif icp_score >= 0.4:
        plan = PLANS["pro_monthly"]
        reasoning = "Good ICP fit — Pro plan"
    else:
        plan = PLANS["pilot_one_time"]
        reasoning = "Default pilot offer for initial engagement"

    eligible = (
        icp_score >= plan.min_icp_score
        and answered_pct >= plan.min_answered_pct
    )

    return OfferSelection(
        plan=plan,
        expires_at=datetime.now(timezone.utc) + timedelta(days=plan.expiry_days),
        reasoning=reasoning,
        eligible=eligible,
    )
