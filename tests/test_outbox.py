"""OPS-004: Outbox publisher tests."""

import uuid

import pytest
from unittest.mock import AsyncMock, MagicMock

from db.models.ops import OutboxEvent
from services.outbox import OutboxPublisher


class FakeDB:
    def __init__(self):
        self._added = []
        self._flushed = False

    def add(self, obj):
        self._added.append(obj)

    async def flush(self):
        self._flushed = True


class TestOutboxPublisher:
    @pytest.mark.asyncio
    async def test_publish_creates_event(self):
        db = FakeDB()
        pub = OutboxPublisher(db)
        event = await pub.publish(
            event_type="signal.discovered",
            payload={"raw_signal_id": str(uuid.uuid4()), "domain": "test.com"},
            idempotency_key="idem-001",
        )
        assert event.event_type == "signal.discovered"
        assert event.idempotency_key == "idem-001"
        assert event.status in ("pending", None)  # default set by DB, not in-memory
        assert db._flushed

    @pytest.mark.asyncio
    async def test_publish_generates_key_if_missing(self):
        db = FakeDB()
        pub = OutboxPublisher(db)
        event = await pub.publish(
            event_type="account.fused",
            payload={"account_id": str(uuid.uuid4())},
        )
        assert event.idempotency_key is not None
        assert len(event.idempotency_key) > 0

    @pytest.mark.asyncio
    async def test_publish_adds_to_session(self):
        db = FakeDB()
        pub = OutboxPublisher(db)
        await pub.publish("test.event", {"key": "value"})
        assert len(db._added) == 1
        assert isinstance(db._added[0], OutboxEvent)
