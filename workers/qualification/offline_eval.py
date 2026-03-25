"""SIE-604: Offline evaluation suite — evaluates rule-based and learned ranking
on holdout data with precision, lift, and safety metrics."""

from dataclasses import dataclass, field
from typing import Callable

from workers.qualification.ranking_model import FeatureVector, DeterministicRanker
from workers.qualification.decision_labeling import DecisionLabel


@dataclass
class EvalRecord:
    account_id: str
    features: FeatureVector
    label: DecisionLabel
    predicted_score: float = 0.0


@dataclass
class EvalReport:
    model_version: str
    total_samples: int = 0
    precision_at_10: float = 0.0
    precision_at_50: float = 0.0
    reply_lift: float = 0.0
    upload_lift: float = 0.0
    unsafe_rate: float = 0.0
    metrics: dict[str, float] = field(default_factory=dict)
    passed_thresholds: bool = True
    threshold_failures: list[str] = field(default_factory=list)


DEFAULT_THRESHOLDS = {
    "min_precision_at_10": 0.60,
    "max_unsafe_rate": 0.02,
}


def precision_at_k(records: list[EvalRecord], k: int) -> float:
    sorted_recs = sorted(records, key=lambda r: -r.predicted_score)
    top_k = sorted_recs[:k]
    if not top_k:
        return 0.0
    good = sum(1 for r in top_k if r.label in (DecisionLabel.GOOD, DecisionLabel.NEUTRAL))
    return good / len(top_k)


def unsafe_rate(records: list[EvalRecord]) -> float:
    if not records:
        return 0.0
    unsafe = sum(1 for r in records if r.label == DecisionLabel.UNSAFE)
    return unsafe / len(records)


def run_evaluation(
    records: list[EvalRecord],
    scorer: Callable[[FeatureVector], float],
    model_version: str = "deterministic",
    thresholds: dict | None = None,
) -> EvalReport:
    thresholds = {**DEFAULT_THRESHOLDS, **(thresholds or {})}

    for r in records:
        r.predicted_score = scorer(r.features)

    p10 = precision_at_k(records, 10)
    p50 = precision_at_k(records, 50)
    ur = unsafe_rate(records)

    total_good = sum(1 for r in records if r.label == DecisionLabel.GOOD)
    baseline_rate = total_good / max(len(records), 1)

    sorted_recs = sorted(records, key=lambda r: -r.predicted_score)
    top_half = sorted_recs[:max(len(sorted_recs) // 2, 1)]
    top_good = sum(1 for r in top_half if r.label == DecisionLabel.GOOD)
    top_rate = top_good / max(len(top_half), 1)
    reply_lift = top_rate / max(baseline_rate, 0.01)

    report = EvalReport(
        model_version=model_version,
        total_samples=len(records),
        precision_at_10=round(p10, 4),
        precision_at_50=round(p50, 4),
        reply_lift=round(reply_lift, 2),
        unsafe_rate=round(ur, 4),
        metrics={"precision@10": p10, "precision@50": p50, "unsafe_rate": ur, "reply_lift": reply_lift},
    )

    failures = []
    if p10 < thresholds["min_precision_at_10"]:
        failures.append(f"precision@10={p10:.2f} < {thresholds['min_precision_at_10']}")
    if ur > thresholds["max_unsafe_rate"]:
        failures.append(f"unsafe_rate={ur:.2f} > {thresholds['max_unsafe_rate']}")

    report.passed_thresholds = len(failures) == 0
    report.threshold_failures = failures

    return report
