"""SIE-204: Account narrative generator — produces a grounded summary citing
only supplied evidence. No hallucinated claims allowed."""

from dataclasses import dataclass, field
from workers.discovery.fusion import FusedAccountState
from workers.discovery.taxonomy import get_spec


@dataclass
class Narrative:
    text: str
    cited_evidence_ids: list[str]
    grounding_facts: list[str]
    forbidden_claims: list[str] = field(default_factory=list)


def generate_narrative(
    fused: FusedAccountState,
    company_name: str = "The company",
) -> Narrative:
    """Generate a grounded narrative from fused signals. Only cite what exists."""
    facts: list[str] = []
    cited_ids: list[str] = []

    for trigger in fused.top_triggers:
        spec = get_spec(trigger["signal_type"])
        if spec:
            facts.append(spec.explanation)
            cited_ids.append(trigger["signal_id"])

    negative_facts: list[str] = []
    for neg in fused.negatives:
        spec = get_spec(neg["signal_type"])
        if spec:
            negative_facts.append(spec.explanation)
            cited_ids.append(neg["signal_id"])

    if not facts:
        return Narrative(
            text=f"{company_name} has no actionable signals at this time.",
            cited_evidence_ids=[],
            grounding_facts=[],
        )

    sentences: list[str] = []
    sentences.append(f"{company_name} shows {len(facts)} relevant signal{'s' if len(facts) != 1 else ''}.")

    for i, fact in enumerate(facts[:5]):
        sentences.append(fact + ".")

    if fused.why_now_score >= 0.7:
        sentences.append("Timing indicators are strong.")
    elif fused.why_now_score >= 0.4:
        sentences.append("Timing indicators are moderate.")

    if negative_facts:
        sentences.append(f"However, {len(negative_facts)} negative signal{'s' if len(negative_facts) != 1 else ''} detected: {'; '.join(negative_facts[:3])}.")

    text = " ".join(sentences)

    forbidden = [
        "guaranteed", "definitely", "will certainly", "100%",
        "we recommend", "you should", "must buy",
    ]

    return Narrative(
        text=text,
        cited_evidence_ids=cited_ids,
        grounding_facts=facts,
        forbidden_claims=forbidden,
    )


def validate_narrative(narrative: Narrative) -> list[str]:
    """Check that the narrative doesn't contain forbidden claims."""
    violations: list[str] = []
    lower = narrative.text.lower()
    for claim in narrative.forbidden_claims:
        if claim.lower() in lower:
            violations.append(f"Forbidden claim found: '{claim}'")
    if not narrative.cited_evidence_ids and "signal" in lower:
        violations.append("References signals but has no cited evidence IDs")
    return violations
