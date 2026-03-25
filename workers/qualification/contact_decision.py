"""SIE-405: Contact decision engine — combines all upstream intelligence into
a final contact/no-contact decision with reason codes and priority tier."""

from dataclasses import dataclass, field
from typing import Optional

from workers.qualification.icp_scoring import ICPScore
from workers.qualification.urgency import UrgencyScore
from workers.qualification.deal_value import DealValueEstimate
from workers.qualification.contact_plan import ContactPlan
from workers.qualification.competitor_detection import CompetitorHit, has_blocking_competitor


@dataclass
class ContactDecisionResult:
    decision: str                   # "contact" | "no_contact" | "defer"
    priority_tier: int              # 1 (highest) to 5 (lowest), 0 = no contact
    target_role: str
    send_window_hint: str           # "immediate" | "next_week" | "next_month" | "none"
    reason_codes: list[str] = field(default_factory=list)
    explanation: str = ""
    expected_value: int = 0


def make_contact_decision(
    icp: ICPScore,
    urgency: UrgencyScore,
    deal_value: DealValueEstimate,
    contact_plan: ContactPlan,
    competitor_hits: list[CompetitorHit],
    has_hard_negatives: bool = False,
    account_memory: Optional["AccountMemory"] = None,
) -> ContactDecisionResult:
    reasons: list[str] = []

    # ── Hard blocks ──
    if has_hard_negatives:
        reasons.append("hard_negative_signal")
        return ContactDecisionResult(
            decision="no_contact", priority_tier=0, target_role="",
            send_window_hint="none", reason_codes=reasons,
            explanation="Blocked: hard negative signal detected",
        )

    if has_blocking_competitor(competitor_hits):
        reasons.append("blocking_competitor")
        return ContactDecisionResult(
            decision="no_contact", priority_tier=0, target_role="",
            send_window_hint="none", reason_codes=reasons,
            explanation=f"Blocked: direct competitor ({competitor_hits[0].competitor}) in use",
        )

    if icp.bucket == "out_of_bounds":
        reasons.append("out_of_icp_bounds")
        return ContactDecisionResult(
            decision="no_contact", priority_tier=0, target_role="",
            send_window_hint="none", reason_codes=reasons,
            explanation="Blocked: account outside ICP bounds",
        )

    if not contact_plan.slots:
        reasons.append("no_contact_candidates")
        return ContactDecisionResult(
            decision="no_contact", priority_tier=0, target_role="",
            send_window_hint="none", reason_codes=reasons,
            explanation="Blocked: no viable buyer candidates found",
        )

    # ── Memory checks ──
    if account_memory:
        if account_memory.is_snoozed:
            reasons.append("snoozed")
            return ContactDecisionResult(
                decision="defer", priority_tier=0, target_role="",
                send_window_hint="none", reason_codes=reasons,
                explanation=f"Deferred: snoozed until {account_memory.snooze_until}",
            )
        if account_memory.hard_objection:
            reasons.append("prior_hard_objection")
            if not account_memory.has_new_trigger:
                return ContactDecisionResult(
                    decision="no_contact", priority_tier=0, target_role="",
                    send_window_hint="none", reason_codes=reasons,
                    explanation="Blocked: prior hard objection with no new trigger",
                )
            reasons.append("reactivated_by_new_trigger")

    # ── Scoring ──
    composite = (
        icp.score * 0.25
        + urgency.urgency * 0.30
        + urgency.monetization_prob * 0.25
        + contact_plan.slots[0].confidence * 0.20
    )

    # Competitor softening penalty
    soften_hits = [h for h in competitor_hits if h.effect in ("soften", "reposition")]
    if soften_hits:
        composite *= 0.85
        reasons.append("competitor_softening")

    if icp.bucket == "marginal":
        composite *= 0.80
        reasons.append("marginal_icp")

    # ── Priority tier ──
    if composite >= 0.70:
        tier = 1
        window = "immediate"
        reasons.append("tier1_high_composite")
    elif composite >= 0.55:
        tier = 2
        window = "immediate"
        reasons.append("tier2_good_composite")
    elif composite >= 0.40:
        tier = 3
        window = "next_week"
        reasons.append("tier3_moderate")
    elif composite >= 0.25:
        tier = 4
        window = "next_month"
        reasons.append("tier4_low")
    else:
        tier = 5
        window = "next_month"
        reasons.append("tier5_minimal")

    target = contact_plan.slots[0]

    return ContactDecisionResult(
        decision="contact",
        priority_tier=tier,
        target_role=target.normalized_role,
        send_window_hint=window,
        reason_codes=reasons,
        explanation=(
            f"Contact approved: tier {tier}, "
            f"target={target.name} ({target.normalized_role}), "
            f"composite={composite:.2f}, window={window}"
        ),
        expected_value=deal_value.expected_value,
    )
