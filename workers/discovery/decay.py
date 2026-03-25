"""SIE-205: Temporal decay utilities and why-now freshness scoring."""

import math
from datetime import datetime, timezone
from dataclasses import dataclass

from workers.discovery.taxonomy import get_spec, TRIGGER_TAXONOMY, TriggerSpec


def exponential_decay(
    age_days: float,
    half_life_days: int,
) -> float:
    if half_life_days <= 0:
        return 0.0
    return math.exp(-0.693 * age_days / half_life_days)


def decayed_weight(
    signal_type: str,
    observed_at: datetime,
    now: datetime | None = None,
) -> float:
    spec = get_spec(signal_type)
    if spec is None:
        return 0.0
    if now is None:
        now = datetime.now(timezone.utc)
    if observed_at.tzinfo is None:
        observed_at = observed_at.replace(tzinfo=timezone.utc)
    age_days = max(0, (now - observed_at).total_seconds() / 86400)
    decay = exponential_decay(age_days, spec.decay_half_life_days)
    return spec.base_weight * decay


@dataclass
class SignalInput:
    signal_type: str
    observed_at: datetime
    confidence: float = 1.0


def compute_why_now_score(
    signals: list[SignalInput],
    now: datetime | None = None,
) -> float:
    """Compute a 0-1 why-now score from a list of recent signals.
    Higher means stronger, fresher triggers are present."""
    if not signals:
        return 0.0
    if now is None:
        now = datetime.now(timezone.utc)

    positive_sum = 0.0
    negative_sum = 0.0
    max_positive = 0.0

    for sig in signals:
        w = decayed_weight(sig.signal_type, sig.observed_at, now) * sig.confidence
        spec = get_spec(sig.signal_type)
        if spec and spec.base_weight < 0:
            negative_sum += abs(w)
        else:
            positive_sum += w
            max_positive = max(max_positive, abs(spec.base_weight) if spec else 0)

    if max_positive == 0:
        return 0.0

    raw = positive_sum - (negative_sum * 0.5)
    # normalize to 0..1 using sigmoid-like curve
    normalized = 1.0 / (1.0 + math.exp(-2.0 * (raw - 0.5)))
    return round(max(0.0, min(1.0, normalized)), 4)
