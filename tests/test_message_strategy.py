"""SIE-501: Message strategy tests."""

import pytest
from workers.send.message_strategy import (
    build_message_strategy, MessageStrategy, Angle, CTAType, Tone,
)
from workers.qualification.pain_inference import PainType
from workers.qualification.segmentation import Segment


class TestMessageStrategy:
    def test_basic_strategy(self):
        s = build_message_strategy(
            PainType.FIRST_ENTERPRISE_REVIEW, Segment.EARLY_SOC2_STARTUP,
            "small", ["soc2_announced"], ["ev-1"],
        )
        assert isinstance(s, MessageStrategy)
        assert s.angle == Angle.PAIN_DIRECT
        assert s.pain_framing != ""

    def test_competitor_displacement_angle(self):
        s = build_message_strategy(
            PainType.QUESTIONNAIRE_OVERLOAD, Segment.QUESTIONNAIRE_PAIN,
            "mid", ["vendor_security_mention"], [], competitor_state="soften",
        )
        assert s.angle == Angle.COMPETITOR_DISPLACEMENT

    def test_tone_matches_size(self):
        small = build_message_strategy(PainType.UNKNOWN, Segment.GENERIC_FIT, "small", [], [])
        ent = build_message_strategy(PainType.UNKNOWN, Segment.GENERIC_FIT, "enterprise", [], [])
        assert small.tone == Tone.PEER
        assert ent.tone == Tone.FORMAL

    def test_proof_hook_from_trigger(self):
        s = build_message_strategy(
            PainType.CERTIFICATION_PREP, Segment.EARLY_SOC2_STARTUP,
            "small", ["soc2_announced", "funding_round"], ["ev-1"],
        )
        assert "soc2" in s.proof_hook.lower() or "announced" in s.proof_hook.lower()

    def test_grounding_facts_present(self):
        s = build_message_strategy(
            PainType.TRUST_CENTER_PRESSURE, Segment.TRUST_CENTER_LAUNCH,
            "mid", ["trust_center_launched"], ["ev-1"],
        )
        assert len(s.grounding_facts) >= 2

    def test_evidence_ids_preserved(self):
        s = build_message_strategy(
            PainType.UNKNOWN, Segment.GENERIC_FIT, "mid",
            [], ["ev-1", "ev-2"],
        )
        assert s.evidence_ids == ["ev-1", "ev-2"]
