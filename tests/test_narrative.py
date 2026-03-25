"""SIE-204: Narrative generator tests."""

import uuid
from datetime import datetime, timedelta, timezone

import pytest

from workers.discovery.fusion import fuse_account_signals, FusedSignalInput
from workers.discovery.narrative import generate_narrative, validate_narrative


def _fused_with_signals(sig_types, days_ago=1):
    sigs = [
        FusedSignalInput(
            signal_id=str(uuid.uuid4()),
            signal_type=st,
            observed_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
            confidence=0.9,
        )
        for st in sig_types
    ]
    return fuse_account_signals("acc-test", sigs)


class TestNarrativeGeneration:
    def test_basic_narrative(self):
        fused = _fused_with_signals(["soc2_announced", "security_hiring"])
        narr = generate_narrative(fused, "Acme Corp")
        assert "Acme Corp" in narr.text
        assert len(narr.cited_evidence_ids) >= 2
        assert len(narr.grounding_facts) >= 2

    def test_no_signals_narrative(self):
        fused = fuse_account_signals("acc-empty", [])
        narr = generate_narrative(fused, "EmptyCo")
        assert "no actionable signals" in narr.text.lower()
        assert narr.cited_evidence_ids == []

    def test_negative_signals_mentioned(self):
        fused = _fused_with_signals(["soc2_announced", "negative_competitor"])
        narr = generate_narrative(fused, "TestCo")
        assert "negative" in narr.text.lower() or "However" in narr.text

    def test_strong_timing(self):
        fused = _fused_with_signals(
            ["soc2_announced", "compliance_hiring", "trust_center_launched"],
            days_ago=0,
        )
        narr = generate_narrative(fused, "HotCo")
        assert "timing" in narr.text.lower() or "signal" in narr.text.lower()


class TestNarrativeValidation:
    def test_clean_narrative_passes(self):
        fused = _fused_with_signals(["soc2_announced"])
        narr = generate_narrative(fused, "CleanCo")
        violations = validate_narrative(narr)
        assert violations == []

    def test_forbidden_claim_detected(self):
        fused = _fused_with_signals(["soc2_announced"])
        narr = generate_narrative(fused)
        narr.text += " This will definitely convert."
        violations = validate_narrative(narr)
        assert len(violations) > 0
        assert any("definitely" in v for v in violations)

    def test_all_evidence_cited(self):
        fused = _fused_with_signals(["soc2_announced", "iso27001_mentioned"])
        narr = generate_narrative(fused, "CitedCo")
        assert len(narr.cited_evidence_ids) == len(fused.evidence_ids)
