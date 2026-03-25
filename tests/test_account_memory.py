"""SIE-406: Account memory tests."""

import pytest
from datetime import datetime, timezone, timedelta
from workers.qualification.account_memory import (
    AccountMemory, record_outcome, check_reactivation, should_recontact,
    SNOOZE_DURATIONS, REACTIVATION_SIGNALS,
)


class TestAccountMemory:
    def test_is_snoozed_active(self):
        mem = AccountMemory(
            account_id="acc-1",
            snooze_until=datetime.now(timezone.utc) + timedelta(days=30),
        )
        assert mem.is_snoozed

    def test_is_snoozed_expired(self):
        mem = AccountMemory(
            account_id="acc-1",
            snooze_until=datetime.now(timezone.utc) - timedelta(days=1),
        )
        assert not mem.is_snoozed

    def test_is_snoozed_no_date(self):
        mem = AccountMemory(account_id="acc-1")
        assert not mem.is_snoozed

    def test_hard_objection(self):
        mem = AccountMemory(account_id="acc-1", objection_tags=["not_interested"])
        assert mem.hard_objection

    def test_soft_objection_not_hard(self):
        mem = AccountMemory(account_id="acc-1", objection_tags=["timing_bad"])
        assert not mem.hard_objection

    def test_has_new_trigger(self):
        mem = AccountMemory(
            account_id="acc-1",
            last_contacted=datetime.now(timezone.utc) - timedelta(days=5),
            last_trigger_at=datetime.now(timezone.utc),
            reactivation_triggers=["funding_round"],
        )
        assert mem.has_new_trigger

    def test_no_new_trigger(self):
        mem = AccountMemory(
            account_id="acc-1",
            last_contacted=datetime.now(timezone.utc),
            last_trigger_at=datetime.now(timezone.utc) - timedelta(days=10),
        )
        assert not mem.has_new_trigger


class TestRecordOutcome:
    def test_records_basic(self):
        mem = AccountMemory(account_id="acc-1")
        record_outcome(mem, "no_reply")
        assert mem.last_outcome == "no_reply"
        assert mem.contact_count == 1

    def test_increments_count(self):
        mem = AccountMemory(account_id="acc-1", contact_count=2)
        record_outcome(mem, "no_reply")
        assert mem.contact_count == 3

    def test_adds_objections(self):
        mem = AccountMemory(account_id="acc-1")
        record_outcome(mem, "negative_reply", objections=["not_interested"])
        assert "not_interested" in mem.objection_tags

    def test_snooze_sets_date(self):
        mem = AccountMemory(account_id="acc-1")
        record_outcome(mem, "negative_reply", snooze_reason="soft_no")
        assert mem.snooze_until is not None
        assert mem.snooze_until > datetime.now(timezone.utc)


class TestReactivation:
    def test_reactivation_on_new_signal(self):
        mem = AccountMemory(account_id="acc-1", contact_count=1,
                            last_outcome="no_reply",
                            last_contacted=datetime.now(timezone.utc) - timedelta(days=60))
        reactivated, triggers = check_reactivation(mem, ["funding_round"])
        assert reactivated
        assert "funding_round" in triggers

    def test_no_reactivation_non_trigger(self):
        mem = AccountMemory(account_id="acc-1")
        reactivated, triggers = check_reactivation(mem, ["random_signal"])
        assert not reactivated

    def test_hard_objection_cooldown(self):
        mem = AccountMemory(
            account_id="acc-1",
            objection_tags=["not_interested"],
            last_contacted=datetime.now(timezone.utc) - timedelta(days=10),
        )
        reactivated, _ = check_reactivation(mem, ["soc2_announced"])
        assert not reactivated


class TestShouldRecontact:
    def test_first_contact(self):
        mem = AccountMemory(account_id="acc-1")
        ok, reason = should_recontact(mem)
        assert ok
        assert reason == "first_contact"

    def test_snoozed(self):
        mem = AccountMemory(
            account_id="acc-1",
            snooze_until=datetime.now(timezone.utc) + timedelta(days=30),
        )
        ok, reason = should_recontact(mem)
        assert not ok

    def test_max_no_reply(self):
        mem = AccountMemory(account_id="acc-1", contact_count=3, last_outcome="no_reply")
        ok, reason = should_recontact(mem)
        assert not ok
        assert "max_attempts" in reason

    def test_reactivated(self):
        mem = AccountMemory(
            account_id="acc-1", contact_count=3, last_outcome="no_reply",
            reactivation_triggers=["funding_round"],
            last_trigger_at=datetime.now(timezone.utc),
            last_contacted=datetime.now(timezone.utc) - timedelta(days=60),
        )
        ok, reason = should_recontact(mem)
        assert ok
        assert "reactivated" in reason
