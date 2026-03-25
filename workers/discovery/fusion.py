"""SIE-203: Account-level signal fusion — combines recent signals into a coherent
fused state with trigger weights, negatives, freshness, and evidence references."""

from dataclasses import dataclass, field
from datetime import datetime, timezone

from workers.discovery.decay import decayed_weight, compute_why_now_score, SignalInput
from workers.discovery.taxonomy import get_spec, get_category, TriggerCategory


@dataclass
class FusedSignalInput:
    signal_id: str
    signal_type: str
    observed_at: datetime
    confidence: float
    evidence_text: str | None = None


@dataclass
class FusedAccountState:
    account_id: str
    top_triggers: list[dict]
    negatives: list[dict]
    evidence_ids: list[str]
    why_now_score: float
    trigger_freshness: float
    signal_count: int
    positive_weight: float
    negative_weight: float
    fused_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


def fuse_account_signals(
    account_id: str,
    signals: list[FusedSignalInput],
    now: datetime | None = None,
) -> FusedAccountState:
    if now is None:
        now = datetime.now(timezone.utc)

    top_triggers: list[dict] = []
    negatives: list[dict] = []
    evidence_ids: list[str] = []
    positive_weight = 0.0
    negative_weight = 0.0

    scored: list[tuple[float, FusedSignalInput]] = []
    for sig in signals:
        w = decayed_weight(sig.signal_type, sig.observed_at, now) * sig.confidence
        scored.append((w, sig))

    scored.sort(key=lambda x: abs(x[0]), reverse=True)

    for weight, sig in scored:
        spec = get_spec(sig.signal_type)
        cat = get_category(sig.signal_type)
        entry = {
            "signal_type": sig.signal_type,
            "weight": round(weight, 4),
            "confidence": sig.confidence,
            "observed_at": sig.observed_at.isoformat(),
            "signal_id": sig.signal_id,
        }

        if cat == TriggerCategory.NEGATIVE:
            negatives.append(entry)
            negative_weight += abs(weight)
        else:
            top_triggers.append(entry)
            positive_weight += weight

        evidence_ids.append(sig.signal_id)

    top_triggers = top_triggers[:10]
    negatives = negatives[:5]

    si_inputs = [
        SignalInput(sig.signal_type, sig.observed_at, sig.confidence)
        for sig in signals
    ]
    why_now = compute_why_now_score(si_inputs, now)

    if signals:
        freshest = max(sig.observed_at for sig in signals)
        if freshest.tzinfo is None:
            freshest = freshest.replace(tzinfo=timezone.utc)
        age_days = (now - freshest).total_seconds() / 86400
        trigger_freshness = max(0.0, 1.0 - age_days / 90)
    else:
        trigger_freshness = 0.0

    return FusedAccountState(
        account_id=account_id,
        top_triggers=top_triggers,
        negatives=negatives,
        evidence_ids=evidence_ids,
        why_now_score=why_now,
        trigger_freshness=round(trigger_freshness, 4),
        signal_count=len(signals),
        positive_weight=round(positive_weight, 4),
        negative_weight=round(negative_weight, 4),
    )
