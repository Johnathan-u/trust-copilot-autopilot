"""DATA-003: Enum completeness and consistency tests."""

import pytest

from db.models.enums import (
    AccountState,
    EvidenceKind,
    Lane,
    OutboxStatus,
    PolicyVerdict,
    ReplyClassification,
    SignalType,
    SourceType,
    SuppressionReason,
    TriggerCategory,
    VALID_TRANSITIONS,
)


class TestAccountStateEnum:
    def test_all_states_have_transition_entry(self):
        for state in AccountState:
            assert state in VALID_TRANSITIONS, f"{state.value} missing from VALID_TRANSITIONS"

    def test_no_self_transitions(self):
        for source, targets in VALID_TRANSITIONS.items():
            assert source not in targets, f"{source.value} can transition to itself"

    def test_terminal_states_have_no_exits(self):
        terminals = {AccountState.ACTIVATED, AccountState.SUPPRESSED, AccountState.BLOCKED}
        for t in terminals:
            assert VALID_TRANSITIONS[t] == [], f"{t.value} should have no transitions"


class TestLaneEnum:
    def test_three_lanes(self):
        assert len(Lane) == 3
        assert Lane.DISCOVERY.value == "discovery"
        assert Lane.QUALIFICATION.value == "qualification"
        assert Lane.CONTACT.value == "contact"


class TestSignalTypeEnum:
    def test_has_positive_and_negative_signals(self):
        positives = [s for s in SignalType if not s.value.startswith("negative_")]
        negatives = [s for s in SignalType if s.value.startswith("negative_")]
        assert len(positives) > 0
        assert len(negatives) > 0

    def test_other_is_catchall(self):
        assert SignalType.OTHER in SignalType


class TestReplyClassification:
    def test_interested_exists(self):
        assert ReplyClassification.INTERESTED.value == "interested"

    def test_unsubscribe_exists(self):
        assert ReplyClassification.UNSUBSCRIBE.value == "unsubscribe"

    def test_unknown_catchall(self):
        assert ReplyClassification.UNKNOWN.value == "unknown"
