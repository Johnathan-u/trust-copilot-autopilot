"""SIE-704: Throughput controls tests."""

import pytest
from workers.discovery.throughput_controls import ThroughputGovernor


class TestThroughputGovernor:
    def setup_method(self):
        self.gov = ThroughputGovernor()

    def test_source_budget(self):
        self.gov.set_source_budget("s-1", 5)
        for _ in range(5):
            assert self.gov.consume_source_budget("s-1")
        assert not self.gov.consume_source_budget("s-1")

    def test_domain_concurrency(self):
        assert self.gov.acquire_domain("acme.com")
        assert self.gov.acquire_domain("acme.com")
        assert self.gov.acquire_domain("acme.com")
        assert not self.gov.acquire_domain("acme.com")  # max 3

    def test_release_domain(self):
        self.gov.acquire_domain("acme.com")
        self.gov.release_domain("acme.com")
        # Can acquire again
        assert self.gov.acquire_domain("acme.com")

    def test_queue_backpressure(self):
        self.gov.update_queue("q1", depth=100001)
        assert not self.gov.can_enqueue("q1")

    def test_queue_alarm(self):
        self.gov.update_queue("q1", depth=85000)
        assert len(self.gov.alarming_queues()) == 1

    def test_reprocess_limit(self):
        for _ in range(3):
            assert self.gov.can_reprocess("acc-1")
            self.gov.record_reprocess("acc-1")
        assert not self.gov.can_reprocess("acc-1")

    def test_metrics_tracking(self):
        self.gov.record_processed(latency_ms=50)
        self.gov.record_processed(latency_ms=100)
        m = self.gov.metrics()
        assert m.total_processed == 2
        assert m.avg_latency_ms == 75.0

    def test_no_budget_unlimited(self):
        assert self.gov.consume_source_budget("unknown_source")
