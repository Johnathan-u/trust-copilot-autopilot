"""SIE-502: Objection prediction — predicts the most likely immediate objection
for each account and role so message strategy can pre-handle it."""

import enum
from dataclasses import dataclass, field

from workers.qualification.pain_inference import PainType
from workers.qualification.segmentation import Segment


class ObjectionType(str, enum.Enum):
    ALREADY_HAVE_PROCESS = "already_have_process"
    WRONG_PERSON = "wrong_person"
    BAD_TIMING = "bad_timing"
    TOO_EARLY = "too_early"
    TOO_EXPENSIVE = "too_expensive"
    AI_SKEPTICISM = "ai_skepticism"
    COMPETITOR_LOCKED = "competitor_locked"
    NOT_A_PRIORITY = "not_a_priority"
    NEED_MORE_INFO = "need_more_info"


@dataclass
class ObjectionPrediction:
    top_objection: ObjectionType
    alternates: list[ObjectionType] = field(default_factory=list)
    confidence: float = 0.0
    rationale: str = ""
    prehandle_hint: str = ""


OBJECTION_RULES: list[tuple[
    ObjectionType,
    list[str],      # required conditions
    float,          # confidence
    str,            # rationale
    str,            # prehandle
]] = [
    (ObjectionType.COMPETITOR_LOCKED,
     ["competitor_block"], 0.90,
     "Account already uses a direct competitor",
     "Acknowledge current tool; focus on specific gap or switching cost reduction"),
    (ObjectionType.COMPETITOR_LOCKED,
     ["competitor_soften"], 0.65,
     "Account uses a smaller/adjacent competitor",
     "Position as complement or upgrade rather than replacement"),
    (ObjectionType.ALREADY_HAVE_PROCESS,
     ["compliance_maturity_segment"], 0.70,
     "Mature compliance program — likely has existing tooling",
     "Focus on consolidation, efficiency, and audit-readiness speed"),
    (ObjectionType.TOO_EARLY,
     ["micro_size", "cert_prep_pain"], 0.65,
     "Very early stage — may not be ready for tooling investment",
     "Emphasize getting ahead of the problem before the first audit"),
    (ObjectionType.BAD_TIMING,
     ["low_urgency"], 0.60,
     "Low timing signals — account may not be actively looking",
     "Lead with educational value; save hard CTA for follow-up"),
    (ObjectionType.WRONG_PERSON,
     ["low_buyer_confidence"], 0.55,
     "Low confidence in buyer resolution — may reach wrong person",
     "Open with a soft ask: 'Are you the right person for this?'"),
    (ObjectionType.TOO_EXPENSIVE,
     ["micro_size"], 0.50,
     "Very small company may see compliance tooling as expensive",
     "Lead with ROI: hours saved vs. tool cost"),
    (ObjectionType.NOT_A_PRIORITY,
     ["no_active_pain"], 0.50,
     "No strong pain signals detected",
     "Create urgency through risk framing or peer comparison"),
    (ObjectionType.AI_SKEPTICISM,
     ["ai_tool_segment"], 0.45,
     "Technical audience may be skeptical of AI-powered claims",
     "Lead with deterministic features; mention AI only as augmentation"),
]


def predict_objection(
    pain_type: PainType,
    segment: Segment,
    size_band: str,
    competitor_state: str,
    urgency_score: float,
    buyer_confidence: float,
) -> ObjectionPrediction:
    conditions: set[str] = set()

    if competitor_state == "block":
        conditions.add("competitor_block")
    elif competitor_state in ("soften", "reposition"):
        conditions.add("competitor_soften")

    if segment == Segment.COMPLIANCE_MATURITY:
        conditions.add("compliance_maturity_segment")
    if segment == Segment.EARLY_SOC2_STARTUP:
        conditions.add("ai_tool_segment")

    if size_band == "micro":
        conditions.add("micro_size")
    if pain_type == PainType.CERTIFICATION_PREP:
        conditions.add("cert_prep_pain")
    if pain_type == PainType.UNKNOWN:
        conditions.add("no_active_pain")

    if urgency_score < 0.3:
        conditions.add("low_urgency")
    if buyer_confidence < 0.4:
        conditions.add("low_buyer_confidence")

    matched: list[tuple[ObjectionType, float, str, str]] = []
    for obj_type, reqs, conf, rationale, prehandle in OBJECTION_RULES:
        if all(r in conditions for r in reqs):
            matched.append((obj_type, conf, rationale, prehandle))

    if not matched:
        return ObjectionPrediction(
            top_objection=ObjectionType.NEED_MORE_INFO,
            confidence=0.3,
            rationale="No strong objection pattern detected",
            prehandle_hint="Provide clear, concise value proposition",
        )

    matched.sort(key=lambda x: -x[1])
    top = matched[0]
    alts = [m[0] for m in matched[1:3] if m[0] != top[0]]

    return ObjectionPrediction(
        top_objection=top[0],
        alternates=alts,
        confidence=round(top[1], 2),
        rationale=top[2],
        prehandle_hint=top[3],
    )
