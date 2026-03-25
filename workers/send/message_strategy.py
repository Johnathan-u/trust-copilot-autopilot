"""SIE-501: Structured message-strategy object — generates a strategy object
from account intelligence before any copy is composed."""

import enum
from dataclasses import dataclass, field

from workers.qualification.pain_inference import PainType
from workers.qualification.segmentation import Segment


class Angle(str, enum.Enum):
    PAIN_DIRECT = "pain_direct"
    SOCIAL_PROOF = "social_proof"
    EVENT_TRIGGER = "event_trigger"
    COMPETITOR_DISPLACEMENT = "competitor_displacement"
    EDUCATION = "education"


class Tone(str, enum.Enum):
    DIRECT = "direct"
    CONSULTATIVE = "consultative"
    PEER = "peer"
    FORMAL = "formal"


class CTAType(str, enum.Enum):
    UPLOAD_QUESTIONNAIRE = "upload_questionnaire"
    SEND_PROOF_PAGE = "send_proof_page"
    SEND_DETAILS = "send_details"
    BOOK_CALL = "book_call"
    NO_CTA = "no_cta"


@dataclass
class MessageStrategy:
    angle: Angle
    pain_framing: str
    proof_hook: str
    cta_type: CTAType
    tone: Tone
    top_objection: str
    objection_prehandle: str
    evidence_ids: list[str] = field(default_factory=list)
    segment: str = ""
    grounding_facts: list[str] = field(default_factory=list)


SEGMENT_ANGLES: dict[Segment, Angle] = {
    Segment.EARLY_SOC2_STARTUP: Angle.PAIN_DIRECT,
    Segment.POST_FUNDING_PUSH: Angle.EVENT_TRIGGER,
    Segment.TRUST_CENTER_LAUNCH: Angle.SOCIAL_PROOF,
    Segment.HIRING_LED_SCALE: Angle.PAIN_DIRECT,
    Segment.ENTERPRISE_EXPANSION: Angle.SOCIAL_PROOF,
    Segment.COMPLIANCE_MATURITY: Angle.EDUCATION,
    Segment.QUESTIONNAIRE_PAIN: Angle.PAIN_DIRECT,
    Segment.GENERIC_FIT: Angle.EDUCATION,
}

PAIN_FRAMINGS: dict[PainType, str] = {
    PainType.FIRST_ENTERPRISE_REVIEW: "navigating your first enterprise security review",
    PainType.QUESTIONNAIRE_OVERLOAD: "drowning in vendor security questionnaires",
    PainType.EVIDENCE_CHAOS: "scrambling to collect audit evidence across tools",
    PainType.TRUST_CENTER_PRESSURE: "building buyer-facing trust and transparency",
    PainType.COMPLIANCE_SCALING: "scaling compliance operations across your growing team",
    PainType.CERTIFICATION_PREP: "preparing for your SOC 2 or ISO 27001 certification",
    PainType.VENDOR_RISK_FRICTION: "managing vendor security requests from customers",
    PainType.UNKNOWN: "strengthening your security and compliance posture",
}

SIZE_TONE: dict[str, Tone] = {
    "micro": Tone.PEER,
    "small": Tone.PEER,
    "mid": Tone.CONSULTATIVE,
    "growth": Tone.CONSULTATIVE,
    "enterprise": Tone.FORMAL,
}


def build_message_strategy(
    pain_type: PainType,
    segment: Segment,
    size_band: str,
    top_triggers: list[str],
    evidence_ids: list[str],
    competitor_state: str = "no_competitor",
    top_objection: str = "",
    objection_prehandle: str = "",
) -> MessageStrategy:
    if competitor_state in ("soften", "reposition"):
        angle = Angle.COMPETITOR_DISPLACEMENT
    else:
        angle = SEGMENT_ANGLES.get(segment, Angle.EDUCATION)

    pain_framing = PAIN_FRAMINGS.get(pain_type, PAIN_FRAMINGS[PainType.UNKNOWN])

    proof_hook = ""
    if top_triggers:
        trigger = top_triggers[0]
        proof_hook = f"Based on your recent {trigger.replace('_', ' ')}"

    cta_type = CTAType.SEND_DETAILS
    tone = SIZE_TONE.get(size_band, Tone.CONSULTATIVE)

    facts = []
    if top_triggers:
        facts.append(f"Trigger: {top_triggers[0]}")
    facts.append(f"Pain: {pain_type.value}")
    facts.append(f"Segment: {segment.value}")

    return MessageStrategy(
        angle=angle,
        pain_framing=pain_framing,
        proof_hook=proof_hook,
        cta_type=cta_type,
        tone=tone,
        top_objection=top_objection,
        objection_prehandle=objection_prehandle,
        evidence_ids=evidence_ids,
        segment=segment.value,
        grounding_facts=facts,
    )
