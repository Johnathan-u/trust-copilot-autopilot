"""EVAL-405: Message guardrails and contradiction detection — pre-send checks
for unsupported claims, stale evidence, and conflicting sequences."""

import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class GuardrailResult:
    passed: bool
    failures: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def check_grounding(
    body: str,
    grounding_facts: list[str],
) -> list[str]:
    failures = []
    fact_keywords = set()
    for fact in grounding_facts:
        for word in fact.lower().split():
            if len(word) > 3:
                fact_keywords.add(word)

    UNSUPPORTED_CLAIMS = [
        re.compile(r"\b(recently\s*raised|just\s*announced|recently\s*launched)\b", re.I),
        re.compile(r"\b(your\s*team\s*of\s*\d+|you\s*have\s*\d+\s*employees)\b", re.I),
    ]

    for pattern in UNSUPPORTED_CLAIMS:
        m = pattern.search(body)
        if m:
            claim = m.group(0)
            claim_words = {w.lower() for w in claim.split() if len(w) > 3}
            if not claim_words & fact_keywords:
                failures.append(f"Unsupported claim: '{claim}' not in grounding facts")

    return failures


def check_staleness(
    trigger_age_days: float,
    max_age: float = 90.0,
) -> list[str]:
    if trigger_age_days > max_age:
        return [f"Stale trigger: {trigger_age_days:.0f} days old (max {max_age:.0f})"]
    return []


def check_domain_duplicate(
    recipient_domain: str,
    recent_domains: list[str],
) -> list[str]:
    if recipient_domain in recent_domains:
        return [f"Duplicate domain: already sent to {recipient_domain} recently"]
    return []


def check_thread_contradiction(
    body: str,
    prior_messages: list[str],
) -> list[str]:
    failures = []
    for prior in prior_messages:
        if "not interested" in prior.lower() and "follow up" not in body.lower():
            pass
        prior_claims = set(re.findall(r"\b(soc\s*2|iso\s*27001|hipaa|gdpr)\b", prior, re.I))
        new_claims = set(re.findall(r"\b(soc\s*2|iso\s*27001|hipaa|gdpr)\b", body, re.I))
        contradictions = prior_claims - new_claims
        if contradictions and new_claims:
            failures.append(
                f"Prior thread mentioned {contradictions} but new message doesn't — potential inconsistency"
            )
    return failures


def run_guardrails(
    body: str,
    grounding_facts: list[str],
    trigger_age_days: float = 0.0,
    recipient_domain: str = "",
    recent_domains: list[str] = None,
    prior_messages: list[str] = None,
) -> GuardrailResult:
    failures = []
    warnings = []

    failures.extend(check_grounding(body, grounding_facts))
    failures.extend(check_staleness(trigger_age_days))
    failures.extend(check_domain_duplicate(recipient_domain, recent_domains or []))
    warnings.extend(check_thread_contradiction(body, prior_messages or []))

    return GuardrailResult(
        passed=len(failures) == 0,
        failures=failures,
        warnings=warnings,
    )
