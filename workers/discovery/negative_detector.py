"""SIE-206: Negative-signal detector — identifies signals that should reduce
or block outreach, with reason codes for contact decisions."""

import re
from dataclasses import dataclass, field


@dataclass
class NegativeSignal:
    signal_type: str
    reason_code: str
    evidence_text: str
    confidence: float
    severity: str  # "soft" = reduce priority, "hard" = block outreach


NEGATIVE_RULES: list[tuple[str, str, re.Pattern, float, str]] = [
    # (signal_type, reason_code, pattern, confidence, severity)
    ("negative_competitor", "competitor_in_use",
     re.compile(r"(already\s*(use|using|have|deploy)|powered\s*by|partner(ed)?\s*with)\s*(vanta|drata|secureframe|laika|sprinto|tugboat|anecdotes|thoropass)", re.I),
     0.85, "hard"),
    ("negative_competitor", "competitor_mentioned",
     re.compile(r"\b(vanta|drata|secureframe|laika|sprinto|tugboat|thoropass)\b.*\b(trust|compliance|soc)\b", re.I),
     0.60, "soft"),
    ("negative_too_small", "company_too_small",
     re.compile(r"\b([1-5])\s*employee|\bsolo\s*founder\b|\bpre.?revenue\b|\bbootstrapped\s*solo\b", re.I),
     0.70, "soft"),
    ("negative_too_large", "company_too_large",
     re.compile(r"\b(50|100)\s*,?\s*000\+?\s*employee|\bfortune\s*(50|100)\b|\bglobal\s*enterprise\b", re.I),
     0.55, "soft"),
    ("negative_stale", "stale_announcement",
     re.compile(r"\b(201[0-8]|2019|2020|2021)\b.{0,30}\b(announced|achieved|certified|launched|completed)\b", re.I),
     0.50, "soft"),
    ("negative_stale", "old_job_posting",
     re.compile(r"(posted|published|listed)\s*(on|:)?\s*(201[0-9]|202[0-2])", re.I),
     0.45, "soft"),
]


def detect_negatives(text: str) -> list[NegativeSignal]:
    results: list[NegativeSignal] = []
    seen_types: set[str] = set()

    for signal_type, reason_code, pattern, confidence, severity in NEGATIVE_RULES:
        match = pattern.search(text)
        if match and signal_type not in seen_types:
            seen_types.add(signal_type)
            ctx_start = max(0, match.start() - 60)
            ctx_end = min(len(text), match.end() + 60)
            evidence = text[ctx_start:ctx_end].strip()

            results.append(NegativeSignal(
                signal_type=signal_type,
                reason_code=reason_code,
                evidence_text=evidence,
                confidence=confidence,
                severity=severity,
            ))

    return results


def has_hard_block(negatives: list[NegativeSignal]) -> bool:
    return any(n.severity == "hard" for n in negatives)


def negative_reason_codes(negatives: list[NegativeSignal]) -> dict[str, str]:
    return {n.reason_code: n.evidence_text for n in negatives}
