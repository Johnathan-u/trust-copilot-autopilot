"""SIE-703: Event store tests."""

import pytest
from workers.discovery.event_store import EventStoreSink


class TestEventStore:
    def test_disabled_by_default(self):
        sink = EventStoreSink()
        assert not sink.enabled
        assert sink.emit("crawl.completed") is None

    def test_enabled_emits(self):
        sink = EventStoreSink(enabled=True)
        e = sink.emit("crawl.completed", source_id="s-1", payload={"url": "test.com"})
        assert e is not None
        assert e.event_type == "crawl.completed"

    def test_query_by_type(self):
        sink = EventStoreSink(enabled=True)
        sink.emit("crawl.completed")
        sink.emit("signal.extracted")
        sink.emit("crawl.completed")
        assert len(sink.query(event_type="crawl.completed")) == 2

    def test_query_by_source(self):
        sink = EventStoreSink(enabled=True)
        sink.emit("crawl.completed", source_id="s-1")
        sink.emit("crawl.completed", source_id="s-2")
        assert len(sink.query(source_id="s-1")) == 1

    def test_count(self):
        sink = EventStoreSink(enabled=True)
        for _ in range(5):
            sink.emit("test")
        assert sink.count() == 5
        assert sink.count("test") == 5

    def test_canonical_stays_in_postgres(self):
        # This test documents that event store is append-only telemetry
        sink = EventStoreSink(enabled=True)
        sink.emit("decision.made", account_id="acc-1")
        # Canonical decisions are NOT in this store — only telemetry
        assert sink.count() == 1
