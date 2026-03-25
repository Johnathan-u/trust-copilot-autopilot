"""ONBD-306: Provisioning tests."""

import pytest
from workers.fulfillment.provisioning import ProvisioningService


class TestProvisioning:
    def setup_method(self):
        self.svc = ProvisioningService()

    def test_provision_workspace(self):
        ws, created = self.svc.provision("acc-1", "pro_monthly", "alice@acme.com")
        assert created
        assert ws.status == "active"
        assert ws.primary_email == "alice@acme.com"

    def test_idempotent_provision(self):
        ws1, c1 = self.svc.provision("acc-1", "pro_monthly", "alice@acme.com")
        ws2, c2 = self.svc.provision("acc-1", "pro_monthly", "alice@acme.com")
        assert c1 and not c2
        assert ws1.id == ws2.id

    def test_onboarding_email_sent(self):
        self.svc.provision("acc-1", "pro_monthly", "alice@acme.com")
        emails = self.svc.emails_sent()
        assert len(emails) == 1
        assert "alice@acme.com" in emails[0].to
        assert "ready" in emails[0].subject.lower()

    def test_linked_artifacts(self):
        ws, _ = self.svc.provision(
            "acc-1", "pro_monthly", "alice@acme.com",
            upload_keys=["uploads/acc-1/file1.pdf"],
            proof_ids=["proof-1"],
        )
        assert len(ws.linked_uploads) == 1
        assert len(ws.linked_proof_ids) == 1

    def test_invite_token(self):
        ws, _ = self.svc.provision("acc-1", "pro_monthly", "alice@acme.com")
        assert ws.invite_token != ""
        emails = self.svc.emails_sent()
        assert ws.invite_token in emails[0].body

    def test_only_one_email_per_idempotent(self):
        self.svc.provision("acc-1", "pro_monthly", "alice@acme.com")
        self.svc.provision("acc-1", "pro_monthly", "alice@acme.com")
        assert len(self.svc.emails_sent()) == 1
