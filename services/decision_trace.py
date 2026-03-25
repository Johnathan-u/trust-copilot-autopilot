"""SIE-004: Decision trace capture and offline replay."""

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.intelligence import ContactDecision, DecisionTrace


class DecisionTraceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def record_trace(
        self,
        decision: ContactDecision,
        input_snapshot: dict[str, Any],
        rule_hits: dict[str, Any] | None = None,
        model_scores: dict[str, Any] | None = None,
    ) -> DecisionTrace:
        trace = DecisionTrace(
            decision_id=decision.id,
            account_id=decision.account_id,
            input_snapshot=input_snapshot,
            rule_hits=rule_hits,
            model_scores=model_scores,
            final_reason_codes=decision.reason_codes,
            output_verdict=decision.status,
        )
        self.db.add(trace)
        await self.db.flush()
        return trace

    async def replay_decision(
        self,
        trace_id: str,
        new_rules_fn: Any | None = None,
    ) -> dict[str, Any]:
        """Replay a past decision with optional new rules. Returns the diff."""
        trace = await self.db.get(DecisionTrace, trace_id)
        if trace is None:
            raise ValueError(f"Trace {trace_id} not found")

        original_verdict = trace.output_verdict
        original_reasons = trace.final_reason_codes or {}

        if new_rules_fn is not None:
            replayed = new_rules_fn(trace.input_snapshot)
            new_verdict = replayed.get("verdict", original_verdict)
            new_reasons = replayed.get("reason_codes", original_reasons)
        else:
            new_verdict = original_verdict
            new_reasons = original_reasons

        diff = {
            "trace_id": str(trace.id),
            "verdict_changed": new_verdict != original_verdict,
            "original_verdict": original_verdict,
            "replayed_verdict": new_verdict,
            "reason_diff": {
                "added": {k: v for k, v in new_reasons.items() if k not in original_reasons},
                "removed": {k: v for k, v in original_reasons.items() if k not in new_reasons},
            },
        }

        trace.replay_diff = diff
        await self.db.flush()

        return diff

    async def get_traces_for_account(self, account_id: str) -> list[DecisionTrace]:
        stmt = (
            select(DecisionTrace)
            .where(DecisionTrace.account_id == account_id)
            .order_by(DecisionTrace.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
