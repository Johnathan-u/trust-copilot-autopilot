"""SIE-604: Offline evaluation tests."""

import pytest
from workers.qualification.offline_eval import (
    run_evaluation, EvalRecord, precision_at_k, unsafe_rate,
)
from workers.qualification.ranking_model import FeatureVector, DeterministicRanker
from workers.qualification.decision_labeling import DecisionLabel


def _fv(acc_id, icp=0.5):
    return FeatureVector(account_id=acc_id, icp_score=icp, urgency=0.5,
                         monetization_prob=0.5, why_now_score=0.5,
                         buyer_confidence=0.5, pain_confidence=0.5)


def _records():
    return [
        EvalRecord("a1", _fv("a1", 0.9), DecisionLabel.GOOD),
        EvalRecord("a2", _fv("a2", 0.8), DecisionLabel.GOOD),
        EvalRecord("a3", _fv("a3", 0.7), DecisionLabel.NEUTRAL),
        EvalRecord("a4", _fv("a4", 0.3), DecisionLabel.BAD),
        EvalRecord("a5", _fv("a5", 0.1), DecisionLabel.UNSAFE),
    ]


class TestOfflineEval:
    def test_precision_at_k(self):
        recs = _records()
        for r in recs:
            r.predicted_score = r.features.icp_score
        assert precision_at_k(recs, 3) >= 0.6

    def test_unsafe_rate(self):
        recs = _records()
        assert unsafe_rate(recs) == 0.2

    def test_run_evaluation(self):
        ranker = DeterministicRanker()
        report = run_evaluation(_records(), ranker.score)
        assert report.total_samples == 5
        assert "precision@10" in report.metrics

    def test_threshold_check(self):
        ranker = DeterministicRanker()
        report = run_evaluation(
            _records(), ranker.score,
            thresholds={"min_precision_at_10": 0.99, "max_unsafe_rate": 0.01},
        )
        assert not report.passed_thresholds
        assert len(report.threshold_failures) >= 1

    def test_report_versioned(self):
        ranker = DeterministicRanker()
        report = run_evaluation(_records(), ranker.score, model_version="v2")
        assert report.model_version == "v2"
