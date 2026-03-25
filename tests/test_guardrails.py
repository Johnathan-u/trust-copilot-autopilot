"""EVAL-405: Message guardrails tests."""

import pytest
from workers.send.message_guardrails import (
    run_guardrails, check_grounding, check_staleness,
    check_domain_duplicate, check_thread_contradiction,
)


class TestGrounding:
    def test_supported_claim_passes(self):
        fails = check_grounding(
            "Based on your recently launched trust center",
            ["recently launched trust center"],
        )
        assert len(fails) == 0

    def test_unsupported_claim_fails(self):
        fails = check_grounding(
            "You recently raised a Series B round",
            ["soc2_announced"],
        )
        assert len(fails) >= 1


class TestStaleness:
    def test_fresh_passes(self):
        assert check_staleness(30) == []

    def test_stale_fails(self):
        assert len(check_staleness(120)) >= 1


class TestDomainDuplicate:
    def test_new_domain_passes(self):
        assert check_domain_duplicate("acme.com", ["other.com"]) == []

    def test_duplicate_domain_fails(self):
        assert len(check_domain_duplicate("acme.com", ["acme.com"])) >= 1


class TestFullGuardrails:
    def test_all_pass(self):
        r = run_guardrails(
            "Hello, based on your SOC 2 certification...",
            ["soc2_announced"], trigger_age_days=10,
        )
        assert r.passed

    def test_stale_blocks(self):
        r = run_guardrails("Hello", ["soc2_announced"], trigger_age_days=120)
        assert not r.passed

    def test_duplicate_blocks(self):
        r = run_guardrails(
            "Hello", ["soc2_announced"], trigger_age_days=10,
            recipient_domain="acme.com", recent_domains=["acme.com"],
        )
        assert not r.passed

    def test_unsupported_blocks(self):
        r = run_guardrails(
            "You recently raised funding and just announced SOC 2",
            ["soc2_announced"], trigger_age_days=10,
        )
        assert not r.passed
