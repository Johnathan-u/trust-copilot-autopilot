"""SIE-302: Pain inference tests."""

import pytest
from workers.qualification.pain_inference import infer_pain, PainType


class TestPainInference:
    def test_first_enterprise_review(self):
        pains = infer_pain(["soc2_announced", "upmarket_expansion"], size_band="small")
        assert pains[0].pain_type == PainType.FIRST_ENTERPRISE_REVIEW

    def test_questionnaire_overload(self):
        pains = infer_pain(["vendor_security_mention", "enterprise_customer_mention"])
        assert pains[0].pain_type == PainType.QUESTIONNAIRE_OVERLOAD

    def test_trust_center_pressure(self):
        pains = infer_pain(["trust_center_launched"])
        assert pains[0].pain_type == PainType.TRUST_CENTER_PRESSURE

    def test_compliance_scaling(self):
        pains = infer_pain(["compliance_hiring"], size_band="growth")
        assert pains[0].pain_type == PainType.COMPLIANCE_SCALING

    def test_certification_prep(self):
        pains = infer_pain(["soc2_announced"], size_band="micro")
        assert pains[0].pain_type == PainType.CERTIFICATION_PREP

    def test_no_signals_returns_unknown(self):
        pains = infer_pain([])
        assert pains[0].pain_type == PainType.UNKNOWN
        assert pains[0].confidence == 0.0

    def test_evidence_signals_present(self):
        pains = infer_pain(["soc2_announced", "upmarket_expansion"], size_band="small")
        assert len(pains[0].evidence_signals) >= 1

    def test_multiple_pains_sorted_by_confidence(self):
        pains = infer_pain(
            ["soc2_announced", "upmarket_expansion", "trust_center_launched"],
            size_band="small",
        )
        if len(pains) >= 2:
            assert pains[0].confidence >= pains[1].confidence

    def test_at_least_5_pain_types_supported(self):
        supported = set()
        test_combos = [
            (["vendor_security_mention", "enterprise_customer_mention"], "mid"),
            (["soc2_announced", "upmarket_expansion"], "small"),
            (["trust_center_launched"], "mid"),
            (["compliance_hiring"], "growth"),
            (["soc2_announced"], "micro"),
            (["vendor_security_mention"], "mid"),
        ]
        for signals, size in test_combos:
            pains = infer_pain(signals, size_band=size)
            if pains[0].pain_type != PainType.UNKNOWN:
                supported.add(pains[0].pain_type)
        assert len(supported) >= 5
