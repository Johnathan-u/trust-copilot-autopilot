"""Policy engine stub — will be expanded in Increment 6 (MSG/POL tickets)."""

from db.models.enums import PolicyVerdict, SuppressionReason
from libs.contracts.schemas import AccountDTO


class PolicyEngine:
    """Evaluates whether an account should be contacted.

    Rules are additive: any DENY overrides. Evaluated in order:
    1. Suppression list check
    2. Budget gating
    3. Cool-off period
    4. Domain safety (free-mail, role-based)
    """

    def evaluate(
        self,
        account: AccountDTO,
        suppressed_domains: set[str],
        budget_available: bool,
    ) -> tuple[PolicyVerdict, list[str]]:
        reasons: list[str] = []

        if account.domain in suppressed_domains:
            reasons.append("domain_suppressed")
            return PolicyVerdict.DENY, reasons

        if not budget_available:
            reasons.append("budget_exhausted")
            return PolicyVerdict.SNOOZE, reasons

        reasons.append("all_checks_passed")
        return PolicyVerdict.ALLOW, reasons
