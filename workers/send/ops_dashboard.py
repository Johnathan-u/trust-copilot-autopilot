"""OBS-406: Deliverability, policy, and conversion dashboards — internal
metrics for operator visibility across all lanes."""

from dataclasses import dataclass, field


@dataclass
class LaneMetrics:
    lane: str
    discovery_count: int = 0
    dedupe_rate: float = 0.0
    qualified_count: int = 0
    contact_count: int = 0
    reply_count: int = 0
    intake_count: int = 0
    proof_delivered: int = 0
    paid_count: int = 0
    bounce_count: int = 0
    suppression_count: int = 0

    @property
    def qualification_rate(self) -> float:
        return self.qualified_count / max(self.discovery_count, 1)

    @property
    def contact_rate(self) -> float:
        return self.contact_count / max(self.qualified_count, 1)

    @property
    def reply_rate(self) -> float:
        return self.reply_count / max(self.contact_count, 1)

    @property
    def conversion_rate(self) -> float:
        return self.paid_count / max(self.contact_count, 1)

    @property
    def bounce_rate(self) -> float:
        return self.bounce_count / max(self.contact_count, 1)


class OpsDashboard:
    def __init__(self) -> None:
        self._lanes: dict[str, LaneMetrics] = {}

    def record(self, lane: str, **kwargs) -> LaneMetrics:
        if lane not in self._lanes:
            self._lanes[lane] = LaneMetrics(lane=lane)
        m = self._lanes[lane]
        for key, val in kwargs.items():
            if hasattr(m, key):
                setattr(m, key, getattr(m, key) + val)
        return m

    def get_lane(self, lane: str) -> LaneMetrics:
        return self._lanes.get(lane, LaneMetrics(lane=lane))

    def all_lanes(self) -> list[LaneMetrics]:
        return list(self._lanes.values())

    def funnel_summary(self) -> dict:
        totals = LaneMetrics(lane="total")
        for m in self._lanes.values():
            totals.discovery_count += m.discovery_count
            totals.qualified_count += m.qualified_count
            totals.contact_count += m.contact_count
            totals.reply_count += m.reply_count
            totals.intake_count += m.intake_count
            totals.proof_delivered += m.proof_delivered
            totals.paid_count += m.paid_count
            totals.bounce_count += m.bounce_count
            totals.suppression_count += m.suppression_count
        return {
            "discovery": totals.discovery_count,
            "qualified": totals.qualified_count,
            "contacted": totals.contact_count,
            "replied": totals.reply_count,
            "intake": totals.intake_count,
            "proof_delivered": totals.proof_delivered,
            "paid": totals.paid_count,
            "bounce_rate": totals.bounce_rate,
            "conversion_rate": totals.conversion_rate,
        }
