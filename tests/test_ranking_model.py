"""SIE-603: Ranking model tests."""

import pytest
from workers.qualification.ranking_model import (
    DeterministicRanker, ModelRegistry, encode_features,
)


def _fv(icp=0.8, urg=0.7, mon=0.7, why=0.6, buyer=0.8, pain=0.8,
        sigs=5, negs=0, size="mid", ent=0.5, b2b=0.8):
    return encode_features("acc-1", icp, urg, mon, why, buyer, pain,
                           sigs, negs, size, ent, b2b)


class TestDeterministicRanker:
    def test_score_in_range(self):
        ranker = DeterministicRanker()
        score = ranker.score(_fv())
        assert 0.0 <= score <= 1.0

    def test_high_features_high_score(self):
        ranker = DeterministicRanker()
        high = ranker.score(_fv(0.9, 0.9, 0.9, 0.9, 0.9, 0.9))
        low = ranker.score(_fv(0.1, 0.1, 0.1, 0.1, 0.1, 0.1))
        assert high > low

    def test_negatives_reduce_score(self):
        ranker = DeterministicRanker()
        clean = ranker.score(_fv(negs=0))
        neg = ranker.score(_fv(negs=3))
        assert neg < clean

    def test_fallback_always_available(self):
        registry = ModelRegistry()
        score, source = registry.score(_fv())
        assert source == "deterministic"
        assert 0.0 <= score <= 1.0


class TestModelRegistry:
    def test_register_and_activate(self):
        reg = ModelRegistry()
        reg.register("v1", {"icp": 0.3}, {"precision@10": 0.8})
        assert reg.activate("v1")
        assert reg.active_version() == "v1"

    def test_rollback(self):
        reg = ModelRegistry()
        reg.register("v1", {}, {})
        reg.activate("v1")
        reg.rollback_to_deterministic()
        assert reg.active_version() is None

    def test_activate_missing_version(self):
        reg = ModelRegistry()
        assert not reg.activate("v999")

    def test_score_with_active(self):
        reg = ModelRegistry()
        reg.register("v1", {}, {})
        reg.activate("v1")
        score, source = reg.score(_fv())
        assert "v1" in source


class TestFeatureEncoding:
    def test_encode(self):
        fv = encode_features("acc-1", 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 5, 1, "mid", 0.5, 0.8)
        assert fv.size_band_encoded == 3
        assert fv.account_id == "acc-1"
