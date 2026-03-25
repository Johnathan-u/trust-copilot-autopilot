"""MAIL-205: Send worker tests."""

import pytest
from libs.policy.suppression import SuppressionService, SuppressionScope, SuppressionReason
from workers.send.send_worker import SendWorker, SendTask, BounceEvent, ComplaintEvent


def _task(**kw):
    defaults = dict(
        id="task-1", mailbox_id="mb-1", mailbox_email="send@myco.com",
        recipient_email="alice@acme.com", subject="Test", body_text="Hello there.",
        policy_decision_id="pol-1", budget_token="budget-1",
        account_id="acc-1", contact_id="ct-1", campaign_id="camp-1",
    )
    defaults.update(kw)
    return SendTask(**defaults)


class TestSendWorker:
    def setup_method(self):
        self.suppression = SuppressionService()
        self.worker = SendWorker(self.suppression)

    def test_successful_send(self):
        result = self.worker.send(_task())
        assert result.success
        assert result.provider_message_id != ""
        assert result.payload_hash != ""

    def test_missing_policy_fails(self):
        result = self.worker.send(_task(policy_decision_id=""))
        assert not result.success
        assert "policy" in result.error.lower()

    def test_missing_budget_fails(self):
        result = self.worker.send(_task(budget_token=""))
        assert not result.success
        assert "budget" in result.error.lower()

    def test_suppressed_recipient_fails(self):
        self.suppression.add(SuppressionScope.EMAIL, "alice@acme.com",
                             SuppressionReason.UNSUBSCRIBE)
        result = self.worker.send(_task())
        assert not result.success
        assert "suppressed" in result.error.lower()

    def test_hard_bounce_suppresses(self):
        self.worker.process_bounce(BounceEvent(
            recipient_email="bob@fail.com", bounce_type="hard", reason="mailbox not found",
        ))
        suppressed, _ = self.suppression.is_suppressed(email="bob@fail.com")
        assert suppressed

    def test_soft_bounce_no_suppress(self):
        self.worker.process_bounce(BounceEvent(
            recipient_email="bob@temp.com", bounce_type="soft",
        ))
        suppressed, _ = self.suppression.is_suppressed(email="bob@temp.com")
        assert not suppressed

    def test_complaint_suppresses(self):
        self.worker.process_complaint(ComplaintEvent(
            recipient_email="angry@co.com", complaint_type="spam",
        ))
        suppressed, _ = self.suppression.is_suppressed(email="angry@co.com")
        assert suppressed

    def test_send_fn_exception(self):
        def fail_fn(task):
            raise ConnectionError("SMTP failed")
        worker = SendWorker(self.suppression, send_fn=fail_fn)
        result = worker.send(_task())
        assert not result.success
        assert "SMTP" in result.error
