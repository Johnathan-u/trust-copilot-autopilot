"""SIE-704: Discovery throughput controls — backpressure, budgets, and
concurrency caps for 1M/day candidate processing."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class SourceBudget:
    source_id: str
    daily_limit: int = 10000
    used_today: int = 0
    reset_at: Optional[datetime] = None

    @property
    def remaining(self) -> int:
        return max(0, self.daily_limit - self.used_today)

    @property
    def exhausted(self) -> bool:
        return self.used_today >= self.daily_limit


@dataclass
class DomainConcurrency:
    domain: str
    max_concurrent: int = 3
    active: int = 0

    @property
    def can_start(self) -> bool:
        return self.active < self.max_concurrent


@dataclass
class QueueHealth:
    queue_name: str
    depth: int = 0
    max_depth: int = 100000
    alarm_threshold: int = 80000
    processing_rate: float = 0.0  # items/sec

    @property
    def alarming(self) -> bool:
        return self.depth >= self.alarm_threshold

    @property
    def blocked(self) -> bool:
        return self.depth >= self.max_depth


@dataclass
class ThroughputMetrics:
    total_processed: int = 0
    total_skipped: int = 0
    total_backpressured: int = 0
    avg_latency_ms: float = 0.0


class ThroughputGovernor:
    def __init__(self) -> None:
        self._source_budgets: dict[str, SourceBudget] = {}
        self._domain_concurrency: dict[str, DomainConcurrency] = {}
        self._queues: dict[str, QueueHealth] = {}
        self._metrics = ThroughputMetrics()
        self._reprocess_counts: dict[str, int] = {}
        self._max_reprocess = 3

    def set_source_budget(self, source_id: str, daily_limit: int) -> None:
        self._source_budgets[source_id] = SourceBudget(
            source_id=source_id, daily_limit=daily_limit,
        )

    def consume_source_budget(self, source_id: str) -> bool:
        budget = self._source_budgets.get(source_id)
        if not budget:
            return True
        if budget.exhausted:
            self._metrics.total_skipped += 1
            return False
        budget.used_today += 1
        return True

    def acquire_domain(self, domain: str) -> bool:
        if domain not in self._domain_concurrency:
            self._domain_concurrency[domain] = DomainConcurrency(domain=domain)
        dc = self._domain_concurrency[domain]
        if not dc.can_start:
            self._metrics.total_backpressured += 1
            return False
        dc.active += 1
        return True

    def release_domain(self, domain: str) -> None:
        dc = self._domain_concurrency.get(domain)
        if dc and dc.active > 0:
            dc.active -= 1

    def update_queue(self, queue_name: str, depth: int,
                     rate: float = 0.0) -> QueueHealth:
        if queue_name not in self._queues:
            self._queues[queue_name] = QueueHealth(queue_name=queue_name)
        q = self._queues[queue_name]
        q.depth = depth
        q.processing_rate = rate
        return q

    def can_enqueue(self, queue_name: str) -> bool:
        q = self._queues.get(queue_name)
        if not q:
            return True
        return not q.blocked

    def can_reprocess(self, account_id: str) -> bool:
        count = self._reprocess_counts.get(account_id, 0)
        return count < self._max_reprocess

    def record_reprocess(self, account_id: str) -> None:
        self._reprocess_counts[account_id] = self._reprocess_counts.get(account_id, 0) + 1

    def record_processed(self, latency_ms: float = 0.0) -> None:
        self._metrics.total_processed += 1
        n = self._metrics.total_processed
        self._metrics.avg_latency_ms = (
            (self._metrics.avg_latency_ms * (n - 1) + latency_ms) / n
        )

    def metrics(self) -> ThroughputMetrics:
        return self._metrics

    def alarming_queues(self) -> list[QueueHealth]:
        return [q for q in self._queues.values() if q.alarming]
