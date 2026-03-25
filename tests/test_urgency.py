"""SIE-304: Urgency and monetization probability tests."""

import pytest
from workers.qualification.firmographics import FirmographicEstimate
from workers.qualification.pain_inference import PainInference, PainType
from workers.qualification.icp_scoring import score_icp, ICPScore
from workers.qualification.urgency import score_urgency


def _icp(score=0.75, bucket="strong_fit"):
    return ICPScore(score=score, bucket=bucket)


def _pain(pt=PainType.FIRST_ENTERPRISE_REVIEW, conf=0.85):
    return [PainInference(pain_type=pt, confidence=conf, evidence_signals=[], reasoning="")]


class TestUrgency:
    def test_high_why_now_high_urgency(self):
        u = score_urgency(_pain(), _icp(), why_now_score=0.9)
        assert u.urgency >= 0.5

    def test_low_why_now_low_urgency(self):
        u = score_urgency(_pain(), _icp(), why_now_score=0.0)
        assert u.urgency < 0.4

    def test_high_urgency_pain_boosts(self):
        high = score_urgency(_pain(PainType.FIRST_ENTERPRISE_REVIEW), _icp(), why_now_score=0.5)
        low = score_urgency(_pain(PainType.COMPLIANCE_SCALING), _icp(), why_now_score=0.5)
        assert high.urgency >= low.urgency

    def test_negatives_reduce_urgency(self):
        clean = score_urgency(_pain(), _icp(), why_now_score=0.7)
        neg = score_urgency(_pain(), _icp(), why_now_score=0.7, negative_weight=0.9)
        assert neg.urgency < clean.urgency


class TestMonetization:
    def test_high_icp_high_monetization(self):
        u = score_urgency(_pain(), _icp(0.9), why_now_score=0.7)
        assert u.monetization_prob >= 0.5

    def test_low_icp_low_monetization(self):
        u = score_urgency(
            [PainInference(PainType.UNKNOWN, 0, [], "")],
            _icp(0.1, "out_of_bounds"),
            why_now_score=0.1,
        )
        assert u.monetization_prob < 0.3

    def test_urgency_and_monetization_separate(self):
        u = score_urgency(_pain(), _icp(0.3, "marginal"), why_now_score=0.9)
        assert u.urgency > u.monetization_prob  # high timing, low fit

    def test_bounded_0_1(self):
        u = score_urgency(_pain(), _icp(1.0), why_now_score=1.0)
        assert 0.0 <= u.urgency <= 1.0
        assert 0.0 <= u.monetization_prob <= 1.0

    def test_explanations_present(self):
        u = score_urgency(_pain(), _icp(), why_now_score=0.6)
        assert len(u.urgency_explanation) > 0
        assert len(u.monetization_explanation) > 0
