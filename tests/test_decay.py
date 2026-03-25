"""SIE-205: Temporal decay and why-now scoring tests."""

from datetime import datetime, timedelta, timezone

import pytest

from workers.discovery.decay import (
    exponential_decay,
    decayed_weight,
    compute_why_now_score,
    SignalInput,
)


class TestExponentialDecay:
    def test_zero_age_is_one(self):
        assert exponential_decay(0, 90) == pytest.approx(1.0)

    def test_one_half_life_is_half(self):
        assert exponential_decay(90, 90) == pytest.approx(0.5, abs=0.01)

    def test_two_half_lives_is_quarter(self):
        assert exponential_decay(180, 90) == pytest.approx(0.25, abs=0.02)

    def test_zero_half_life(self):
        assert exponential_decay(10, 0) == 0.0

    def test_very_old_near_zero(self):
        assert exponential_decay(1000, 30) < 0.001


class TestDecayedWeight:
    def test_fresh_soc2(self):
        now = datetime.now(timezone.utc)
        w = decayed_weight("soc2_announced", now, now)
        assert w == pytest.approx(1.0, abs=0.01)

    def test_stale_soc2(self):
        now = datetime.now(timezone.utc)
        old = now - timedelta(days=180)
        w = decayed_weight("soc2_announced", old, now)
        assert w < 0.3

    def test_unknown_type_zero(self):
        now = datetime.now(timezone.utc)
        assert decayed_weight("nonexistent", now, now) == 0.0


class TestWhyNowScore:
    def test_no_signals_zero(self):
        assert compute_why_now_score([]) == 0.0

    def test_strong_fresh_signals_high(self):
        now = datetime.now(timezone.utc)
        sigs = [
            SignalInput("soc2_announced", now, 0.95),
            SignalInput("compliance_hiring", now - timedelta(days=2), 0.9),
            SignalInput("trust_center_launched", now - timedelta(days=1), 0.85),
        ]
        score = compute_why_now_score(sigs, now)
        assert score >= 0.6

    def test_stale_signals_lower(self):
        now = datetime.now(timezone.utc)
        fresh = [SignalInput("soc2_announced", now, 0.9)]
        stale = [SignalInput("soc2_announced", now - timedelta(days=300), 0.9)]
        fresh_score = compute_why_now_score(fresh, now)
        stale_score = compute_why_now_score(stale, now)
        assert fresh_score > stale_score

    def test_negatives_reduce_score(self):
        now = datetime.now(timezone.utc)
        positive_only = [SignalInput("soc2_announced", now, 0.9)]
        with_negative = [
            SignalInput("soc2_announced", now, 0.9),
            SignalInput("negative_competitor", now, 0.85),
        ]
        pos_score = compute_why_now_score(positive_only, now)
        neg_score = compute_why_now_score(with_negative, now)
        assert pos_score >= neg_score

    def test_score_bounded_0_1(self):
        now = datetime.now(timezone.utc)
        sigs = [SignalInput("soc2_announced", now, 1.0)] * 20
        score = compute_why_now_score(sigs, now)
        assert 0.0 <= score <= 1.0
