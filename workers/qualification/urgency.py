"""SIE-304: Urgency and monetization probability — separate scores for
timing (will they act now?) and conversion likelihood (will they buy?)."""

from dataclasses import dataclass

from workers.qualification.icp_scoring import ICPScore
from workers.qualification.pain_inference import PainInference, PainType


@dataclass
class UrgencyScore:
    urgency: float              # 0.0 – 1.0 how likely to act now
    monetization_prob: float    # 0.0 – 1.0 how likely to convert if contacted
    urgency_explanation: str
    monetization_explanation: str


HIGH_URGENCY_PAINS = {
    PainType.FIRST_ENTERPRISE_REVIEW,
    PainType.TRUST_CENTER_PRESSURE,
    PainType.QUESTIONNAIRE_OVERLOAD,
}

MEDIUM_URGENCY_PAINS = {
    PainType.CERTIFICATION_PREP,
    PainType.VENDOR_RISK_FRICTION,
}


def score_urgency(
    pains: list[PainInference],
    icp: ICPScore,
    why_now_score: float,
    negative_weight: float = 0.0,
) -> UrgencyScore:
    # ── Urgency (timing dimension) ──
    urgency = 0.0
    urgency_reasons: list[str] = []

    # Why-now is the strongest timing signal
    urgency += why_now_score * 0.45
    if why_now_score >= 0.6:
        urgency_reasons.append(f"strong_timing({why_now_score:.2f})")
    elif why_now_score >= 0.3:
        urgency_reasons.append(f"moderate_timing({why_now_score:.2f})")

    # Pain type urgency bonus
    if pains and pains[0].pain_type != PainType.UNKNOWN:
        top_pain = pains[0]
        if top_pain.pain_type in HIGH_URGENCY_PAINS:
            urgency += 0.30 * top_pain.confidence
            urgency_reasons.append(f"high_urgency_pain:{top_pain.pain_type.value}")
        elif top_pain.pain_type in MEDIUM_URGENCY_PAINS:
            urgency += 0.20 * top_pain.confidence
            urgency_reasons.append(f"medium_urgency_pain:{top_pain.pain_type.value}")
        else:
            urgency += 0.10 * top_pain.confidence
            urgency_reasons.append(f"low_urgency_pain:{top_pain.pain_type.value}")

    # Negative dampening
    if negative_weight > 0:
        penalty = min(0.20, negative_weight * 0.15)
        urgency -= penalty
        urgency_reasons.append(f"negative_dampening:{penalty:.2f}")

    urgency = max(0.0, min(1.0, urgency))

    # ── Monetization probability (conversion dimension) ──
    mon = 0.0
    mon_reasons: list[str] = []

    # ICP fit is the strongest conversion signal
    mon += icp.score * 0.50
    mon_reasons.append(f"icp_fit:{icp.score:.2f}")

    # Pain clarity boosts conversion
    if pains and pains[0].pain_type != PainType.UNKNOWN:
        mon += pains[0].confidence * 0.25
        mon_reasons.append(f"pain_clarity:{pains[0].confidence:.2f}")

    # Why-now adds some conversion signal
    mon += why_now_score * 0.15
    if why_now_score > 0:
        mon_reasons.append(f"timing_boost:{why_now_score:.2f}")

    # Negative dampening
    if negative_weight > 0:
        penalty = min(0.25, negative_weight * 0.2)
        mon -= penalty
        mon_reasons.append(f"negative_penalty:{penalty:.2f}")

    mon = max(0.0, min(1.0, mon))

    return UrgencyScore(
        urgency=round(urgency, 3),
        monetization_prob=round(mon, 3),
        urgency_explanation=" | ".join(urgency_reasons),
        monetization_explanation=" | ".join(mon_reasons),
    )
