"""SAFE-208: Safety monitor tests."""

import pytest
from datetime import datetime, timezone, timedelta
from workers.send.safety import (
    SafetyMonitor, PauseScope, PauseReason, HealthMetrics,
)


class TestSafetyMonitor:
    def setup_method(self):
        self.monitor = SafetyMonitor()

    def test_no_pause_by_default(self):
        active, _ = self.monitor.is_paused(PauseScope.SYSTEM, "global")
        assert not active

    def test_manual_pause(self):
        self.monitor.pause(PauseScope.SYSTEM, "global", PauseReason.MANUAL)
        active, entry = self.monitor.is_paused(PauseScope.SYSTEM, "global")
        assert active
        assert entry.reason == PauseReason.MANUAL

    def test_resume(self):
        self.monitor.pause(PauseScope.MAILBOX, "mb-1", PauseReason.BOUNCE_SPIKE)
        self.monitor.resume(PauseScope.MAILBOX, "mb-1")
        active, _ = self.monitor.is_paused(PauseScope.MAILBOX, "mb-1")
        assert not active

    def test_auto_resume_expired(self):
        self.monitor.pause(
            PauseScope.DOMAIN, "test.com", PauseReason.COMPLAINT_SPIKE,
            auto_resume_at=datetime.now(timezone.utc) - timedelta(hours=1),
        )
        active, _ = self.monitor.is_paused(PauseScope.DOMAIN, "test.com")
        assert not active

    def test_auto_resume_not_expired(self):
        self.monitor.pause(
            PauseScope.DOMAIN, "test.com", PauseReason.COMPLAINT_SPIKE,
            auto_resume_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        active, _ = self.monitor.is_paused(PauseScope.DOMAIN, "test.com")
        assert active

    def test_bounce_spike_pauses(self):
        metrics = HealthMetrics(total_sent=100, total_bounced=10)
        pauses = self.monitor.check_health(metrics, PauseScope.MAILBOX, "mb-1")
        assert any(p.reason == PauseReason.BOUNCE_SPIKE for p in pauses)

    def test_complaint_spike_pauses(self):
        metrics = HealthMetrics(total_sent=1000, total_complaints=10)
        pauses = self.monitor.check_health(metrics, PauseScope.MAILBOX, "mb-1")
        assert any(p.reason == PauseReason.COMPLAINT_SPIKE for p in pauses)

    def test_deny_surge_pauses(self):
        metrics = HealthMetrics(total_sent=50, total_policy_denies=30)
        pauses = self.monitor.check_health(metrics, PauseScope.CAMPAIGN, "camp-1")
        assert any(p.reason == PauseReason.POLICY_DENY_SURGE for p in pauses)

    def test_below_threshold_no_pause(self):
        metrics = HealthMetrics(total_sent=5)
        pauses = self.monitor.check_health(metrics, PauseScope.MAILBOX, "mb-1")
        assert len(pauses) == 0

    def test_any_pause_active(self):
        self.monitor.pause(PauseScope.CAMPAIGN, "camp-1", PauseReason.MANUAL)
        active, entry = self.monitor.any_pause_active([
            (PauseScope.SYSTEM, "global"),
            (PauseScope.CAMPAIGN, "camp-1"),
        ])
        assert active

    def test_active_pauses_list(self):
        self.monitor.pause(PauseScope.SYSTEM, "global", PauseReason.MANUAL)
        self.monitor.pause(PauseScope.MAILBOX, "mb-1", PauseReason.BOUNCE_SPIKE)
        assert len(self.monitor.active_pauses()) == 2

    def test_recovery_requires_explicit_action(self):
        self.monitor.pause(PauseScope.SYSTEM, "global", PauseReason.BOUNCE_SPIKE)
        active, _ = self.monitor.is_paused(PauseScope.SYSTEM, "global")
        assert active
        # Still paused without explicit resume
        active, _ = self.monitor.is_paused(PauseScope.SYSTEM, "global")
        assert active
