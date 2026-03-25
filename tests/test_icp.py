"""SIE-303: ICP scoring tests."""

import pytest
from workers.qualification.firmographics import FirmographicEstimate
from workers.qualification.pain_inference import PainInference, PainType
from workers.qualification.icp_scoring import score_icp


def _firm(size="mid", industry="saas", b2b=0.8, ent=0.4):
    return FirmographicEstimate(
        size_band=size, industry=industry, is_b2b=b2b,
        enterprise_motion=ent, product_type="platform", confidence=0.7,
    )


def _pain(pt=PainType.FIRST_ENTERPRISE_REVIEW, conf=0.85):
    return [PainInference(pain_type=pt, confidence=conf, evidence_signals=[], reasoning="")]


class TestICPScoring:
    def test_strong_fit(self):
        icp = score_icp(_firm(), _pain())
        assert icp.bucket == "strong_fit"
        assert icp.score >= 0.75

    def test_b2c_penalized(self):
        icp = score_icp(_firm(b2b=0.1), _pain())
        assert icp.score < score_icp(_firm(b2b=0.9), _pain()).score

    def test_enterprise_too_large_penalty(self):
        icp = score_icp(_firm(size="enterprise"), _pain())
        assert "enterprise_may_not_need_product" in icp.penalties

    def test_micro_still_scored(self):
        icp = score_icp(_firm(size="micro"), _pain(PainType.CERTIFICATION_PREP))
        assert icp.score > 0

    def test_no_pain_lower_score(self):
        with_pain = score_icp(_firm(), _pain())
        no_pain = score_icp(_firm(), [PainInference(PainType.UNKNOWN, 0, [], "")])
        assert with_pain.score > no_pain.score

    def test_negatives_reduce_score(self):
        clean = score_icp(_firm(), _pain())
        neg = score_icp(_firm(), _pain(), has_negatives=True, negative_weight=0.8)
        assert neg.score < clean.score

    def test_marginal_vs_out_of_bounds(self):
        marginal = score_icp(_firm(size="unknown", industry="unknown", b2b=0.5, ent=0.0), _pain())
        oob = score_icp(
            _firm(size="unknown", industry="unknown", b2b=0.1, ent=0.0),
            [PainInference(PainType.UNKNOWN, 0, [], "")],
            has_negatives=True, negative_weight=1.0,
        )
        assert marginal.score > oob.score

    def test_explanation_present(self):
        icp = score_icp(_firm(), _pain())
        assert "ICP=" in icp.explanation
        assert icp.bucket in icp.explanation
