"""SIE-702: Account conflict detector — prevents competing outreach
narratives and conflicting messages for the same account."""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ActiveStrategy:
    account_id: str
    strategy_id: str
    target_role: str
    narrative_hash: str
    created_at: str = ""


@dataclass
class ConflictResult:
    has_conflict: bool
    reason_codes: list[str] = field(default_factory=list)
    blocked: bool = False
    explanation: str = ""


class ConflictDetector:
    def __init__(self) -> None:
        self._active: dict[str, ActiveStrategy] = {}
        self._log: list[dict] = []

    def register_strategy(self, account_id: str, strategy_id: str,
                          target_role: str, narrative_hash: str) -> ConflictResult:
        existing = self._active.get(account_id)
        if not existing:
            self._active[account_id] = ActiveStrategy(
                account_id=account_id, strategy_id=strategy_id,
                target_role=target_role, narrative_hash=narrative_hash,
            )
            return ConflictResult(has_conflict=False)

        reasons = []
        if existing.strategy_id != strategy_id:
            reasons.append("duplicate_active_strategy")
        if existing.target_role != target_role:
            reasons.append("conflicting_target_role")
        if existing.narrative_hash != narrative_hash:
            reasons.append("contradictory_narrative")

        if reasons:
            self._log.append({
                "account_id": account_id,
                "existing_strategy": existing.strategy_id,
                "new_strategy": strategy_id,
                "reasons": reasons,
            })
            return ConflictResult(
                has_conflict=True,
                reason_codes=reasons,
                blocked=True,
                explanation=f"Conflict: {', '.join(reasons)} for account {account_id}",
            )

        return ConflictResult(has_conflict=False)

    def clear_strategy(self, account_id: str) -> bool:
        if account_id in self._active:
            del self._active[account_id]
            return True
        return False

    def active_strategies(self) -> dict[str, ActiveStrategy]:
        return dict(self._active)

    def conflict_log(self) -> list[dict]:
        return list(self._log)
