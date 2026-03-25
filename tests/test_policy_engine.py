"""POL-201: Policy engine tests."""

import pytest
from db.models.enums import PolicyVerdict
from libs.policy.engine import PolicyEngine, RuleID


class TestPolicyEngine:
    def setup_method(self):
        self.engine = PolicyEngine()

    def test_all_pass(self):
        d = self.engine.evaluate()
        assert d.allowed
        assert d.verdict == PolicyVerdict.ALLOW

    def test_suppressed_denies(self):
        d = self.engine.evaluate(is_suppressed=True)
        assert not d.allowed
        assert any("suppression" in r for r in d.deny_reasons)

    def test_bad_country_denies(self):
        d = self.engine.evaluate(country="XX")
        assert not d.allowed

    def test_low_contact_score_denies(self):
        d = self.engine.evaluate(contact_score=0.05)
        assert not d.allowed

    def test_stale_trigger_denies(self):
        d = self.engine.evaluate(trigger_age_days=120)
        assert not d.allowed

    def test_unhealthy_mailbox_denies(self):
        d = self.engine.evaluate(mailbox_health=0.2)
        assert not d.allowed

    def test_missing_footer_denies(self):
        d = self.engine.evaluate(has_footer=False)
        assert not d.allowed

    def test_missing_unsubscribe_denies(self):
        d = self.engine.evaluate(has_unsubscribe=False)
        assert not d.allowed

    def test_low_buyer_confidence_denies(self):
        d = self.engine.evaluate(buyer_confidence=0.1)
        assert not d.allowed

    def test_low_icp_denies(self):
        d = self.engine.evaluate(icp_score=0.1)
        assert not d.allowed

    def test_system_paused_denies(self):
        d = self.engine.evaluate(system_paused=True)
        assert not d.allowed

    def test_multiple_denies_accumulated(self):
        d = self.engine.evaluate(is_suppressed=True, has_footer=False, system_paused=True)
        assert len(d.deny_reasons) >= 3

    def test_custom_thresholds(self):
        engine = PolicyEngine({"min_contact_score": 0.9})
        d = engine.evaluate(contact_score=0.5)
        assert not d.allowed

    def test_rule_results_present(self):
        d = self.engine.evaluate()
        assert len(d.rule_results) >= 10

    def test_denied_cannot_bypass(self):
        d1 = self.engine.evaluate(is_suppressed=True)
        d2 = self.engine.evaluate(is_suppressed=True)
        assert not d1.allowed
        assert not d2.allowed
