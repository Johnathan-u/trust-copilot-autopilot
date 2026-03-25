"""SIE-701: Source health tests."""

import pytest
from workers.discovery.source_health import SourceHealthService


class TestSourceHealth:
    def setup_method(self):
        self.svc = SourceHealthService()

    def test_healthy_source(self):
        m = self.svc.record_fetch("s-1", success=True, fresh=5)
        assert m.status == "healthy"
        assert m.fetch_success_rate == 1.0

    def test_failing_source(self):
        for _ in range(10):
            self.svc.record_fetch("s-1", success=False, parsed=False, fresh=0)
        m = self.svc.get_health("s-1")
        assert m.status == "failing"

    def test_noisy_source(self):
        for _ in range(15):
            self.svc.record_fetch("s-1", success=True, duplicates=9, fresh=1)
        m = self.svc.get_health("s-1")
        assert m.status == "noisy"

    def test_stale_source(self):
        for _ in range(15):
            self.svc.record_fetch("s-1", success=True, fresh=0)
        m = self.svc.get_health("s-1")
        assert m.status == "stale"

    def test_unhealthy_list(self):
        for _ in range(12):
            self.svc.record_fetch("bad", success=False, parsed=False)
        self.svc.record_fetch("good", success=True, fresh=5)
        assert len(self.svc.unhealthy_sources()) == 1

    def test_last_good_crawl(self):
        self.svc.record_fetch("s-1", success=True)
        m = self.svc.get_health("s-1")
        assert m.last_good_crawl is not None
