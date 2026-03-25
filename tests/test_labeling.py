"""SIE-602: Decision labeling tests."""

import pytest
from workers.qualification.decision_labeling import (
    label_decision, DecisionLabel, LABEL_VERSION,
)
from workers.qualification.outcome_capture import OutcomeType


class TestLabeling:
    def test_paid_is_good(self):
        ld = label_decision("d-1", "a-1", [OutcomeType.PAID])
        assert ld.label == DecisionLabel.GOOD

    def test_uploaded_is_good(self):
        ld = label_decision("d-1", "a-1", [OutcomeType.UPLOADED])
        assert ld.label == DecisionLabel.GOOD

    def test_unsubscribed_is_unsafe(self):
        ld = label_decision("d-1", "a-1", [OutcomeType.UNSUBSCRIBED])
        assert ld.label == DecisionLabel.UNSAFE

    def test_bounced_is_bad(self):
        ld = label_decision("d-1", "a-1", [OutcomeType.BOUNCED])
        assert ld.label == DecisionLabel.BAD

    def test_opened_only_is_neutral(self):
        ld = label_decision("d-1", "a-1", [OutcomeType.OPENED])
        assert ld.label == DecisionLabel.NEUTRAL

    def test_ignored_is_uncertain(self):
        ld = label_decision("d-1", "a-1", [OutcomeType.IGNORED])
        assert ld.label == DecisionLabel.UNCERTAIN

    def test_label_version(self):
        ld = label_decision("d-1", "a-1", [OutcomeType.PAID])
        assert ld.label_version == LABEL_VERSION

    def test_outcomes_used_populated(self):
        ld = label_decision("d-1", "a-1", [OutcomeType.PAID, OutcomeType.REPLIED_POSITIVE])
        assert len(ld.outcomes_used) == 2

    def test_unsafe_overrides_good(self):
        ld = label_decision("d-1", "a-1", [OutcomeType.PAID, OutcomeType.UNSUBSCRIBED])
        assert ld.label == DecisionLabel.UNSAFE
