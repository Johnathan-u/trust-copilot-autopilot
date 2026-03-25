"""BILL-305: Billing service tests."""

import pytest
from workers.fulfillment.billing import BillingService


class TestBilling:
    def setup_method(self):
        self.svc = BillingService()

    def test_create_checkout(self):
        session = self.svc.create_checkout("acc-1", "pro_monthly", 49900)
        assert session.status == "pending"
        assert session.stripe_session_id.startswith("cs_")

    def test_idempotent_checkout(self):
        s1 = self.svc.create_checkout("acc-1", "pro_monthly", 49900)
        s2 = self.svc.create_checkout("acc-1", "pro_monthly", 49900)
        assert s1.id == s2.id

    def test_payment_webhook(self):
        session = self.svc.create_checkout("acc-1", "pro_monthly", 49900)
        ok, msg = self.svc.process_webhook(
            "evt-1", "checkout.session.completed",
            session.stripe_session_id,
        )
        assert ok
        assert session.status == "paid"
        assert session.paid_at is not None

    def test_activation_emitted(self):
        session = self.svc.create_checkout("acc-1", "pro_monthly", 49900)
        self.svc.process_webhook("evt-1", "checkout.session.completed",
                                 session.stripe_session_id)
        tasks = self.svc.pending_activations()
        assert len(tasks) == 1
        assert tasks[0].account_id == "acc-1"

    def test_duplicate_webhook_ignored(self):
        session = self.svc.create_checkout("acc-1", "pro_monthly", 49900)
        self.svc.process_webhook("evt-1", "checkout.session.completed",
                                 session.stripe_session_id)
        ok, msg = self.svc.process_webhook("evt-1", "checkout.session.completed",
                                           session.stripe_session_id)
        assert not ok
        assert msg == "duplicate_event"
        assert len(self.svc.pending_activations()) == 1

    def test_expired_session(self):
        session = self.svc.create_checkout("acc-1", "pro_monthly", 49900)
        ok, _ = self.svc.process_webhook("evt-2", "checkout.session.expired",
                                         session.stripe_session_id)
        assert ok
        assert session.status == "expired"

    def test_subscription_created(self):
        session = self.svc.create_checkout("acc-1", "pro_monthly", 49900)
        self.svc.process_webhook("evt-1", "checkout.session.completed",
                                 session.stripe_session_id,
                                 subscription_id="sub_abc123")
        assert len(self.svc._subscriptions) == 1
