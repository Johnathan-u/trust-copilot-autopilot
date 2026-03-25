"""MSG-203: Composer tests."""

import pytest
from workers.send.composer import compose_message, validate_message, ComposedMessage
from workers.send.message_strategy import (
    MessageStrategy, Angle, CTAType, Tone, build_message_strategy,
)
from workers.qualification.pain_inference import PainType
from workers.qualification.segmentation import Segment


def _strategy(**kwargs):
    defaults = dict(
        pain_type=PainType.FIRST_ENTERPRISE_REVIEW,
        segment=Segment.EARLY_SOC2_STARTUP,
        size_band="small",
        top_triggers=["soc2_announced"],
        evidence_ids=["ev-1"],
    )
    defaults.update(kwargs)
    return build_message_strategy(**defaults)


class TestComposer:
    def test_compose_basic(self):
        msg = compose_message(_strategy(), "Acme Inc", "Alice")
        assert "Alice" in msg.body_text
        assert msg.subject != ""

    def test_has_footer(self):
        msg = compose_message(_strategy(), "Acme", "Bob")
        assert msg.has_footer

    def test_has_unsubscribe(self):
        msg = compose_message(_strategy(), "Acme", "Bob")
        assert msg.has_unsubscribe

    def test_trigger_facts_grounded(self):
        msg = compose_message(_strategy(), "Acme", "Bob")
        assert len(msg.trigger_facts_used) >= 1


class TestValidation:
    def test_valid_message_passes(self):
        msg = compose_message(_strategy(), "Acme", "Bob")
        result = validate_message(msg)
        assert result.valid

    def test_empty_subject_fails(self):
        msg = compose_message(_strategy(), "Acme", "Bob")
        msg.subject = ""
        result = validate_message(msg)
        assert not result.valid

    def test_long_body_fails(self):
        msg = compose_message(_strategy(), "Acme", "Bob")
        msg.body_text = "x" * 1500
        result = validate_message(msg)
        assert not result.valid

    def test_prohibited_claim_fails(self):
        msg = compose_message(_strategy(), "Acme", "Bob")
        msg.body_text = msg.body_text + " We guarantee 100% accuracy."
        result = validate_message(msg)
        assert not result.valid

    def test_missing_footer_fails(self):
        msg = compose_message(_strategy(), "Acme", "Bob")
        msg.has_footer = False
        result = validate_message(msg)
        assert not result.valid

    def test_no_trigger_facts_fails(self):
        msg = compose_message(_strategy(), "Acme", "Bob")
        msg.trigger_facts_used = []
        result = validate_message(msg)
        assert not result.valid
