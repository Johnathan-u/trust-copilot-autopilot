"""MSG-203: Grounded message composer — schema-driven generation of outreach
messages from the strategy object, with strict validation."""

import re
from dataclasses import dataclass, field
from typing import Optional

from workers.send.message_strategy import MessageStrategy, CTAType


REQUIRED_FOOTER = "[Company Name] | [Address]"
REQUIRED_UNSUB = "unsubscribe"
MAX_SUBJECT_LENGTH = 80
MAX_BODY_LENGTH = 1200
MIN_BODY_LENGTH = 50

PROHIBITED_CLAIMS = [
    re.compile(r"\b(guarantee|100%|never\s*fail|zero\s*risk|perfect)\b", re.I),
    re.compile(r"\b(best\s*in\s*class|industry\s*leading|#1\s*rated)\b", re.I),
]


@dataclass
class ComposedMessage:
    subject: str
    body_text: str
    trigger_facts_used: list[str]
    pain_angle: str
    cta_type: CTAType
    variant_type: str           # "first_touch" | "follow_up" | "reply" | "objection_response"
    has_footer: bool = False
    has_unsubscribe: bool = False


@dataclass
class ValidationResult:
    valid: bool
    errors: list[str] = field(default_factory=list)


def validate_message(msg: ComposedMessage) -> ValidationResult:
    errors: list[str] = []

    if len(msg.subject) > MAX_SUBJECT_LENGTH:
        errors.append(f"Subject exceeds {MAX_SUBJECT_LENGTH} chars: {len(msg.subject)}")
    if not msg.subject:
        errors.append("Subject is empty")

    if len(msg.body_text) > MAX_BODY_LENGTH:
        errors.append(f"Body exceeds {MAX_BODY_LENGTH} chars: {len(msg.body_text)}")
    if len(msg.body_text) < MIN_BODY_LENGTH:
        errors.append(f"Body too short: {len(msg.body_text)} chars (min {MIN_BODY_LENGTH})")

    if not msg.trigger_facts_used:
        errors.append("No trigger facts cited — message not grounded")

    for pattern in PROHIBITED_CLAIMS:
        if pattern.search(msg.body_text) or pattern.search(msg.subject):
            errors.append(f"Prohibited claim detected: {pattern.pattern}")

    if not msg.has_footer:
        errors.append("Missing required footer content")

    if not msg.has_unsubscribe:
        errors.append("Missing unsubscribe mechanism")

    if msg.cta_type == CTAType.NO_CTA and msg.variant_type == "first_touch":
        errors.append("First touch requires a CTA")

    return ValidationResult(valid=len(errors) == 0, errors=errors)


def compose_message(
    strategy: MessageStrategy,
    company_name: str,
    recipient_name: str,
    variant_type: str = "first_touch",
) -> ComposedMessage:
    subject = f"Quick question about {strategy.pain_framing}"
    if len(subject) > MAX_SUBJECT_LENGTH:
        subject = subject[:MAX_SUBJECT_LENGTH - 3] + "..."

    parts = [f"Hi {recipient_name},"]

    if strategy.proof_hook:
        parts.append(f"\n{strategy.proof_hook}, I thought this might be relevant.")
    else:
        parts.append(f"\nI noticed {company_name} might be {strategy.pain_framing}.")

    parts.append(f"\nMany teams in similar situations have found a faster path through this.")

    if strategy.objection_prehandle:
        parts.append(f"\n{strategy.objection_prehandle}")

    cta_text = {
        CTAType.UPLOAD_QUESTIONNAIRE: "Would it help if you could upload a questionnaire and get a response in minutes?",
        CTAType.SEND_PROOF_PAGE: "I can send a sample proof page showing how this works in practice.",
        CTAType.SEND_DETAILS: "Happy to share more details if useful.",
        CTAType.BOOK_CALL: "Would a quick call this week be helpful?",
        CTAType.NO_CTA: "",
    }

    cta = cta_text.get(strategy.cta_type, "")
    if cta:
        parts.append(f"\n{cta}")

    parts.append(f"\nBest,\n[Sender Name]")
    parts.append(f"\n---\n{REQUIRED_FOOTER}")
    parts.append(f"If you'd prefer not to hear from us, reply '{REQUIRED_UNSUB}' and we'll remove you immediately.")

    body = "\n".join(parts)

    return ComposedMessage(
        subject=subject,
        body_text=body,
        trigger_facts_used=strategy.grounding_facts[:],
        pain_angle=strategy.pain_framing,
        cta_type=strategy.cta_type,
        variant_type=variant_type,
        has_footer=REQUIRED_FOOTER in body,
        has_unsubscribe=REQUIRED_UNSUB.lower() in body.lower(),
    )
