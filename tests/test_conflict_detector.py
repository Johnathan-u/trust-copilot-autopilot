"""SIE-702: Conflict detector tests."""

import pytest
from workers.qualification.conflict_detector import ConflictDetector


class TestConflictDetector:
    def setup_method(self):
        self.det = ConflictDetector()

    def test_no_conflict_first_register(self):
        r = self.det.register_strategy("acc-1", "strat-1", "cto", "hash-a")
        assert not r.has_conflict

    def test_duplicate_strategy_conflict(self):
        self.det.register_strategy("acc-1", "strat-1", "cto", "hash-a")
        r = self.det.register_strategy("acc-1", "strat-2", "cto", "hash-a")
        assert r.has_conflict
        assert "duplicate_active_strategy" in r.reason_codes

    def test_conflicting_role(self):
        self.det.register_strategy("acc-1", "strat-1", "cto", "hash-a")
        r = self.det.register_strategy("acc-1", "strat-1", "ciso", "hash-a")
        assert r.has_conflict
        assert "conflicting_target_role" in r.reason_codes

    def test_contradictory_narrative(self):
        self.det.register_strategy("acc-1", "strat-1", "cto", "hash-a")
        r = self.det.register_strategy("acc-1", "strat-1", "cto", "hash-b")
        assert r.has_conflict

    def test_clear_allows_new(self):
        self.det.register_strategy("acc-1", "strat-1", "cto", "hash-a")
        self.det.clear_strategy("acc-1")
        r = self.det.register_strategy("acc-1", "strat-2", "ciso", "hash-b")
        assert not r.has_conflict

    def test_conflict_logged(self):
        self.det.register_strategy("acc-1", "strat-1", "cto", "hash-a")
        self.det.register_strategy("acc-1", "strat-2", "cto", "hash-a")
        assert len(self.det.conflict_log()) == 1

    def test_blocked_on_conflict(self):
        self.det.register_strategy("acc-1", "strat-1", "cto", "hash-a")
        r = self.det.register_strategy("acc-1", "strat-2", "ciso", "hash-b")
        assert r.blocked
