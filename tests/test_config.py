"""CFG-005: Configuration validation tests."""

import os

import pytest

from services.config import Settings


class TestBootValidation:
    def test_valid_minimal_config(self):
        s = Settings(
            database_url="postgresql+asyncpg://u:p@localhost/db",
            redis_url="redis://localhost:6379/0",
        )
        errors = s.validate_boot()
        assert errors == []

    def test_missing_database_url_fails(self):
        s = Settings(
            database_url="",
            redis_url="redis://localhost:6379/0",
        )
        errors = s.validate_boot()
        assert any("DATABASE_URL" in e for e in errors)

    def test_billing_without_stripe_fails(self):
        s = Settings(
            database_url="postgresql+asyncpg://u:p@localhost/db",
            redis_url="redis://localhost:6379/0",
            billing_enabled=True,
            stripe_secret_key=None,
        )
        errors = s.validate_boot()
        assert any("STRIPE_SECRET_KEY" in e for e in errors)
        assert any("STRIPE_WEBHOOK_SECRET" in e for e in errors)

    def test_contact_without_smtp_fails(self):
        s = Settings(
            database_url="postgresql+asyncpg://u:p@localhost/db",
            redis_url="redis://localhost:6379/0",
            contact_enabled=True,
            smtp_host=None,
        )
        errors = s.validate_boot()
        assert any("SMTP_HOST" in e for e in errors)


class TestFeatureFlags:
    def test_default_flags(self):
        s = Settings(
            database_url="postgresql+asyncpg://u:p@localhost/db",
        )
        assert s.discovery_enabled is True
        assert s.contact_enabled is False
        assert s.billing_enabled is False
        assert s.trust_copilot_enabled is False
