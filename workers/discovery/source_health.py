"""SIE-701: Source health dashboard — per-source health metrics for operators
at high discovery scale."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class SourceHealthMetrics:
    source_id: str
    source_url: str = ""
    total_fetches: int = 0
    successful_fetches: int = 0
    parse_successes: int = 0
    duplicates_found: int = 0
    fresh_signals: int = 0
    last_good_crawl: Optional[datetime] = None
    status: str = "healthy"     # "healthy" | "stale" | "noisy" | "blocked" | "failing"

    @property
    def fetch_success_rate(self) -> float:
        return self.successful_fetches / max(self.total_fetches, 1)

    @property
    def parse_success_rate(self) -> float:
        return self.parse_successes / max(self.successful_fetches, 1)

    @property
    def duplicate_rate(self) -> float:
        total_signals = self.fresh_signals + self.duplicates_found
        return self.duplicates_found / max(total_signals, 1)

    @property
    def signal_yield(self) -> float:
        return self.fresh_signals / max(self.total_fetches, 1)


class SourceHealthService:
    def __init__(self) -> None:
        self._sources: dict[str, SourceHealthMetrics] = {}

    def record_fetch(self, source_id: str, source_url: str = "",
                     success: bool = True, parsed: bool = True,
                     duplicates: int = 0, fresh: int = 0) -> SourceHealthMetrics:
        if source_id not in self._sources:
            self._sources[source_id] = SourceHealthMetrics(
                source_id=source_id, source_url=source_url,
            )
        m = self._sources[source_id]
        m.total_fetches += 1
        if success:
            m.successful_fetches += 1
            m.last_good_crawl = datetime.now(timezone.utc)
        if parsed:
            m.parse_successes += 1
        m.duplicates_found += duplicates
        m.fresh_signals += fresh

        m.status = self._compute_status(m)
        return m

    def _compute_status(self, m: SourceHealthMetrics) -> str:
        if m.fetch_success_rate < 0.5:
            return "failing"
        if m.duplicate_rate > 0.8:
            return "noisy"
        if m.signal_yield < 0.05 and m.total_fetches > 10:
            return "stale"
        return "healthy"

    def get_health(self, source_id: str) -> Optional[SourceHealthMetrics]:
        return self._sources.get(source_id)

    def all_sources(self) -> list[SourceHealthMetrics]:
        return list(self._sources.values())

    def unhealthy_sources(self) -> list[SourceHealthMetrics]:
        return [s for s in self._sources.values() if s.status != "healthy"]
