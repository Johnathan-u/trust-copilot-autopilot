"""REPLY-207: Reply classifier and next-action planner — classifies inbound
replies and picks deterministic next actions."""

import enum
import re
from dataclasses import dataclass, field


class ReplyLabel(str, enum.Enum):
    INTERESTED = "interested"
    SEND_DETAILS = "send_details"
    REFERRAL = "referral"
    WRONG_PERSON = "wrong_person"
    NOT_NOW = "not_now"
    LEGAL_PRIVACY = "legal_privacy"
    UNSUBSCRIBE = "unsubscribe"
    OUT_OF_OFFICE = "out_of_office"
    ALREADY_SOLVED = "already_solved"
    UNCLEAR = "unclear"


class NextAction(str, enum.Enum):
    OPEN_INTAKE = "open_intake"
    SEND_PROOF = "send_proof"
    SEND_DETAILS = "send_details"
    UPDATE_BUYER = "update_buyer"
    SNOOZE_30 = "snooze_30"
    SNOOZE_90 = "snooze_90"
    SUPPRESS_FOREVER = "suppress_forever"
    FOLLOW_UP_REFERRAL = "follow_up_referral"
    NO_ACTION = "no_action"


@dataclass
class ClassificationResult:
    label: ReplyLabel
    confidence: float
    reasoning: str
    next_action: NextAction
    is_override: bool = False   # True if rule-based override bypassed model


OVERRIDE_RULES: list[tuple[ReplyLabel, re.Pattern, NextAction, str]] = [
    (ReplyLabel.UNSUBSCRIBE,
     re.compile(r"\b(unsubscribe|remove\s*me|stop\s*emailing|opt\s*out|take\s*me\s*off)\b", re.I),
     NextAction.SUPPRESS_FOREVER,
     "Explicit unsubscribe request — suppress immediately"),
    (ReplyLabel.LEGAL_PRIVACY,
     re.compile(r"\b(gdpr|ccpa|legal|attorney|lawyer|cease\s*and\s*desist|privacy\s*request|delete\s*my\s*data)\b", re.I),
     NextAction.SUPPRESS_FOREVER,
     "Legal/privacy concern — suppress immediately"),
]

CLASSIFICATION_RULES: list[tuple[ReplyLabel, re.Pattern, float, NextAction, str]] = [
    (ReplyLabel.OUT_OF_OFFICE,
     re.compile(r"\b(out\s*of\s*(the\s*)?office|ooo|auto[- ]?reply|on\s*vacation|on\s*leave)\b", re.I),
     0.90, NextAction.SNOOZE_30,
     "Auto-reply / out of office detected"),
    (ReplyLabel.INTERESTED,
     re.compile(r"\b(interested|sounds?\s*good|tell\s*me\s*more|let'?s?\s*(chat|talk|connect|meet)|schedule|set\s*up\s*(a\s*)?(call|time|meeting))\b", re.I),
     0.80, NextAction.OPEN_INTAKE,
     "Positive interest signal detected"),
    (ReplyLabel.SEND_DETAILS,
     re.compile(r"\b(send\s*(me\s*)?more\s*(info|details|information)|learn\s*more|more\s*details|what\s*does\s*it\s*cost)\b", re.I),
     0.75, NextAction.SEND_DETAILS,
     "Request for more information"),
    (ReplyLabel.REFERRAL,
     re.compile(r"\b(talk\s*to|reach\s*out\s*to|contact|cc'?ing|forward.*to|right\s*person\s*is|better\s*person)\b", re.I),
     0.70, NextAction.FOLLOW_UP_REFERRAL,
     "Referral to another person"),
    (ReplyLabel.WRONG_PERSON,
     re.compile(r"\b(wrong\s*person|not\s*(the\s*)?(right|correct)\s*person|don'?t\s*handle|not\s*my\s*(area|department|responsibility))\b", re.I),
     0.75, NextAction.UPDATE_BUYER,
     "Wrong person indication"),
    (ReplyLabel.NOT_NOW,
     re.compile(r"\b(not\s*(right\s*)?now|bad\s*timing|maybe\s*later|next\s*(quarter|year|month)|circle\s*back|revisit)\b", re.I),
     0.70, NextAction.SNOOZE_90,
     "Bad timing — snooze for re-contact"),
    (ReplyLabel.ALREADY_SOLVED,
     re.compile(r"\b(already\s*(have|use|using|solved|covered)|we'?re?\s*good|we'?re?\s*set|not\s*interested|no\s*thanks?|not\s*looking)\b", re.I),
     0.75, NextAction.SNOOZE_90,
     "Already solved or not interested"),
]


def classify_reply(
    clean_body: str,
) -> ClassificationResult:
    for label, pattern, action, reasoning in OVERRIDE_RULES:
        if pattern.search(clean_body):
            return ClassificationResult(
                label=label, confidence=0.99,
                reasoning=reasoning, next_action=action,
                is_override=True,
            )

    for label, pattern, confidence, action, reasoning in CLASSIFICATION_RULES:
        if pattern.search(clean_body):
            return ClassificationResult(
                label=label, confidence=confidence,
                reasoning=reasoning, next_action=action,
            )

    return ClassificationResult(
        label=ReplyLabel.UNCLEAR,
        confidence=0.3,
        reasoning="No clear intent pattern matched",
        next_action=NextAction.NO_ACTION,
    )
