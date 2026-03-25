"""SIE-503: CTA chooser tests."""

import pytest
from workers.send.cta_chooser import choose_cta, CTAChoice
from workers.send.message_strategy import CTAType
from workers.send.objection_prediction import ObjectionType
from workers.qualification.pain_inference import PainType


class TestCTAChooser:
    def test_questionnaire_pain_upload(self):
        r = choose_cta(PainType.QUESTIONNAIRE_OVERLOAD, "mid", 0.8, 0.7,
                       ObjectionType.NEED_MORE_INFO)
        assert r.cta == CTAType.UPLOAD_QUESTIONNAIRE

    def test_trust_center_proof_page(self):
        r = choose_cta(PainType.TRUST_CENTER_PRESSURE, "mid", 0.6, 0.5,
                       ObjectionType.NEED_MORE_INFO)
        assert r.cta == CTAType.SEND_PROOF_PAGE

    def test_enterprise_book_call(self):
        r = choose_cta(PainType.COMPLIANCE_SCALING, "enterprise", 0.8, 0.7,
                       ObjectionType.NEED_MORE_INFO, deal_tier="enterprise")
        assert r.cta == CTAType.BOOK_CALL

    def test_low_confidence_send_details(self):
        r = choose_cta(PainType.UNKNOWN, "mid", 0.2, 0.1,
                       ObjectionType.BAD_TIMING)
        assert r.cta == CTAType.SEND_DETAILS

    def test_competitor_locked_no_cta(self):
        r = choose_cta(PainType.UNKNOWN, "mid", 0.5, 0.5,
                       ObjectionType.COMPETITOR_LOCKED)
        assert r.cta == CTAType.NO_CTA

    def test_upload_not_used_blindly(self):
        r = choose_cta(PainType.EVIDENCE_CHAOS, "mid", 0.8, 0.7,
                       ObjectionType.NEED_MORE_INFO)
        assert r.cta != CTAType.UPLOAD_QUESTIONNAIRE

    def test_rationale_present(self):
        r = choose_cta(PainType.QUESTIONNAIRE_OVERLOAD, "mid", 0.8, 0.7,
                       ObjectionType.NEED_MORE_INFO)
        assert len(r.rationale) > 5
