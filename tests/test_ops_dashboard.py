"""OBS-406: Ops dashboard tests."""

import pytest
from workers.send.ops_dashboard import OpsDashboard


class TestOpsDashboard:
    def setup_method(self):
        self.dash = OpsDashboard()

    def test_record_metrics(self):
        self.dash.record("discovery", discovery_count=100, qualified_count=30)
        m = self.dash.get_lane("discovery")
        assert m.discovery_count == 100
        assert m.qualification_rate == 0.3

    def test_funnel_summary(self):
        self.dash.record("discovery", discovery_count=1000, qualified_count=200,
                         contact_count=50, reply_count=10, paid_count=2)
        summary = self.dash.funnel_summary()
        assert summary["discovery"] == 1000
        assert summary["paid"] == 2

    def test_multiple_lanes(self):
        self.dash.record("lane_a", contact_count=100, bounce_count=5)
        self.dash.record("lane_b", contact_count=200, bounce_count=2)
        assert len(self.dash.all_lanes()) == 2
        summary = self.dash.funnel_summary()
        assert summary["contacted"] == 300

    def test_rates(self):
        self.dash.record("test", contact_count=100, reply_count=20,
                         bounce_count=3, paid_count=5)
        m = self.dash.get_lane("test")
        assert m.reply_rate == 0.2
        assert m.bounce_rate == 0.03
        assert m.conversion_rate == 0.05
