"""SIE-601: Outcome capture tests."""

import pytest
from workers.qualification.outcome_capture import OutcomeStore, OutcomeType


class TestOutcomeStore:
    def setup_method(self):
        self.store = OutcomeStore()

    def test_record_outcome(self):
        e = self.store.record("acc-1", "dec-1", OutcomeType.REPLIED_POSITIVE)
        assert e.outcome_type == OutcomeType.REPLIED_POSITIVE
        assert e.account_id == "acc-1"

    def test_linked_to_decision(self):
        self.store.record("acc-1", "dec-1", OutcomeType.PAID, decision_version=3)
        events = self.store.for_decision("dec-1")
        assert len(events) == 1
        assert events[0].decision_version == 3

    def test_for_account(self):
        self.store.record("acc-1", "dec-1", OutcomeType.DELIVERED)
        self.store.record("acc-1", "dec-2", OutcomeType.REPLIED_POSITIVE)
        self.store.record("acc-2", "dec-3", OutcomeType.BOUNCED)
        assert len(self.store.for_account("acc-1")) == 2

    def test_conversion_funnel(self):
        self.store.record("acc-1", "dec-1", OutcomeType.DELIVERED)
        self.store.record("acc-1", "dec-1", OutcomeType.REPLIED_POSITIVE)
        self.store.record("acc-1", "dec-1", OutcomeType.PAID)
        funnel = self.store.conversion_funnel()
        assert funnel["delivered"] == 1
        assert funnel["paid"] == 1
