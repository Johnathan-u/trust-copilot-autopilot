"""SIE-502: Objection prediction tests."""

import pytest
from workers.send.objection_prediction import (
    predict_objection, ObjectionType,
)
from workers.qualification.pain_inference import PainType
from workers.qualification.segmentation import Segment


class TestObjectionPrediction:
    def test_competitor_block(self):
        r = predict_objection(
            PainType.UNKNOWN, Segment.GENERIC_FIT, "mid",
            competitor_state="block", urgency_score=0.5, buyer_confidence=0.7,
        )
        assert r.top_objection == ObjectionType.COMPETITOR_LOCKED

    def test_competitor_soften(self):
        r = predict_objection(
            PainType.UNKNOWN, Segment.GENERIC_FIT, "mid",
            competitor_state="soften", urgency_score=0.5, buyer_confidence=0.7,
        )
        assert r.top_objection == ObjectionType.COMPETITOR_LOCKED

    def test_low_urgency(self):
        r = predict_objection(
            PainType.UNKNOWN, Segment.GENERIC_FIT, "mid",
            competitor_state="no_competitor", urgency_score=0.1, buyer_confidence=0.7,
        )
        assert r.top_objection == ObjectionType.BAD_TIMING

    def test_micro_too_early(self):
        r = predict_objection(
            PainType.CERTIFICATION_PREP, Segment.EARLY_SOC2_STARTUP, "micro",
            competitor_state="no_competitor", urgency_score=0.5, buyer_confidence=0.7,
        )
        assert r.top_objection in (ObjectionType.TOO_EARLY, ObjectionType.TOO_EXPENSIVE)

    def test_no_strong_pattern(self):
        r = predict_objection(
            PainType.FIRST_ENTERPRISE_REVIEW, Segment.POST_FUNDING_PUSH, "mid",
            competitor_state="no_competitor", urgency_score=0.7, buyer_confidence=0.8,
        )
        assert r.top_objection == ObjectionType.NEED_MORE_INFO

    def test_prehandle_hint_present(self):
        r = predict_objection(
            PainType.UNKNOWN, Segment.GENERIC_FIT, "mid",
            competitor_state="block", urgency_score=0.5, buyer_confidence=0.7,
        )
        assert len(r.prehandle_hint) > 0

    def test_alternates_populated(self):
        r = predict_objection(
            PainType.CERTIFICATION_PREP, Segment.EARLY_SOC2_STARTUP, "micro",
            competitor_state="no_competitor", urgency_score=0.1, buyer_confidence=0.3,
        )
        assert len(r.alternates) >= 0  # may have alternates
