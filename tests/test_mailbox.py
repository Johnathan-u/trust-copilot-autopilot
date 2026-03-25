"""MAIL-204: Mailbox orchestrator tests."""

import pytest
from workers.send.mailbox_orchestrator import (
    MailboxOrchestrator, Mailbox, MailboxStatus,
)


def _mb(id="mb-1", email="send@myco.com", **kw):
    return Mailbox(id=id, email=email, **kw)


class TestMailbox:
    def test_can_send_active(self):
        m = _mb()
        assert m.can_send

    def test_cannot_send_paused(self):
        m = _mb(status=MailboxStatus.PAUSED)
        assert not m.can_send

    def test_cannot_send_over_daily(self):
        m = _mb(daily_cap=10, sent_today=10)
        assert not m.can_send

    def test_cannot_send_bad_dns(self):
        m = _mb(spf_ok=False)
        assert not m.can_send


class TestOrchestrator:
    def test_allocate_single(self):
        orch = MailboxOrchestrator([_mb()])
        result = orch.allocate(["alice@acme.com"])
        assert len(result.allocated) == 1
        assert not result.unallocated

    def test_allocate_increments_counts(self):
        mb = _mb()
        orch = MailboxOrchestrator([mb])
        orch.allocate(["alice@acme.com"])
        assert mb.sent_today == 1
        assert mb.sent_this_hour == 1

    def test_dry_run_no_increment(self):
        mb = _mb()
        orch = MailboxOrchestrator([mb])
        orch.allocate(["alice@acme.com"], dry_run=True)
        assert mb.sent_today == 0

    def test_no_self_domain_send(self):
        orch = MailboxOrchestrator([_mb(email="send@acme.com")])
        result = orch.allocate(["bob@acme.com"])
        assert len(result.unallocated) == 1

    def test_no_available_mailboxes(self):
        orch = MailboxOrchestrator([_mb(status=MailboxStatus.PAUSED)])
        result = orch.allocate(["alice@acme.com"])
        assert len(result.unallocated) == 1

    def test_pause_and_resume(self):
        mb = _mb()
        orch = MailboxOrchestrator([mb])
        orch.pause_mailbox("mb-1")
        assert not mb.can_send
        orch.resume_mailbox("mb-1")
        assert mb.can_send

    def test_preflight_check(self):
        orch = MailboxOrchestrator([_mb()])
        check = orch.preflight_check("mb-1")
        assert check["exists"]
        assert check["can_send"]
        assert check["dns_ready"]

    def test_multiple_recipients(self):
        orch = MailboxOrchestrator([_mb(daily_cap=100)])
        result = orch.allocate(["a@co.com", "b@co.com", "c@co.com"])
        assert len(result.allocated) == 3
