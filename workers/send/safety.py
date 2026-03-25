"""SAFE-208: Kill switches, complaint thresholds, and automatic pauses —
monitors health metrics and pauses sends on threshold breaches."""

import enum
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


class PauseScope(str, enum.Enum):
    SYSTEM = "system"
    LANE = "lane"
    CAMPAIGN = "campaign"
    MAILBOX = "mailbox"
    DOMAIN = "domain"


class PauseReason(str, enum.Enum):
    BOUNCE_SPIKE = "bounce_spike"
    COMPLAINT_SPIKE = "complaint_spike"
    MAILBOX_UNHEALTHY = "mailbox_unhealthy"
    POLICY_DENY_SURGE = "policy_deny_surge"
    MANUAL = "manual"
    AUTO_RESUME_EXPIRED = "auto_resume_expired"


@dataclass
class PauseEntry:
    scope: PauseScope
    key: str                    # scope-specific key (mailbox_id, domain, etc.)
    reason: PauseReason
    paused_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    auto_resume_at: Optional[datetime] = None
    paused_by: str = "system"

    @property
    def is_active(self) -> bool:
        if self.auto_resume_at and datetime.now(timezone.utc) >= self.auto_resume_at:
            return False
        return True


@dataclass
class HealthMetrics:
    total_sent: int = 0
    total_bounced: int = 0
    total_complaints: int = 0
    total_policy_denies: int = 0
    window_minutes: int = 60

    @property
    def bounce_rate(self) -> float:
        return self.total_bounced / max(self.total_sent, 1)

    @property
    def complaint_rate(self) -> float:
        return self.total_complaints / max(self.total_sent, 1)

    @property
    def deny_rate(self) -> float:
        return self.total_policy_denies / max(self.total_sent + self.total_policy_denies, 1)


DEFAULT_THRESHOLDS = {
    "max_bounce_rate": 0.05,
    "max_complaint_rate": 0.003,
    "max_deny_rate": 0.20,
    "min_sends_for_threshold": 10,
}


class SafetyMonitor:
    def __init__(self, thresholds: dict | None = None) -> None:
        self.thresholds = {**DEFAULT_THRESHOLDS, **(thresholds or {})}
        self._pauses: dict[str, PauseEntry] = {}
        self._audit_log: list[dict] = []

    def _pause_key(self, scope: PauseScope, key: str) -> str:
        return f"{scope.value}:{key}"

    def is_paused(self, scope: PauseScope, key: str) -> tuple[bool, Optional[PauseEntry]]:
        pk = self._pause_key(scope, key)
        entry = self._pauses.get(pk)
        if entry and entry.is_active:
            return True, entry
        if entry and not entry.is_active:
            del self._pauses[pk]
        return False, None

    def any_pause_active(self, scopes: list[tuple[PauseScope, str]]) -> tuple[bool, Optional[PauseEntry]]:
        for scope, key in scopes:
            active, entry = self.is_paused(scope, key)
            if active:
                return True, entry
        return False, None

    def pause(self, scope: PauseScope, key: str, reason: PauseReason,
              auto_resume_at: Optional[datetime] = None,
              paused_by: str = "system") -> PauseEntry:
        pk = self._pause_key(scope, key)
        entry = PauseEntry(
            scope=scope, key=key, reason=reason,
            auto_resume_at=auto_resume_at, paused_by=paused_by,
        )
        self._pauses[pk] = entry
        self._audit_log.append({
            "action": "pause",
            "scope": scope.value,
            "key": key,
            "reason": reason.value,
            "at": datetime.now(timezone.utc).isoformat(),
        })
        return entry

    def resume(self, scope: PauseScope, key: str, resumed_by: str = "operator") -> bool:
        pk = self._pause_key(scope, key)
        if pk in self._pauses:
            del self._pauses[pk]
            self._audit_log.append({
                "action": "resume",
                "scope": scope.value,
                "key": key,
                "resumed_by": resumed_by,
                "at": datetime.now(timezone.utc).isoformat(),
            })
            return True
        return False

    def check_health(self, metrics: HealthMetrics,
                     scope: PauseScope, key: str) -> list[PauseEntry]:
        new_pauses: list[PauseEntry] = []
        if metrics.total_sent < self.thresholds["min_sends_for_threshold"]:
            return new_pauses

        if metrics.bounce_rate > self.thresholds["max_bounce_rate"]:
            entry = self.pause(scope, key, PauseReason.BOUNCE_SPIKE)
            new_pauses.append(entry)

        if metrics.complaint_rate > self.thresholds["max_complaint_rate"]:
            entry = self.pause(scope, key, PauseReason.COMPLAINT_SPIKE)
            new_pauses.append(entry)

        if metrics.deny_rate > self.thresholds["max_deny_rate"]:
            entry = self.pause(scope, key, PauseReason.POLICY_DENY_SURGE)
            new_pauses.append(entry)

        return new_pauses

    def active_pauses(self) -> list[PauseEntry]:
        return [e for e in self._pauses.values() if e.is_active]
