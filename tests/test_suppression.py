"""POL-202: Suppression service tests."""

import pytest
from libs.policy.suppression import (
    SuppressionService, SuppressionScope, SuppressionReason,
)


class TestSuppressionService:
    def setup_method(self):
        self.svc = SuppressionService()

    def test_add_and_check_email(self):
        self.svc.add(SuppressionScope.EMAIL, "bob@acme.com", SuppressionReason.UNSUBSCRIBE)
        suppressed, record = self.svc.is_suppressed(email="bob@acme.com")
        assert suppressed
        assert record.reason == SuppressionReason.UNSUBSCRIBE

    def test_domain_suppression(self):
        self.svc.add(SuppressionScope.DOMAIN, "blocked.com", SuppressionReason.LEGAL_REQUEST)
        suppressed, _ = self.svc.is_suppressed(domain="blocked.com")
        assert suppressed

    def test_domain_from_email(self):
        self.svc.add(SuppressionScope.DOMAIN, "blocked.com", SuppressionReason.HARD_BOUNCE)
        suppressed, _ = self.svc.is_suppressed(email="anyone@blocked.com")
        assert suppressed

    def test_account_suppression(self):
        self.svc.add(SuppressionScope.ACCOUNT, "acc-123", SuppressionReason.MANUAL_BLOCK)
        suppressed, _ = self.svc.is_suppressed(account_id="acc-123")
        assert suppressed

    def test_not_suppressed(self):
        suppressed, record = self.svc.is_suppressed(email="clean@acme.com")
        assert not suppressed
        assert record is None

    def test_remove_requires_explicit_action(self):
        self.svc.add(SuppressionScope.EMAIL, "bob@acme.com", SuppressionReason.UNSUBSCRIBE)
        removed = self.svc.remove(SuppressionScope.EMAIL, "bob@acme.com", admin="ops")
        assert removed
        suppressed, _ = self.svc.is_suppressed(email="bob@acme.com")
        assert not suppressed

    def test_bulk_import(self):
        records = [
            (SuppressionScope.EMAIL, "a@test.com", SuppressionReason.HARD_BOUNCE),
            (SuppressionScope.EMAIL, "b@test.com", SuppressionReason.COMPLAINT),
            (SuppressionScope.DOMAIN, "spam.com", SuppressionReason.MANUAL_BLOCK),
        ]
        count = self.svc.bulk_import(records)
        assert count == 3
        suppressed, _ = self.svc.is_suppressed(email="a@test.com")
        assert suppressed

    def test_list_entries(self):
        self.svc.add(SuppressionScope.EMAIL, "a@t.com", SuppressionReason.UNSUBSCRIBE)
        self.svc.add(SuppressionScope.DOMAIN, "t.com", SuppressionReason.LEGAL_REQUEST)
        all_entries = self.svc.list_entries()
        assert len(all_entries) == 2
        email_only = self.svc.list_entries(SuppressionScope.EMAIL)
        assert len(email_only) == 1

    def test_case_insensitive(self):
        self.svc.add(SuppressionScope.EMAIL, "Bob@ACME.com", SuppressionReason.UNSUBSCRIBE)
        suppressed, _ = self.svc.is_suppressed(email="bob@acme.com")
        assert suppressed
