"""SIE-206: Negative signal detector tests."""

import pytest

from workers.discovery.negative_detector import (
    detect_negatives,
    has_hard_block,
    negative_reason_codes,
)


class TestCompetitorDetection:
    def test_already_using_vanta(self):
        negs = detect_negatives("We already use Vanta for compliance automation.")
        assert any(n.signal_type == "negative_competitor" for n in negs)
        assert any(n.severity == "hard" for n in negs)

    def test_powered_by_drata(self):
        negs = detect_negatives("Our trust center is powered by Drata.")
        assert any(n.signal_type == "negative_competitor" for n in negs)

    def test_no_competitor_in_generic(self):
        negs = detect_negatives("We sell widgets to consumers.")
        assert not any(n.signal_type == "negative_competitor" for n in negs)


class TestSizeDetection:
    def test_too_small(self):
        negs = detect_negatives("We are a 3 employee startup building tools.")
        assert any(n.signal_type == "negative_too_small" for n in negs)

    def test_too_large(self):
        negs = detect_negatives("Our company has 100,000 employees worldwide.")
        assert any(n.signal_type == "negative_too_large" for n in negs)


class TestStaleDetection:
    def test_old_announcement(self):
        negs = detect_negatives("In 2018 we announced our compliance certification.")
        assert any(n.signal_type == "negative_stale" for n in negs)

    def test_recent_not_stale(self):
        negs = detect_negatives("In 2025 we announced our compliance certification.")
        assert not any(n.signal_type == "negative_stale" for n in negs)


class TestHardBlock:
    def test_competitor_is_hard_block(self):
        negs = detect_negatives("We already use Secureframe for SOC 2.")
        assert has_hard_block(negs)

    def test_size_is_soft(self):
        negs = detect_negatives("We are a 2 employee company.")
        assert not has_hard_block(negs)

    def test_empty_no_block(self):
        assert not has_hard_block([])


class TestReasonCodes:
    def test_codes_extracted(self):
        negs = detect_negatives("We already use Vanta. We are a 3 employee startup.")
        codes = negative_reason_codes(negs)
        assert "competitor_in_use" in codes
        assert "company_too_small" in codes

    def test_evidence_in_codes(self):
        negs = detect_negatives("We already use Vanta for compliance.")
        codes = negative_reason_codes(negs)
        assert len(codes["competitor_in_use"]) > 0
