"""SIE-306: Micro-segmentation — maps account state to a controlled segment
enum that drives message strategy downstream."""

import enum
from dataclasses import dataclass, field

from workers.qualification.firmographics import FirmographicEstimate
from workers.qualification.pain_inference import PainInference, PainType
from workers.qualification.icp_scoring import ICPScore


class Segment(str, enum.Enum):
    EARLY_SOC2_STARTUP = "early_soc2_startup"
    POST_FUNDING_PUSH = "post_funding_push"
    TRUST_CENTER_LAUNCH = "trust_center_launch"
    HIRING_LED_SCALE = "hiring_led_scale"
    ENTERPRISE_EXPANSION = "enterprise_expansion"
    COMPLIANCE_MATURITY = "compliance_maturity"
    QUESTIONNAIRE_PAIN = "questionnaire_pain"
    GENERIC_FIT = "generic_fit"
    NOT_SEGMENTED = "not_segmented"


@dataclass
class SegmentResult:
    primary: Segment
    alternates: list[Segment] = field(default_factory=list)
    confidence: float = 0.0
    reasons: list[str] = field(default_factory=list)


SEGMENT_RULES: list[tuple[Segment, list[str], list[str], list[PainType], float, str]] = [
    # (segment, required_signals, size_bands, pain_types, min_confidence, reason)
    (Segment.EARLY_SOC2_STARTUP,
     ["soc2_announced"], ["micro", "small"], [PainType.CERTIFICATION_PREP, PainType.FIRST_ENTERPRISE_REVIEW],
     0.80, "Small company pursuing first SOC 2"),
    (Segment.POST_FUNDING_PUSH,
     ["funding_round", "upmarket_expansion"], [], [],
     0.75, "Recently funded and pushing upmarket"),
    (Segment.POST_FUNDING_PUSH,
     ["funding_round"], ["small", "mid"], [PainType.FIRST_ENTERPRISE_REVIEW],
     0.70, "Post-funding with enterprise review pain"),
    (Segment.TRUST_CENTER_LAUNCH,
     ["trust_center_launched"], [], [PainType.TRUST_CENTER_PRESSURE],
     0.80, "Actively building trust center infrastructure"),
    (Segment.TRUST_CENTER_LAUNCH,
     ["trust_page_added"], [], [],
     0.55, "Has a trust page — may need automation"),
    (Segment.HIRING_LED_SCALE,
     ["compliance_hiring"], ["mid", "growth"], [PainType.COMPLIANCE_SCALING],
     0.80, "Scaling compliance through hiring"),
    (Segment.HIRING_LED_SCALE,
     ["security_hiring", "compliance_hiring"], [], [],
     0.70, "Hiring both security and compliance roles"),
    (Segment.ENTERPRISE_EXPANSION,
     ["upmarket_expansion", "enterprise_customer_mention"], [], [],
     0.75, "Expanding into enterprise segment"),
    (Segment.COMPLIANCE_MATURITY,
     ["iso27001_mentioned", "certification_milestone"], ["mid", "growth", "enterprise"], [],
     0.70, "Multiple compliance certifications — mature program"),
    (Segment.QUESTIONNAIRE_PAIN,
     ["vendor_security_mention"], [], [PainType.QUESTIONNAIRE_OVERLOAD],
     0.75, "Questionnaire overload from vendor reviews"),
]


def segment_account(
    signal_types: list[str],
    firmographics: FirmographicEstimate,
    pains: list[PainInference],
    icp: ICPScore,
) -> SegmentResult:
    signal_set = set(signal_types)
    pain_set = {p.pain_type for p in pains}
    matched: list[tuple[Segment, float, str]] = []

    for segment, req_signals, size_bands, pain_types, min_conf, reason in SEGMENT_RULES:
        if not all(s in signal_set for s in req_signals):
            continue
        if size_bands and firmographics.size_band not in size_bands and firmographics.size_band != "unknown":
            continue
        if pain_types and not any(pt in pain_set for pt in pain_types):
            if pain_types:
                continue

        confidence = min_conf
        if firmographics.size_band != "unknown":
            confidence += 0.05
        if icp.score >= 0.5:
            confidence += 0.05

        matched.append((segment, min(confidence, 0.95), reason))

    if not matched:
        if icp.bucket in ("strong_fit", "good_fit"):
            return SegmentResult(
                primary=Segment.GENERIC_FIT,
                confidence=icp.score * 0.7,
                reasons=["ICP fit but no specific segment match"],
            )
        return SegmentResult(primary=Segment.NOT_SEGMENTED, confidence=0.0)

    matched.sort(key=lambda x: -x[1])
    primary = matched[0]
    alternates = [m[0] for m in matched[1:4] if m[0] != primary[0]]

    return SegmentResult(
        primary=primary[0],
        alternates=alternates,
        confidence=round(primary[1], 2),
        reasons=[m[2] for m in matched[:3]],
    )
