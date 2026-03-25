"""SIE-303: ICP fit scoring — determines whether an account is in-bounds
for the product based on firmographics, signals, and pain."""

from dataclasses import dataclass, field

from workers.qualification.firmographics import FirmographicEstimate
from workers.qualification.pain_inference import PainInference, PainType


@dataclass
class ICPScore:
    score: float            # 0.0 – 1.0
    bucket: str             # "strong_fit" | "good_fit" | "marginal" | "out_of_bounds"
    matched_rules: list[str] = field(default_factory=list)
    penalties: list[str] = field(default_factory=list)
    explanation: str = ""


STRONG_THRESHOLD = 0.75
GOOD_THRESHOLD = 0.50
MARGINAL_THRESHOLD = 0.30


def score_icp(
    firmographics: FirmographicEstimate,
    pains: list[PainInference],
    has_negatives: bool = False,
    negative_weight: float = 0.0,
) -> ICPScore:
    score = 0.0
    rules: list[str] = []
    penalties: list[str] = []

    # B2B SaaS fit
    if firmographics.is_b2b >= 0.6:
        score += 0.20
        rules.append("b2b_fit")
    elif firmographics.is_b2b < 0.3:
        score -= 0.15
        penalties.append("likely_b2c")

    # Size band
    size_scores = {"micro": 0.05, "small": 0.15, "mid": 0.20, "growth": 0.18, "enterprise": 0.08}
    size_pts = size_scores.get(firmographics.size_band, 0.05)
    score += size_pts
    if size_pts >= 0.15:
        rules.append(f"size_{firmographics.size_band}")

    if firmographics.size_band == "enterprise":
        penalties.append("enterprise_may_not_need_product")

    # Enterprise motion
    if firmographics.enterprise_motion >= 0.3:
        score += 0.15
        rules.append("enterprise_motion")

    # Industry fit
    strong_industries = {"saas", "fintech", "healthtech", "devtools", "cybersecurity"}
    if firmographics.industry in strong_industries:
        score += 0.15
        rules.append(f"industry_{firmographics.industry}")
    elif firmographics.industry == "unknown":
        score += 0.05

    # Pain signal bonus
    if pains and pains[0].pain_type != PainType.UNKNOWN:
        best_pain = pains[0]
        pain_bonus = min(0.20, best_pain.confidence * 0.25)
        score += pain_bonus
        rules.append(f"pain_{best_pain.pain_type.value}")

    # Negative penalty
    if has_negatives:
        penalty = min(0.25, negative_weight * 0.3)
        score -= penalty
        penalties.append(f"negative_signals_penalty:{penalty:.2f}")

    score = max(0.0, min(1.0, score))

    if score >= STRONG_THRESHOLD:
        bucket = "strong_fit"
    elif score >= GOOD_THRESHOLD:
        bucket = "good_fit"
    elif score >= MARGINAL_THRESHOLD:
        bucket = "marginal"
    else:
        bucket = "out_of_bounds"

    return ICPScore(
        score=round(score, 3),
        bucket=bucket,
        matched_rules=rules,
        penalties=penalties,
        explanation=f"ICP={score:.0%} ({bucket}) | +rules: {', '.join(rules)} | -penalties: {', '.join(penalties) or 'none'}",
    )
