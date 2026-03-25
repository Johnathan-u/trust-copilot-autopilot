"""SIE-201: Signal extractor tests — positive detection and false-positive guards."""

import pytest
from workers.discovery.signal_extractor import extract_signals


class TestPositiveExtraction:
    def test_soc2_type_ii(self):
        sigs = extract_signals("We are SOC 2 Type II certified.")
        assert any(s.signal_type == "soc2_announced" for s in sigs)

    def test_iso27001(self):
        sigs = extract_signals("We achieved ISO 27001 certification last month.")
        assert any(s.signal_type == "iso27001_mentioned" for s in sigs)

    def test_trust_center_launched(self):
        sigs = extract_signals("Our Trust Center is now available for all customers.")
        assert any(s.signal_type == "trust_center_launched" for s in sigs)

    def test_security_hiring(self):
        sigs = extract_signals("We're looking for a Security Engineer to join the team.")
        assert any(s.signal_type == "security_hiring" for s in sigs)

    def test_compliance_hiring(self):
        sigs = extract_signals("Open role: Compliance Manager for our GRC team.")
        assert any(s.signal_type == "compliance_hiring" for s in sigs)

    def test_funding_round(self):
        sigs = extract_signals("We raised $25M in Series B funding round.")
        assert any(s.signal_type == "funding_round" for s in sigs)

    def test_upmarket(self):
        sigs = extract_signals("We're moving upmarket to serve enterprise tier customers.")
        assert any(s.signal_type == "upmarket_expansion" for s in sigs)

    def test_procurement(self):
        sigs = extract_signals("Our security review process is streamlined.")
        assert any(s.signal_type == "procurement_review" for s in sigs)

    def test_certification_milestone(self):
        sigs = extract_signals("We are now HIPAA compliant.")
        assert any(s.signal_type == "certification_milestone" for s in sigs)

    def test_multiple_signals_in_one_text(self):
        text = "We achieved SOC 2 Type II and ISO 27001 certification. We are hiring a Security Engineer."
        sigs = extract_signals(text)
        types = {s.signal_type for s in sigs}
        assert "soc2_announced" in types
        assert "iso27001_mentioned" in types
        assert "security_hiring" in types


class TestNegativeExtraction:
    def test_competitor_detected(self):
        sigs = extract_signals("We already use Vanta for our compliance needs.")
        assert any(s.signal_type == "negative_competitor" for s in sigs)

    def test_too_small(self):
        sigs = extract_signals("We are a 3 employee startup.")
        assert any(s.signal_type == "negative_too_small" for s in sigs)

    def test_stale_year(self):
        sigs = extract_signals("Completed our 2018 annual audit successfully.")
        assert any(s.signal_type == "negative_stale" for s in sigs)


class TestFalsePositiveGuards:
    def test_no_signals_in_generic_text(self):
        sigs = extract_signals("The weather is nice today. We sell shoes online.")
        assert len(sigs) == 0

    def test_no_signals_in_empty_text(self):
        sigs = extract_signals("")
        assert len(sigs) == 0

    def test_partial_match_not_triggered(self):
        sigs = extract_signals("The socrates philosophy is interesting.")
        assert not any(s.signal_type == "soc2_announced" for s in sigs)


class TestEvidenceSpans:
    def test_evidence_includes_context(self):
        sigs = extract_signals("Our company achieved SOC 2 Type II certification last quarter.")
        assert len(sigs) > 0
        assert len(sigs[0].evidence_text) > 10

    def test_confidence_is_valid(self):
        sigs = extract_signals("SOC 2 Type II certified")
        for s in sigs:
            assert 0.0 <= s.confidence <= 1.0

    def test_signals_sorted_by_confidence(self):
        text = "SOC 2 certified. Also we are a 3 employee startup."
        sigs = extract_signals(text)
        if len(sigs) >= 2:
            assert sigs[0].confidence >= sigs[1].confidence
