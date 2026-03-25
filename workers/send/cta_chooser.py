"""SIE-503: CTA chooser — picks the best next-step CTA based on account
confidence, pain type, role, and objection prediction."""

from dataclasses import dataclass

from workers.send.message_strategy import CTAType
from workers.qualification.pain_inference import PainType
from workers.send.objection_prediction import ObjectionType


@dataclass
class CTAChoice:
    cta: CTAType
    rationale: str
    confidence: float


CTA_RULES: list[tuple[
    CTAType,
    list[str],      # conditions
    float,          # confidence
    str,            # rationale
]] = [
    (CTAType.UPLOAD_QUESTIONNAIRE,
     ["questionnaire_pain", "high_confidence"],
     0.85, "Strong questionnaire pain + high confidence = direct upload CTA"),
    (CTAType.UPLOAD_QUESTIONNAIRE,
     ["vendor_risk_pain", "high_confidence"],
     0.75, "Vendor risk friction with high confidence supports upload CTA"),
    (CTAType.SEND_PROOF_PAGE,
     ["trust_center_pain"],
     0.80, "Trust center pressure is best answered with proof page demo"),
    (CTAType.SEND_PROOF_PAGE,
     ["evidence_pain"],
     0.70, "Evidence chaos makes proof page tangible value"),
    (CTAType.BOOK_CALL,
     ["enterprise_size", "high_value"],
     0.75, "Enterprise accounts with high value warrant direct call booking"),
    (CTAType.SEND_DETAILS,
     ["low_confidence"],
     0.60, "Low confidence — lead with information, not commitment"),
    (CTAType.SEND_DETAILS,
     ["bad_timing_objection"],
     0.55, "Bad timing objection — provide details for future reference"),
    (CTAType.NO_CTA,
     ["competitor_locked"],
     0.50, "Competitor locked — no direct CTA appropriate"),
]


def choose_cta(
    pain_type: PainType,
    size_band: str,
    icp_score: float,
    urgency_score: float,
    top_objection: ObjectionType,
    deal_tier: str = "pro",
) -> CTAChoice:
    conditions: set[str] = set()

    if pain_type == PainType.QUESTIONNAIRE_OVERLOAD:
        conditions.add("questionnaire_pain")
    elif pain_type == PainType.VENDOR_RISK_FRICTION:
        conditions.add("vendor_risk_pain")
    elif pain_type == PainType.TRUST_CENTER_PRESSURE:
        conditions.add("trust_center_pain")
    elif pain_type == PainType.EVIDENCE_CHAOS:
        conditions.add("evidence_pain")

    if icp_score >= 0.7 and urgency_score >= 0.5:
        conditions.add("high_confidence")
    elif icp_score < 0.4 or urgency_score < 0.3:
        conditions.add("low_confidence")

    if size_band in ("growth", "enterprise"):
        conditions.add("enterprise_size")
    if deal_tier in ("business", "enterprise"):
        conditions.add("high_value")

    if top_objection == ObjectionType.BAD_TIMING:
        conditions.add("bad_timing_objection")
    elif top_objection == ObjectionType.COMPETITOR_LOCKED:
        conditions.add("competitor_locked")

    for cta, reqs, conf, rationale in CTA_RULES:
        if all(r in conditions for r in reqs):
            return CTAChoice(cta=cta, rationale=rationale, confidence=conf)

    return CTAChoice(
        cta=CTAType.SEND_DETAILS,
        rationale="Default: send details when no strong CTA signal",
        confidence=0.40,
    )
