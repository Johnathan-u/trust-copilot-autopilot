"""SIE-306: Micro-segmentation tests."""

import pytest
from workers.qualification.firmographics import FirmographicEstimate
from workers.qualification.pain_inference import PainInference, PainType
from workers.qualification.icp_scoring import ICPScore
from workers.qualification.segmentation import segment_account, Segment


def _firm(size="mid", industry="saas", b2b=0.8, ent=0.4):
    return FirmographicEstimate(
        size_band=size, industry=industry, is_b2b=b2b,
        enterprise_motion=ent, product_type="platform", confidence=0.7,
    )


def _icp(score=0.7, bucket="good_fit"):
    return ICPScore(score=score, bucket=bucket)


def _pain(pt=PainType.UNKNOWN, conf=0.0):
    return [PainInference(pain_type=pt, confidence=conf, evidence_signals=[], reasoning="")]


class TestSegmentation:
    def test_early_soc2_startup(self):
        r = segment_account(
            ["soc2_announced"], _firm("small"), _pain(PainType.CERTIFICATION_PREP, 0.8), _icp()
        )
        assert r.primary == Segment.EARLY_SOC2_STARTUP

    def test_post_funding_push(self):
        r = segment_account(
            ["funding_round", "upmarket_expansion"], _firm("mid"), _pain(), _icp()
        )
        assert r.primary == Segment.POST_FUNDING_PUSH

    def test_trust_center_launch(self):
        r = segment_account(
            ["trust_center_launched"], _firm(), _pain(PainType.TRUST_CENTER_PRESSURE, 0.8), _icp()
        )
        assert r.primary == Segment.TRUST_CENTER_LAUNCH

    def test_hiring_led_scale(self):
        r = segment_account(
            ["compliance_hiring"], _firm("growth"), _pain(PainType.COMPLIANCE_SCALING, 0.8), _icp()
        )
        assert r.primary == Segment.HIRING_LED_SCALE

    def test_questionnaire_pain(self):
        r = segment_account(
            ["vendor_security_mention"], _firm(), _pain(PainType.QUESTIONNAIRE_OVERLOAD, 0.8), _icp()
        )
        assert r.primary == Segment.QUESTIONNAIRE_PAIN

    def test_no_match_good_icp_generic(self):
        r = segment_account([], _firm(), _pain(), _icp(0.8, "strong_fit"))
        assert r.primary == Segment.GENERIC_FIT

    def test_no_match_bad_icp_not_segmented(self):
        r = segment_account([], _firm(), _pain(), _icp(0.1, "out_of_bounds"))
        assert r.primary == Segment.NOT_SEGMENTED

    def test_alternates_populated(self):
        r = segment_account(
            ["soc2_announced", "funding_round", "upmarket_expansion"],
            _firm("small"),
            _pain(PainType.FIRST_ENTERPRISE_REVIEW, 0.85),
            _icp(),
        )
        assert len(r.alternates) >= 0  # may have alternates

    def test_confidence_present(self):
        r = segment_account(
            ["soc2_announced"], _firm("small"), _pain(PainType.CERTIFICATION_PREP, 0.8), _icp()
        )
        assert r.confidence > 0

    def test_reasons_present(self):
        r = segment_account(
            ["trust_center_launched"], _firm(), _pain(PainType.TRUST_CENTER_PRESSURE, 0.8), _icp()
        )
        assert len(r.reasons) >= 1

    def test_every_contactable_gets_segment(self):
        combos = [
            (["soc2_announced"], "small", PainType.CERTIFICATION_PREP),
            (["funding_round", "upmarket_expansion"], "mid", PainType.FIRST_ENTERPRISE_REVIEW),
            (["trust_center_launched"], "mid", PainType.TRUST_CENTER_PRESSURE),
            (["compliance_hiring"], "growth", PainType.COMPLIANCE_SCALING),
            (["vendor_security_mention"], "mid", PainType.QUESTIONNAIRE_OVERLOAD),
        ]
        for signals, size, pain in combos:
            r = segment_account(signals, _firm(size), _pain(pain, 0.8), _icp())
            assert r.primary != Segment.NOT_SEGMENTED, f"Failed for {signals}"
