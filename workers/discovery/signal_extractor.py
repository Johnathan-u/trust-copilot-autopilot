"""SIE-201: Extract atomic signal events from text chunks using deterministic
pattern matchers. Each signal includes type, evidence span, and confidence."""

import re
from dataclasses import dataclass, field


@dataclass
class ExtractedSignal:
    signal_type: str
    evidence_text: str
    confidence: float
    matched_rule: str
    start_offset: int = 0
    end_offset: int = 0


EXTRACTORS: list[tuple[str, re.Pattern, float, str]] = [
    # (signal_type, pattern, base_confidence, rule_id)
    ("soc2_announced", re.compile(
        r"soc\s*2\s*(type\s*(i{1,2}|1|2))?\s*(certified|compliant|report|attestation|audit)",
        re.I), 0.92, "soc2_cert"),
    ("soc2_announced", re.compile(
        r"(achieved|completed|passed|received)\s+soc\s*2", re.I), 0.88, "soc2_achieved"),
    ("iso27001_mentioned", re.compile(
        r"iso\s*27001\s*(certified|compliant|certification|audit)", re.I), 0.90, "iso27001_cert"),
    ("iso27001_mentioned", re.compile(
        r"(achieved|maintain|renewed)\s+iso\s*27001", re.I), 0.85, "iso27001_achieved"),
    ("trust_center_launched", re.compile(
        r"(trust\s*(center|portal|page)|security\s*portal)\s*(launch|live|now\s*available|is\s*now\s*available|available)",
        re.I), 0.85, "trust_launch"),
    ("trust_page_added", re.compile(
        r"(visit|check\s*out|see)\s*(our\s+)?(trust|security)\s*(center|page|portal)",
        re.I), 0.70, "trust_page_ref"),
    ("security_hiring", re.compile(
        r"(security\s*engineer|information\s*security|infosec\s*(analyst|engineer|manager))",
        re.I), 0.80, "sec_hire_title"),
    ("compliance_hiring", re.compile(
        r"(compliance\s*(manager|analyst|officer|lead)|grc\s*(analyst|manager|lead))",
        re.I), 0.80, "compliance_hire_title"),
    ("enterprise_customer_mention", re.compile(
        r"(enterprise|fortune\s*500|large\s*organization)s?\s*(customer|client|deploy|trust)",
        re.I), 0.70, "enterprise_cust"),
    ("vendor_security_mention", re.compile(
        r"(vendor\s*security|third.?party\s*(risk|security|audit)|security\s*questionnaire)",
        re.I), 0.75, "vendor_sec"),
    ("funding_round", re.compile(
        r"(raised|secured|closed)\s+\$?\d+\s*(m|million|mm)\s*(in\s+)?(series|seed|funding|round)",
        re.I), 0.85, "funding"),
    ("upmarket_expansion", re.compile(
        r"(mov(e|ing)\s*up.?market|enterprise\s*(expansion|tier|ready|grade))",
        re.I), 0.75, "upmarket"),
    ("procurement_review", re.compile(
        r"(procurement|security\s*review|vendor\s*assessment|due\s*diligence)\s*(process|requirement|checklist)",
        re.I), 0.72, "procurement"),
    ("certification_milestone", re.compile(
        r"(hipaa|gdpr|fedramp|pci\s*dss|ccpa)\s*(certified|compliant|compliance|ready)",
        re.I), 0.82, "cert_milestone"),
    # Negative signals
    ("negative_competitor", re.compile(
        r"(already\s*(use|using|have)|powered\s*by|partner\s*with)\s*(vanta|drata|secureframe|laika|sprinto|tugboat)",
        re.I), 0.80, "neg_competitor"),
    ("negative_too_small", re.compile(
        r"\b(1|2|3|4|5)\s*employee|solo\s*founder|bootstrapped\s*solo",
        re.I), 0.65, "neg_tiny"),
    ("negative_too_large", re.compile(
        r"\b(10|20|50|100)\s*,?\s*000\+?\s*employee|\bfortune\s*(100|50)\b",
        re.I), 0.60, "neg_huge"),
    ("negative_stale", re.compile(
        r"(201[0-8]|2019|2020|2021)\s*(annual|report|audit|certification)",
        re.I), 0.55, "neg_stale_year"),
]


def extract_signals(text: str, source_url: str = "") -> list[ExtractedSignal]:
    results: list[ExtractedSignal] = []
    seen: set[tuple[str, int]] = set()

    for signal_type, pattern, base_conf, rule_id in EXTRACTORS:
        for match in pattern.finditer(text):
            key = (signal_type, match.start() // 200)
            if key in seen:
                continue
            seen.add(key)

            context_start = max(0, match.start() - 80)
            context_end = min(len(text), match.end() + 80)
            evidence = text[context_start:context_end].strip()

            results.append(ExtractedSignal(
                signal_type=signal_type,
                evidence_text=evidence,
                confidence=base_conf,
                matched_rule=rule_id,
                start_offset=match.start(),
                end_offset=match.end(),
            ))

    results.sort(key=lambda s: (-s.confidence, s.start_offset))
    return results
