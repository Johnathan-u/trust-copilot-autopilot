"""SIE-403: Contact confidence and fallback chain — converts buyer hypotheses
into an ordered contact plan with stop conditions."""

from dataclasses import dataclass, field
from typing import Optional

from workers.qualification.buyer_resolver import BuyerCandidate
from workers.qualification.buyer_psychology import BuyerPriority


@dataclass
class ContactSlot:
    rank: int
    name: str
    role: str
    normalized_role: str
    role_fit_score: float       # how well role matches buyer priority
    confidence: float           # combined evidence + role confidence
    evidence_url: str = ""
    stop_if_no_response: bool = False  # if True, don't try further contacts


@dataclass
class ContactPlan:
    account_id: str
    slots: list[ContactSlot] = field(default_factory=list)
    max_attempts: int = 3
    stop_reason: str = ""


ROLE_FIT_SCORES = {
    "primary": 1.0,
    "secondary_1": 0.7,
    "secondary_2": 0.5,
    "secondary_3": 0.3,
    "unmatched": 0.1,
}

MIN_CONFIDENCE_THRESHOLD = 0.25
MAX_FALLBACK_DEPTH = 4


def build_contact_plan(
    account_id: str,
    candidates: list[BuyerCandidate],
    buyer_priority: BuyerPriority,
    max_attempts: int = 3,
) -> ContactPlan:
    if not candidates:
        return ContactPlan(
            account_id=account_id, max_attempts=0,
            stop_reason="no_candidates_found",
        )

    scored: list[tuple[BuyerCandidate, float]] = []
    for c in candidates:
        if c.normalized_role == buyer_priority.primary_role:
            fit = ROLE_FIT_SCORES["primary"]
        elif c.normalized_role in buyer_priority.secondary_roles:
            idx = buyer_priority.secondary_roles.index(c.normalized_role)
            fit = ROLE_FIT_SCORES.get(f"secondary_{idx+1}", 0.3)
        else:
            fit = ROLE_FIT_SCORES["unmatched"]
        scored.append((c, fit))

    scored.sort(key=lambda x: -(x[1] * 0.6 + x[0].confidence * 0.4))

    slots: list[ContactSlot] = []
    for i, (c, fit) in enumerate(scored[:MAX_FALLBACK_DEPTH]):
        combined = round(fit * 0.5 + c.confidence * 0.5, 3)
        if combined < MIN_CONFIDENCE_THRESHOLD and i > 0:
            break

        slots.append(ContactSlot(
            rank=i + 1,
            name=c.name,
            role=c.role,
            normalized_role=c.normalized_role,
            role_fit_score=round(fit, 2),
            confidence=combined,
            evidence_url=c.evidence_url,
            stop_if_no_response=(i >= 2),
        ))

    stop_reason = ""
    if not slots:
        stop_reason = "all_candidates_below_threshold"
    elif len(slots) < len(scored):
        stop_reason = "remaining_below_threshold"

    return ContactPlan(
        account_id=account_id,
        slots=slots,
        max_attempts=min(max_attempts, len(slots)),
        stop_reason=stop_reason,
    )
