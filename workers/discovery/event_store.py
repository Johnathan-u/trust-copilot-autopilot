"""SIE-703: Large-scale raw event store — optional analytics sink for
high-volume crawl and outcome events, gated behind config."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class RawEvent:
    event_type: str
    source_id: str = ""
    account_id: str = ""
    payload: dict = field(default_factory=dict)
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class EventStoreSink:
    """In-memory implementation; in production, this sinks to ClickHouse."""

    def __init__(self, enabled: bool = False) -> None:
        self._enabled = enabled
        self._events: list[RawEvent] = []

    @property
    def enabled(self) -> bool:
        return self._enabled

    def enable(self) -> None:
        self._enabled = True

    def disable(self) -> None:
        self._enabled = False

    def emit(self, event_type: str, source_id: str = "",
             account_id: str = "", payload: dict = None) -> Optional[RawEvent]:
        if not self._enabled:
            return None
        event = RawEvent(
            event_type=event_type, source_id=source_id,
            account_id=account_id, payload=payload or {},
        )
        self._events.append(event)
        return event

    def query(self, event_type: str = "", source_id: str = "",
              limit: int = 100) -> list[RawEvent]:
        results = self._events
        if event_type:
            results = [e for e in results if e.event_type == event_type]
        if source_id:
            results = [e for e in results if e.source_id == source_id]
        return results[-limit:]

    def count(self, event_type: str = "") -> int:
        if event_type:
            return sum(1 for e in self._events if e.event_type == event_type)
        return len(self._events)
