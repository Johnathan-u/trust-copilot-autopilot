"""SIE-504: Send-reason and no-send explanation bundle — compact explanation
for every outreach decision enabling debugging, audits, and human review."""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ExplanationItem:
    category: str       # "trigger" | "negative" | "buyer" | "cta" | "policy" | "decision"
    code: str
    description: str
    evidence_id: str = ""
    rule_id: str = ""


@dataclass
class ExplanationBundle:
    account_id: str
    decision: str               # "send" | "no_send" | "defer"
    priority_tier: int
    items: list[ExplanationItem] = field(default_factory=list)
    summary: str = ""

    def add(self, category: str, code: str, description: str,
            evidence_id: str = "", rule_id: str = "") -> None:
        self.items.append(ExplanationItem(
            category=category, code=code, description=description,
            evidence_id=evidence_id, rule_id=rule_id,
        ))

    def triggers(self) -> list[ExplanationItem]:
        return [i for i in self.items if i.category == "trigger"]

    def negatives(self) -> list[ExplanationItem]:
        return [i for i in self.items if i.category == "negative"]

    def to_dict(self) -> dict:
        return {
            "account_id": self.account_id,
            "decision": self.decision,
            "priority_tier": self.priority_tier,
            "summary": self.summary,
            "items": [
                {
                    "category": i.category,
                    "code": i.code,
                    "description": i.description,
                    "evidence_id": i.evidence_id,
                    "rule_id": i.rule_id,
                }
                for i in self.items
            ],
        }


def build_explanation(
    account_id: str,
    decision: str,
    priority_tier: int,
    top_triggers: list[tuple[str, str]],
    negatives: list[tuple[str, str]],
    buyer_rationale: str,
    cta_rationale: str,
    policy_reasons: list[str],
    final_reason_codes: list[str],
) -> ExplanationBundle:
    bundle = ExplanationBundle(
        account_id=account_id,
        decision=decision,
        priority_tier=priority_tier,
    )

    for trigger_type, evidence_id in top_triggers:
        bundle.add("trigger", trigger_type,
                    f"Signal: {trigger_type.replace('_', ' ')}",
                    evidence_id=evidence_id)

    for neg_type, reason in negatives:
        bundle.add("negative", neg_type, reason)

    if buyer_rationale:
        bundle.add("buyer", "buyer_selection", buyer_rationale)

    if cta_rationale:
        bundle.add("cta", "cta_selection", cta_rationale)

    for pr in policy_reasons:
        bundle.add("policy", pr, f"Policy: {pr}")

    for rc in final_reason_codes:
        bundle.add("decision", rc, f"Decision: {rc}")

    parts = []
    if decision == "send":
        parts.append(f"SEND (tier {priority_tier})")
    elif decision == "no_send":
        parts.append("NO SEND")
    else:
        parts.append("DEFERRED")
    if top_triggers:
        parts.append(f"triggers: {', '.join(t[0] for t in top_triggers[:3])}")
    if negatives:
        parts.append(f"negatives: {', '.join(n[0] for n in negatives[:2])}")
    bundle.summary = " | ".join(parts)

    return bundle
