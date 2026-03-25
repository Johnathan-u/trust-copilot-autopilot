"""SIE-203: Account signal fusion tests."""

import uuid
from datetime import datetime, timedelta, timezone

import pytest

from workers.discovery.fusion import fuse_account_signals, FusedSignalInput


class TestFusion:
    def _make_signal(self, sig_type, days_ago=0, confidence=0.9):
        return FusedSignalInput(
            signal_id=str(uuid.uuid4()),
            signal_type=sig_type,
            observed_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
            confidence=confidence,
        )

    def test_empty_signals(self):
        result = fuse_account_signals("acc-1", [])
        assert result.signal_count == 0
        assert result.why_now_score == 0.0
        assert result.top_triggers == []

    def test_single_positive_signal(self):
        sigs = [self._make_signal("soc2_announced", days_ago=1)]
        result = fuse_account_signals("acc-1", sigs)
        assert result.signal_count == 1
        assert result.positive_weight > 0
        assert len(result.top_triggers) == 1
        assert result.negatives == []

    def test_mixed_signals(self):
        sigs = [
            self._make_signal("soc2_announced", days_ago=2),
            self._make_signal("security_hiring", days_ago=5),
            self._make_signal("negative_competitor", days_ago=1),
        ]
        result = fuse_account_signals("acc-1", sigs)
        assert result.signal_count == 3
        assert result.positive_weight > 0
        assert result.negative_weight > 0
        assert len(result.negatives) >= 1

    def test_stale_signals_decay(self):
        fresh = [self._make_signal("soc2_announced", days_ago=1)]
        stale = [self._make_signal("soc2_announced", days_ago=180)]
        fresh_result = fuse_account_signals("acc-1", fresh)
        stale_result = fuse_account_signals("acc-2", stale)
        assert fresh_result.positive_weight > stale_result.positive_weight

    def test_evidence_ids_collected(self):
        sigs = [
            self._make_signal("soc2_announced"),
            self._make_signal("compliance_hiring"),
        ]
        result = fuse_account_signals("acc-1", sigs)
        assert len(result.evidence_ids) == 2

    def test_trigger_freshness_recent(self):
        sigs = [self._make_signal("soc2_announced", days_ago=0)]
        result = fuse_account_signals("acc-1", sigs)
        assert result.trigger_freshness > 0.9

    def test_trigger_freshness_old(self):
        sigs = [self._make_signal("soc2_announced", days_ago=85)]
        result = fuse_account_signals("acc-1", sigs)
        assert result.trigger_freshness < 0.2

    def test_top_triggers_capped(self):
        sigs = [self._make_signal("soc2_announced", days_ago=i) for i in range(15)]
        result = fuse_account_signals("acc-1", sigs)
        assert len(result.top_triggers) <= 10
