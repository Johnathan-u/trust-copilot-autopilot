"""POL-202: Suppression, allowlist, denylist services — immediate enforcement
of unsubscribe, legal, bounce, and manual block across all lanes."""

import enum
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


class SuppressionScope(str, enum.Enum):
    EMAIL = "email"
    DOMAIN = "domain"
    ACCOUNT = "account"
    CAMPAIGN = "campaign"


class SuppressionReason(str, enum.Enum):
    UNSUBSCRIBE = "unsubscribe"
    LEGAL_REQUEST = "legal_request"
    HARD_BOUNCE = "hard_bounce"
    MANUAL_BLOCK = "manual_block"
    WRONG_PERSON = "wrong_person_do_not_retry"
    COMPLAINT = "complaint"


@dataclass
class SuppressionRecord:
    scope: SuppressionScope
    key: str                    # email, domain, account_id, or campaign_id
    reason: SuppressionReason
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str = "system"
    notes: str = ""


class SuppressionService:
    def __init__(self) -> None:
        self._entries: dict[str, SuppressionRecord] = {}

    def _make_key(self, scope: SuppressionScope, key: str) -> str:
        return f"{scope.value}:{key.lower().strip()}"

    def add(self, scope: SuppressionScope, key: str, reason: SuppressionReason,
            created_by: str = "system", notes: str = "") -> SuppressionRecord:
        composite = self._make_key(scope, key)
        record = SuppressionRecord(
            scope=scope, key=key.lower().strip(), reason=reason,
            created_by=created_by, notes=notes,
        )
        self._entries[composite] = record
        return record

    def is_suppressed(self, email: str = "", domain: str = "",
                      account_id: str = "", campaign_id: str = "") -> tuple[bool, Optional[SuppressionRecord]]:
        checks = []
        if email:
            checks.append(self._make_key(SuppressionScope.EMAIL, email))
        if domain:
            checks.append(self._make_key(SuppressionScope.DOMAIN, domain))
        elif email and "@" in email:
            checks.append(self._make_key(SuppressionScope.DOMAIN, email.split("@")[1]))
        if account_id:
            checks.append(self._make_key(SuppressionScope.ACCOUNT, account_id))
        if campaign_id:
            checks.append(self._make_key(SuppressionScope.CAMPAIGN, campaign_id))

        for ck in checks:
            if ck in self._entries:
                return True, self._entries[ck]
        return False, None

    def remove(self, scope: SuppressionScope, key: str,
               admin: str = "") -> bool:
        composite = self._make_key(scope, key)
        if composite in self._entries:
            del self._entries[composite]
            return True
        return False

    def bulk_import(self, records: list[tuple[SuppressionScope, str, SuppressionReason]]) -> int:
        count = 0
        for scope, key, reason in records:
            self.add(scope, key, reason)
            count += 1
        return count

    def list_entries(self, scope: Optional[SuppressionScope] = None) -> list[SuppressionRecord]:
        if scope is None:
            return list(self._entries.values())
        return [r for r in self._entries.values() if r.scope == scope]
