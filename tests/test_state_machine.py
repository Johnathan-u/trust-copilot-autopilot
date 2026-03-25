"""DATA-003: State machine transition tests."""

import pytest

from db.models.enums import AccountState, VALID_TRANSITIONS
from services.state_machine import StateMachine


class TestTransitionGuards:
    def test_raw_signal_to_candidate_allowed(self):
        sm = StateMachine.__new__(StateMachine)
        assert sm.can_transition(AccountState.RAW_SIGNAL, AccountState.CANDIDATE_ACCOUNT)

    def test_raw_signal_to_contacted_forbidden(self):
        sm = StateMachine.__new__(StateMachine)
        assert not sm.can_transition(AccountState.RAW_SIGNAL, AccountState.CONTACTED)

    def test_candidate_to_qualified_allowed(self):
        sm = StateMachine.__new__(StateMachine)
        assert sm.can_transition(AccountState.CANDIDATE_ACCOUNT, AccountState.QUALIFIED_ACCOUNT)

    def test_activated_has_no_transitions(self):
        sm = StateMachine.__new__(StateMachine)
        for target in AccountState:
            assert not sm.can_transition(AccountState.ACTIVATED, target)

    def test_blocked_is_terminal(self):
        sm = StateMachine.__new__(StateMachine)
        for target in AccountState:
            assert not sm.can_transition(AccountState.BLOCKED, target)

    def test_suppressed_is_terminal(self):
        sm = StateMachine.__new__(StateMachine)
        for target in AccountState:
            assert not sm.can_transition(AccountState.SUPPRESSED, target)

    def test_snoozed_can_return_to_earlier_states(self):
        sm = StateMachine.__new__(StateMachine)
        assert sm.can_transition(AccountState.SNOOZED, AccountState.CANDIDATE_ACCOUNT)
        assert sm.can_transition(AccountState.SNOOZED, AccountState.QUALIFIED_ACCOUNT)
        assert sm.can_transition(AccountState.SNOOZED, AccountState.CONTACTABLE)

    def test_every_non_terminal_state_can_reach_blocked(self):
        sm = StateMachine.__new__(StateMachine)
        terminal = {AccountState.ACTIVATED, AccountState.SUPPRESSED, AccountState.BLOCKED}
        for source in AccountState:
            if source in terminal:
                continue
            assert sm.can_transition(source, AccountState.BLOCKED), (
                f"{source.value} should be able to transition to blocked"
            )

    def test_forward_progression(self):
        sm = StateMachine.__new__(StateMachine)
        happy_path = [
            AccountState.RAW_SIGNAL,
            AccountState.CANDIDATE_ACCOUNT,
            AccountState.QUALIFIED_ACCOUNT,
            AccountState.CONTACTABLE,
            AccountState.CONTACTED,
            AccountState.REPLIED,
            AccountState.INTAKE_OPEN,
            AccountState.UPLOADED,
            AccountState.FULFILLED,
            AccountState.OFFER_SENT,
            AccountState.PAID,
            AccountState.ACTIVATED,
        ]
        for i in range(len(happy_path) - 1):
            assert sm.can_transition(happy_path[i], happy_path[i + 1]), (
                f"{happy_path[i].value} -> {happy_path[i+1].value} should be valid"
            )

    def test_no_backward_jumps_in_main_path(self):
        sm = StateMachine.__new__(StateMachine)
        assert not sm.can_transition(AccountState.CONTACTED, AccountState.RAW_SIGNAL)
        assert not sm.can_transition(AccountState.PAID, AccountState.CONTACTED)
        assert not sm.can_transition(AccountState.FULFILLED, AccountState.CANDIDATE_ACCOUNT)
