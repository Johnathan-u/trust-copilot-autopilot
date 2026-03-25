"""SIE-402: Buyer psychology map tests."""

import pytest
from workers.qualification.buyer_psychology import (
    get_buyer_priority, explain_buyer_choice, PAIN_ROLE_MAP, MAP_VERSION,
)
from workers.qualification.pain_inference import PainType


class TestBuyerPriority:
    def test_micro_first_review_is_founder(self):
        bp = get_buyer_priority(PainType.FIRST_ENTERPRISE_REVIEW, "micro")
        assert bp.primary_role == "founder_ceo"

    def test_mid_questionnaire_is_security(self):
        bp = get_buyer_priority(PainType.QUESTIONNAIRE_OVERLOAD, "mid")
        assert bp.primary_role == "head_security"

    def test_growth_compliance_scaling(self):
        bp = get_buyer_priority(PainType.COMPLIANCE_SCALING, "growth")
        assert bp.primary_role == "head_compliance"

    def test_small_cert_prep_is_cto(self):
        bp = get_buyer_priority(PainType.CERTIFICATION_PREP, "small")
        assert bp.primary_role == "cto"

    def test_all_pain_types_have_map(self):
        mapped = set(PAIN_ROLE_MAP.keys())
        for pt in PainType:
            if pt != PainType.UNKNOWN:
                assert pt in mapped, f"Missing map for {pt}"

    def test_secondary_roles_present(self):
        bp = get_buyer_priority(PainType.FIRST_ENTERPRISE_REVIEW, "mid")
        assert len(bp.secondary_roles) >= 1

    def test_reasoning_not_empty(self):
        bp = get_buyer_priority(PainType.TRUST_CENTER_PRESSURE, "small")
        assert len(bp.reasoning) > 10


class TestExplainBuyerChoice:
    def test_primary_match_explains(self):
        explanation = explain_buyer_choice(PainType.FIRST_ENTERPRISE_REVIEW, "small", "cto")
        assert "Primary" in explanation

    def test_secondary_match_explains(self):
        explanation = explain_buyer_choice(PainType.FIRST_ENTERPRISE_REVIEW, "small", "founder_ceo")
        assert "fallback" in explanation

    def test_unmatched_role_explains(self):
        explanation = explain_buyer_choice(PainType.FIRST_ENTERPRISE_REVIEW, "small", "devops_lead")
        assert "not in the buyer map" in explanation

    def test_map_version_exists(self):
        assert MAP_VERSION >= 1
