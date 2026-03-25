"""SIE-302: Pain type inference — maps fused signals + firmographics into
specific trust/compliance pain types with confidence and evidence."""

import enum
from dataclasses import dataclass, field


class PainType(str, enum.Enum):
    QUESTIONNAIRE_OVERLOAD = "questionnaire_overload"
    FIRST_ENTERPRISE_REVIEW = "first_enterprise_review"
    EVIDENCE_CHAOS = "evidence_chaos"
    TRUST_CENTER_PRESSURE = "trust_center_pressure"
    COMPLIANCE_SCALING = "compliance_scaling"
    CERTIFICATION_PREP = "certification_prep"
    VENDOR_RISK_FRICTION = "vendor_risk_friction"
    UNKNOWN = "unknown"


@dataclass
class PainInference:
    pain_type: PainType
    confidence: float
    evidence_signals: list[str]
    reasoning: str


PAIN_RULES: list[tuple[PainType, list[str], list[str], float, str]] = [
    # (pain_type, required_signal_types, supporting_firmographics, base_confidence, reasoning)
    (PainType.FIRST_ENTERPRISE_REVIEW,
     ["soc2_announced", "upmarket_expansion"],
     ["small", "mid"],
     0.85, "First-time enterprise review: upmarket push with new SOC 2 effort"),
    (PainType.FIRST_ENTERPRISE_REVIEW,
     ["security_hiring", "upmarket_expansion"],
     ["small", "mid"],
     0.75, "First security hire alongside enterprise push suggests first-time review"),
    (PainType.QUESTIONNAIRE_OVERLOAD,
     ["vendor_security_mention", "enterprise_customer_mention"],
     [],
     0.80, "Vendor security questionnaires piling up from enterprise customers"),
    (PainType.QUESTIONNAIRE_OVERLOAD,
     ["procurement_review"],
     ["mid", "growth"],
     0.75, "Procurement review process mentions suggest questionnaire friction"),
    (PainType.EVIDENCE_CHAOS,
     ["soc2_announced"],
     ["small", "mid"],
     0.65, "Recently certified but likely lacks evidence automation"),
    (PainType.TRUST_CENTER_PRESSURE,
     ["trust_center_launched"],
     [],
     0.80, "Trust center launch signals buyer pressure for transparent security posture"),
    (PainType.TRUST_CENTER_PRESSURE,
     ["trust_page_added"],
     [],
     0.60, "Trust page exists but may lack automation"),
    (PainType.COMPLIANCE_SCALING,
     ["compliance_hiring"],
     ["growth", "enterprise"],
     0.80, "Hiring compliance roles at scale signals growing compliance burden"),
    (PainType.COMPLIANCE_SCALING,
     ["iso27001_mentioned", "certification_milestone"],
     ["mid", "growth"],
     0.75, "Multiple certifications require scaling compliance operations"),
    (PainType.CERTIFICATION_PREP,
     ["soc2_announced"],
     ["micro", "small"],
     0.70, "Small company pursuing SOC 2 — likely in prep phase"),
    (PainType.CERTIFICATION_PREP,
     ["compliance_hiring"],
     ["micro", "small"],
     0.65, "Small company hiring compliance — preparing for certification"),
    (PainType.VENDOR_RISK_FRICTION,
     ["vendor_security_mention"],
     [],
     0.70, "Vendor security friction from customer requirements"),
]


def infer_pain(
    signal_types: list[str],
    size_band: str = "unknown",
) -> list[PainInference]:
    signal_set = set(signal_types)
    results: list[PainInference] = []
    seen_types: set[PainType] = set()

    for pain_type, required, size_bands, base_conf, reasoning in PAIN_RULES:
        if pain_type in seen_types:
            continue

        if not all(s in signal_set for s in required):
            continue

        if size_bands and size_band not in size_bands and size_band != "unknown":
            continue

        size_match = size_band in size_bands if size_bands else True
        confidence = base_conf * (1.0 if size_match else 0.8)

        matched = [s for s in required if s in signal_set]

        results.append(PainInference(
            pain_type=pain_type,
            confidence=round(confidence, 2),
            evidence_signals=matched,
            reasoning=reasoning,
        ))
        seen_types.add(pain_type)

    results.sort(key=lambda p: -p.confidence)
    return results if results else [PainInference(
        pain_type=PainType.UNKNOWN,
        confidence=0.0,
        evidence_signals=[],
        reasoning="No pain type could be inferred from available signals",
    )]
