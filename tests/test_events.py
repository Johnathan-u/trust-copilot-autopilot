"""SIE-005: Event topic and envelope validation tests."""

import uuid
from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from libs.contracts.events import (
    EventEnvelope,
    SignalDiscovered,
    AccountScored,
    ContactDecided,
    MessageSent,
    ReplyReceived,
    TOPIC_REGISTRY,
)


class TestEventEnvelope:
    def test_envelope_defaults(self):
        env = EventEnvelope(
            event_type="signal.discovered",
            source_worker="discovery-01",
            payload={"raw_signal_id": str(uuid.uuid4())},
            idempotency_key="test-key-001",
        )
        assert env.version == 1
        assert env.event_id is not None
        assert env.event_type == "signal.discovered"

    def test_envelope_requires_event_type(self):
        with pytest.raises(ValidationError):
            EventEnvelope(
                source_worker="test",
                payload={},
                idempotency_key="k",
            )


class TestDomainEvents:
    def test_signal_discovered(self):
        e = SignalDiscovered(
            raw_signal_id=uuid.uuid4(),
            source_type="company_site",
            source_url="https://example.com",
            candidate_domain="example.com",
        )
        assert e.event_type == "signal.discovered"

    def test_account_scored(self):
        e = AccountScored(
            account_id=uuid.uuid4(),
            icp_score=0.85,
            pain_score=0.72,
            freshness_score=0.90,
        )
        assert e.event_type == "account.scored"

    def test_contact_decided(self):
        e = ContactDecided(
            account_id=uuid.uuid4(),
            decision_id=uuid.uuid4(),
            verdict="allow",
            priority_tier=1,
        )
        assert e.event_type == "contact.decided"


class TestTopicRegistry:
    def test_all_topics_registered(self):
        expected = {
            "signal.discovered",
            "signal.normalized",
            "account.fused",
            "account.scored",
            "contact.decided",
            "message.sent",
            "reply.received",
            "intake.opened",
            "fulfillment.completed",
            "payment.received",
        }
        assert set(TOPIC_REGISTRY.keys()) == expected

    def test_registry_types_are_basemodel(self):
        from pydantic import BaseModel
        for topic, cls in TOPIC_REGISTRY.items():
            assert issubclass(cls, BaseModel), f"{topic} -> {cls} is not a BaseModel"
