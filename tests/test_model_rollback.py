"""SIE-606: Model rollback tests."""

import pytest
from workers.qualification.ranking_model import ModelRegistry, FeatureVector
from workers.qualification.model_rollback import ModelSelector


def _fv():
    return FeatureVector(account_id="acc-1", icp_score=0.8, urgency=0.7,
                         monetization_prob=0.6, why_now_score=0.5,
                         buyer_confidence=0.5, pain_confidence=0.5)


class TestModelSelector:
    def setup_method(self):
        self.reg = ModelRegistry()
        self.sel = ModelSelector(self.reg)

    def test_deterministic_by_default(self):
        assert self.sel.is_deterministic()
        score, source = self.sel.score(_fv())
        assert source == "deterministic"

    def test_activate_model(self):
        self.reg.register("v1", {}, {})
        assert self.sel.activate_model("v1")
        assert not self.sel.is_deterministic()

    def test_rollback(self):
        self.reg.register("v1", {}, {})
        self.sel.activate_model("v1")
        self.sel.rollback()
        assert self.sel.is_deterministic()

    def test_rollback_history(self):
        self.reg.register("v1", {}, {})
        self.sel.activate_model("v1")
        self.sel.rollback()
        history = self.sel.rollback_history()
        assert len(history) == 2
        assert history[0]["action"] == "activate"
        assert history[1]["action"] == "rollback_to_deterministic"

    def test_score_after_rollback(self):
        self.reg.register("v1", {}, {})
        self.sel.activate_model("v1")
        self.sel.rollback()
        score, source = self.sel.score(_fv())
        assert source == "deterministic"
        assert 0.0 <= score <= 1.0

    def test_activate_missing_version(self):
        assert not self.sel.activate_model("v999")

    def test_config_reflects_state(self):
        assert self.sel.config.use_learned_ranker is False
        self.reg.register("v1", {}, {})
        self.sel.activate_model("v1")
        assert self.sel.config.use_learned_ranker is True
        assert self.sel.config.active_version == "v1"
