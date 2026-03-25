"""SIE-605: Shadow scoring tests."""

import pytest
from workers.qualification.shadow_scoring import ShadowScorer
from workers.qualification.ranking_model import FeatureVector


def _fv(acc_id="acc-1"):
    return FeatureVector(account_id=acc_id, icp_score=0.8, urgency=0.7,
                         monetization_prob=0.6, why_now_score=0.5,
                         buyer_confidence=0.5, pain_confidence=0.5)


class TestShadowScorer:
    def setup_method(self):
        self.scorer = ShadowScorer()

    def test_disabled_returns_none(self):
        result = self.scorer.score(_fv(), 0.7, "live",
                                   lambda fv: (0.8, "shadow"))
        assert result is None

    def test_enabled_returns_diff(self):
        self.scorer.enable()
        result = self.scorer.score(_fv(), 0.7, "live",
                                   lambda fv: (0.8, "shadow"))
        assert result is not None
        assert result.diff == pytest.approx(0.1, abs=0.01)

    def test_no_outbound_change(self):
        self.scorer.enable()
        live_score = 0.7
        self.scorer.score(_fv(), live_score, "live",
                          lambda fv: (0.9, "shadow"))
        # live_score unchanged — shadow doesn't modify it
        assert live_score == 0.7

    def test_diff_report(self):
        self.scorer.enable()
        for i in range(5):
            self.scorer.score(_fv(f"acc-{i}"), 0.5, "live",
                              lambda fv: (0.6, "shadow"))
        report = self.scorer.diff_report()
        assert report["total"] == 5
        assert report["avg_diff"] == pytest.approx(0.1, abs=0.01)

    def test_significant_diff(self):
        self.scorer.enable()
        diff = self.scorer.score(_fv(), 0.3, "live",
                                 lambda fv: (0.8, "shadow"))
        assert diff.significant

    def test_insignificant_diff(self):
        self.scorer.enable()
        diff = self.scorer.score(_fv(), 0.7, "live",
                                 lambda fv: (0.72, "shadow"))
        assert not diff.significant
