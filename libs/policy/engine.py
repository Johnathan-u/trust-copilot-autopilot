"""POL-201: Deterministic policy engine — runtime compliance and sender safety
rules that gate every send with traceable decisions."""

import enum
from dataclasses import dataclass, field
from typing import Optional

from db.models.enums import PolicyVerdict


class RuleID(str, enum.Enum):
    APPROVED_COUNTRY = "approved_country"
    APPROVED_RECIPIENT_TYPE = "approved_recipient_type"
    MIN_CONTACT_SCORE = "min_contact_score"
    TRIGGER_STALENESS = "trigger_staleness"
    SUPPRESSION_CHECK = "suppression_check"
    MAILBOX_HEALTH = "mailbox_health"
    FOOTER_REQUIRED = "footer_required"
    UNSUBSCRIBE_REQUIRED = "unsubscribe_required"
    BUYER_CONFIDENCE_MIN = "buyer_confidence_min"
    ICP_MINIMUM = "icp_minimum"
    SYSTEM_PAUSE = "system_pause"


@dataclass
class RuleResult:
    rule_id: RuleID
    passed: bool
    reason: str


@dataclass
class PolicyDecisionResult:
    verdict: PolicyVerdict
    rule_results: list[RuleResult] = field(default_factory=list)
    deny_reasons: list[str] = field(default_factory=list)
    explanation: str = ""

    @property
    def allowed(self) -> bool:
        return self.verdict == PolicyVerdict.ALLOW


APPROVED_COUNTRIES = {"US", "CA", "GB", "DE", "FR", "AU", "NL", "SE", "IE", "NZ", "SG"}
APPROVED_RECIPIENT_TYPES = {"business", "professional"}
FREE_MAIL_DOMAINS = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"}

DEFAULT_THRESHOLDS = {
    "min_contact_score": 0.25,
    "max_trigger_age_days": 90,
    "min_buyer_confidence": 0.30,
    "min_icp_score": 0.25,
    "min_mailbox_health": 0.5,
}


class PolicyEngine:
    def __init__(self, thresholds: dict | None = None):
        self.thresholds = {**DEFAULT_THRESHOLDS, **(thresholds or {})}

    def evaluate(
        self,
        country: str = "US",
        recipient_type: str = "business",
        contact_score: float = 0.5,
        trigger_age_days: float = 0.0,
        is_suppressed: bool = False,
        mailbox_health: float = 1.0,
        has_footer: bool = True,
        has_unsubscribe: bool = True,
        buyer_confidence: float = 0.5,
        icp_score: float = 0.5,
        system_paused: bool = False,
    ) -> PolicyDecisionResult:
        results: list[RuleResult] = []
        denies: list[str] = []

        def check(rule_id: RuleID, passed: bool, reason: str) -> None:
            results.append(RuleResult(rule_id=rule_id, passed=passed, reason=reason))
            if not passed:
                denies.append(reason)

        check(RuleID.SYSTEM_PAUSE, not system_paused,
              "System is paused — all sends blocked")

        check(RuleID.SUPPRESSION_CHECK, not is_suppressed,
              "Recipient is on suppression list")

        check(RuleID.APPROVED_COUNTRY, country.upper() in APPROVED_COUNTRIES,
              f"Country {country} not in approved list")

        check(RuleID.APPROVED_RECIPIENT_TYPE, recipient_type in APPROVED_RECIPIENT_TYPES,
              f"Recipient type {recipient_type} not approved")

        check(RuleID.MIN_CONTACT_SCORE,
              contact_score >= self.thresholds["min_contact_score"],
              f"Contact score {contact_score:.2f} below minimum {self.thresholds['min_contact_score']}")

        check(RuleID.TRIGGER_STALENESS,
              trigger_age_days <= self.thresholds["max_trigger_age_days"],
              f"Trigger age {trigger_age_days:.0f}d exceeds {self.thresholds['max_trigger_age_days']}d")

        check(RuleID.MAILBOX_HEALTH,
              mailbox_health >= self.thresholds["min_mailbox_health"],
              f"Mailbox health {mailbox_health:.2f} below minimum")

        check(RuleID.FOOTER_REQUIRED, has_footer,
              "Message missing required footer content")

        check(RuleID.UNSUBSCRIBE_REQUIRED, has_unsubscribe,
              "Message missing unsubscribe mechanism")

        check(RuleID.BUYER_CONFIDENCE_MIN,
              buyer_confidence >= self.thresholds["min_buyer_confidence"],
              f"Buyer confidence {buyer_confidence:.2f} below minimum")

        check(RuleID.ICP_MINIMUM,
              icp_score >= self.thresholds["min_icp_score"],
              f"ICP score {icp_score:.2f} below minimum")

        if denies:
            verdict = PolicyVerdict.DENY
            explanation = f"DENIED: {'; '.join(denies)}"
        else:
            verdict = PolicyVerdict.ALLOW
            explanation = "All policy checks passed"

        return PolicyDecisionResult(
            verdict=verdict,
            rule_results=results,
            deny_reasons=denies,
            explanation=explanation,
        )
