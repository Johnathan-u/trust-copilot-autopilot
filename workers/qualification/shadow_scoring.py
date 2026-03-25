"""SIE-605: Shadow scoring — runs candidate scoring logic alongside live
scoring without affecting outbound behavior."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Callable

from workers.qualification.ranking_model import FeatureVector


@dataclass
class ShadowDiff:
    account_id: str
    live_score: float
    shadow_score: float
    live_source: str
    shadow_source: str
    diff: float
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def significant(self) -> bool:
        return abs(self.diff) > 0.1


class ShadowScorer:
    def __init__(self) -> None:
        self._diffs: list[ShadowDiff] = []
        self._enabled: bool = False

    def enable(self) -> None:
        self._enabled = True

    def disable(self) -> None:
        self._enabled = False

    @property
    def is_enabled(self) -> bool:
        return self._enabled

    def score(
        self,
        fv: FeatureVector,
        live_score: float,
        live_source: str,
        shadow_fn: Callable[[FeatureVector], tuple[float, str]],
    ) -> ShadowDiff | None:
        if not self._enabled:
            return None

        shadow_score, shadow_source = shadow_fn(fv)
        diff = ShadowDiff(
            account_id=fv.account_id,
            live_score=live_score,
            shadow_score=shadow_score,
            live_source=live_source,
            shadow_source=shadow_source,
            diff=round(shadow_score - live_score, 4),
        )
        self._diffs.append(diff)
        return diff

    def diff_report(self) -> dict:
        if not self._diffs:
            return {"total": 0, "significant": 0, "avg_diff": 0.0}

        sig = sum(1 for d in self._diffs if d.significant)
        avg = sum(d.diff for d in self._diffs) / len(self._diffs)

        return {
            "total": len(self._diffs),
            "significant": sig,
            "significant_pct": round(sig / len(self._diffs) * 100, 1),
            "avg_diff": round(avg, 4),
            "max_diff": round(max(d.diff for d in self._diffs), 4),
            "min_diff": round(min(d.diff for d in self._diffs), 4),
        }

    def recent_diffs(self, limit: int = 20) -> list[ShadowDiff]:
        return self._diffs[-limit:]
