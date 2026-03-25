"""SIE-305: Deal tier and expected value estimator — predicts monthly plan fit
and lifetime value bracket from firmographics and monetization probability."""

from dataclasses import dataclass

from workers.qualification.firmographics import FirmographicEstimate
from workers.qualification.urgency import UrgencyScore


@dataclass
class DealValueEstimate:
    monthly_value_estimate: int     # cents
    ltv_bucket: str                 # "low" | "medium" | "high" | "enterprise"
    expected_value: int             # monthly × win_prob (cents)
    tier: str                       # "starter" | "pro" | "business" | "enterprise"
    explanation: str


SIZE_BAND_MRR = {
    "micro":      5_000,    # $50/mo
    "small":      20_000,   # $200/mo
    "mid":        50_000,   # $500/mo
    "growth":     100_000,  # $1000/mo
    "enterprise": 250_000,  # $2500/mo
    "unknown":    15_000,   # $150/mo default
}

LTV_MULTIPLIER = 24  # assume 24 month average lifetime

LTV_THRESHOLDS = [
    (500_000, "enterprise"),    # $5000+ LTV
    (200_000, "high"),          # $2000+ LTV
    (50_000,  "medium"),        # $500+ LTV
    (0,       "low"),
]

TIER_THRESHOLDS = [
    (200_000, "enterprise"),
    (80_000,  "business"),
    (30_000,  "pro"),
    (0,       "starter"),
]


def estimate_deal_value(
    firmographics: FirmographicEstimate,
    urgency: UrgencyScore,
) -> DealValueEstimate:
    base_mrr = SIZE_BAND_MRR.get(firmographics.size_band, 15_000)

    # Enterprise motion multiplier
    if firmographics.enterprise_motion >= 0.5:
        base_mrr = int(base_mrr * 1.3)

    # B2B multiplier
    if firmographics.is_b2b >= 0.7:
        base_mrr = int(base_mrr * 1.1)
    elif firmographics.is_b2b < 0.4:
        base_mrr = int(base_mrr * 0.6)

    monthly_value = base_mrr
    ltv = monthly_value * LTV_MULTIPLIER
    expected = int(monthly_value * urgency.monetization_prob)

    ltv_bucket = "low"
    for threshold, bucket in LTV_THRESHOLDS:
        if ltv >= threshold:
            ltv_bucket = bucket
            break

    tier = "starter"
    for threshold, t in TIER_THRESHOLDS:
        if monthly_value >= threshold:
            tier = t
            break

    return DealValueEstimate(
        monthly_value_estimate=monthly_value,
        ltv_bucket=ltv_bucket,
        expected_value=expected,
        tier=tier,
        explanation=(
            f"MRR=${monthly_value/100:.0f} ({firmographics.size_band}), "
            f"LTV=${ltv/100:.0f} ({ltv_bucket}), "
            f"EV=${expected/100:.0f} (win_prob={urgency.monetization_prob:.0%}), "
            f"tier={tier}"
        ),
    )
