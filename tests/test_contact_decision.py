"""SIE-405: Contact decision engine tests."""

import pytest
from workers.qualification.icp_scoring import ICPScore
from workers.qualification.urgency import UrgencyScore
from workers.qualification.deal_value import DealValueEstimate
from workers.qualification.contact_plan import ContactPlan, ContactSlot
from workers.qualification.competitor_detection import CompetitorHit
from workers.qualification.account_memory import AccountMemory
from workers.qualification.contact_decision import make_contact_decision
from datetime import datetime, timezone, timedelta


def _icp(score=0.8, bucket="strong_fit"):
    return ICPScore(score=score, bucket=bucket)


def _urgency(urg=0.7, mon=0.7):
    return UrgencyScore(urgency=urg, monetization_prob=mon,
                        urgency_explanation="", monetization_explanation="")


def _dv(ev=50000):
    return DealValueEstimate(monthly_value_estimate=50000, ltv_bucket="high",
                             expected_value=ev, tier="pro", explanation="")


def _plan(role="cto", conf=0.8):
    return ContactPlan(account_id="acc-1", slots=[
        ContactSlot(rank=1, name="Alice", role="CTO", normalized_role=role,
                    role_fit_score=1.0, confidence=conf),
    ], max_attempts=1)


def _comp_block():
    return [CompetitorHit(competitor="vanta", evidence_snippet="uses Vanta",
                          evidence_url="", confidence=0.85, effect="block",
                          reason="direct competitor")]


def _comp_soften():
    return [CompetitorHit(competitor="sprinto", evidence_snippet="looked at sprinto",
                          evidence_url="", confidence=0.6, effect="soften",
                          reason="smaller competitor")]


class TestContactDecision:
    def test_approve_contact(self):
        d = make_contact_decision(_icp(), _urgency(), _dv(), _plan(), [])
        assert d.decision == "contact"
        assert d.priority_tier >= 1

    def test_block_hard_negative(self):
        d = make_contact_decision(_icp(), _urgency(), _dv(), _plan(), [],
                                  has_hard_negatives=True)
        assert d.decision == "no_contact"
        assert "hard_negative_signal" in d.reason_codes

    def test_block_competitor(self):
        d = make_contact_decision(_icp(), _urgency(), _dv(), _plan(), _comp_block())
        assert d.decision == "no_contact"
        assert "blocking_competitor" in d.reason_codes

    def test_block_out_of_bounds(self):
        d = make_contact_decision(_icp(0.1, "out_of_bounds"), _urgency(), _dv(), _plan(), [])
        assert d.decision == "no_contact"

    def test_block_no_candidates(self):
        empty = ContactPlan(account_id="acc-1", max_attempts=0, stop_reason="none")
        d = make_contact_decision(_icp(), _urgency(), _dv(), empty, [])
        assert d.decision == "no_contact"

    def test_tier1_high_composite(self):
        d = make_contact_decision(_icp(0.9), _urgency(0.9, 0.9), _dv(), _plan(conf=0.9), [])
        assert d.priority_tier == 1

    def test_soften_lowers_priority(self):
        clean = make_contact_decision(_icp(), _urgency(), _dv(), _plan(), [])
        soft = make_contact_decision(_icp(), _urgency(), _dv(), _plan(), _comp_soften())
        assert soft.priority_tier >= clean.priority_tier

    def test_target_role_from_plan(self):
        d = make_contact_decision(_icp(), _urgency(), _dv(), _plan("ciso"), [])
        assert d.target_role == "ciso"

    def test_explanation_present(self):
        d = make_contact_decision(_icp(), _urgency(), _dv(), _plan(), [])
        assert "Contact approved" in d.explanation

    def test_no_contact_explainable(self):
        d = make_contact_decision(_icp(), _urgency(), _dv(), _plan(), [],
                                  has_hard_negatives=True)
        assert len(d.explanation) > 0

    def test_snoozed_memory_defers(self):
        mem = AccountMemory(
            account_id="acc-1",
            snooze_until=datetime.now(timezone.utc) + timedelta(days=30),
        )
        d = make_contact_decision(_icp(), _urgency(), _dv(), _plan(), [],
                                  account_memory=mem)
        assert d.decision == "defer"

    def test_hard_objection_blocks(self):
        mem = AccountMemory(
            account_id="acc-1",
            objection_tags=["not_interested"],
            last_contacted=datetime.now(timezone.utc) - timedelta(days=10),
        )
        d = make_contact_decision(_icp(), _urgency(), _dv(), _plan(), [],
                                  account_memory=mem)
        assert d.decision == "no_contact"
