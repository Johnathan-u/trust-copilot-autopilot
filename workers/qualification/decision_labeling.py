"""SIE-602: Decision labeling pipeline — converts funnel outcomes plus risk
events into versioned lead-decision labels for supervised learning."""

import enum
from dataclasses import dataclass, field
from typing import Optional

from workers.qualification.outcome_capture import OutcomeType


class DecisionLabel(str, enum.Enum):
    GOOD = "good"
    NEUTRAL = "neutral"
    BAD = "bad"
    UNSAFE = "unsafe"
    UNCERTAIN = "uncertain"


LABEL_VERSION = 1

GOOD_OUTCOMES = {OutcomeType.PAID, OutcomeType.UPLOADED, OutcomeType.PROOF_DELIVERED}
POSITIVE_OUTCOMES = {OutcomeType.REPLIED_POSITIVE, OutcomeType.OPENED}
BAD_OUTCOMES = {OutcomeType.BOUNCED, OutcomeType.UNSUBSCRIBED}
UNSAFE_OUTCOMES = {OutcomeType.UNSUBSCRIBED}


@dataclass
class LabeledDecision:
    decision_id: str
    account_id: str
    label: DecisionLabel
    label_version: int = LABEL_VERSION
    confidence: float = 0.0
    reasoning: str = ""
    outcomes_used: list[str] = field(default_factory=list)


def label_decision(
    decision_id: str,
    account_id: str,
    outcomes: list[OutcomeType],
) -> LabeledDecision:
    outcome_set = set(outcomes)
    outcome_strs = [o.value for o in outcomes]

    if outcome_set & UNSAFE_OUTCOMES:
        return LabeledDecision(
            decision_id=decision_id, account_id=account_id,
            label=DecisionLabel.UNSAFE, confidence=0.95,
            reasoning="Unsafe outcome: unsubscribe or complaint",
            outcomes_used=outcome_strs,
        )

    if outcome_set & GOOD_OUTCOMES:
        return LabeledDecision(
            decision_id=decision_id, account_id=account_id,
            label=DecisionLabel.GOOD, confidence=0.90,
            reasoning="Strong positive outcome: payment, upload, or proof delivery",
            outcomes_used=outcome_strs,
        )

    if outcome_set & BAD_OUTCOMES:
        return LabeledDecision(
            decision_id=decision_id, account_id=account_id,
            label=DecisionLabel.BAD, confidence=0.80,
            reasoning="Negative outcome: bounce or complaint",
            outcomes_used=outcome_strs,
        )

    if outcome_set & POSITIVE_OUTCOMES:
        return LabeledDecision(
            decision_id=decision_id, account_id=account_id,
            label=DecisionLabel.NEUTRAL, confidence=0.60,
            reasoning="Moderate positive signal but no conversion",
            outcomes_used=outcome_strs,
        )

    if outcomes == [OutcomeType.IGNORED]:
        return LabeledDecision(
            decision_id=decision_id, account_id=account_id,
            label=DecisionLabel.UNCERTAIN, confidence=0.30,
            reasoning="No clear outcome — keep unlabeled for review",
            outcomes_used=outcome_strs,
        )

    return LabeledDecision(
        decision_id=decision_id, account_id=account_id,
        label=DecisionLabel.UNCERTAIN, confidence=0.20,
        reasoning="Ambiguous outcome combination",
        outcomes_used=outcome_strs,
    )
