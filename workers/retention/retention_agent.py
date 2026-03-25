"""RET-307: Retention agent — event-driven nudges for missing evidence,
expiring docs, and new questionnaire uploads."""

import enum
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Optional


class NudgeType(str, enum.Enum):
    MISSING_EVIDENCE = "missing_evidence"
    EXPIRING_DOCUMENT = "expiring_document"
    NEW_QUESTIONNAIRE = "new_questionnaire"
    REUSABLE_ANSWERS = "reusable_answers"
    PROOF_GAPS = "proof_gaps"
    USAGE_REMINDER = "usage_reminder"


@dataclass
class NudgeEvent:
    workspace_id: str
    nudge_type: NudgeType
    message: str
    channel: str = "email"      # "email" | "in_app"
    scheduled_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    suppressed: bool = False
    suppress_reason: str = ""


@dataclass
class RetentionState:
    workspace_id: str
    last_nudge_at: Optional[datetime] = None
    nudge_count: int = 0
    suppressed_until: Optional[datetime] = None
    max_nudges_per_month: int = 4
    active: bool = True

    @property
    def can_nudge(self) -> bool:
        if not self.active:
            return False
        if self.suppressed_until and datetime.now(timezone.utc) < self.suppressed_until:
            return False
        if self.last_nudge_at:
            cooldown = timedelta(days=7)
            if datetime.now(timezone.utc) - self.last_nudge_at < cooldown:
                return False
        return True


NUDGE_TEMPLATES: dict[NudgeType, str] = {
    NudgeType.MISSING_EVIDENCE: "You have {count} items still missing evidence. Upload now to complete your proof pack.",
    NudgeType.EXPIRING_DOCUMENT: "{count} document(s) expire within 30 days. Update them to stay audit-ready.",
    NudgeType.NEW_QUESTIONNAIRE: "Got a new security questionnaire? Upload it and get answers in minutes.",
    NudgeType.REUSABLE_ANSWERS: "You have {count} reusable answers from past questionnaires. New uploads will auto-fill faster.",
    NudgeType.PROOF_GAPS: "Your proof pack has {count} gaps. Upload additional evidence to reach 100%.",
    NudgeType.USAGE_REMINDER: "You haven't uploaded a questionnaire in {days} days. Need help getting started?",
}


class RetentionAgent:
    def __init__(self) -> None:
        self._states: dict[str, RetentionState] = {}
        self._nudges: list[NudgeEvent] = []

    def get_or_create_state(self, workspace_id: str) -> RetentionState:
        if workspace_id not in self._states:
            self._states[workspace_id] = RetentionState(workspace_id=workspace_id)
        return self._states[workspace_id]

    def schedule_nudge(self, workspace_id: str, nudge_type: NudgeType,
                       context: dict = None) -> NudgeEvent:
        state = self.get_or_create_state(workspace_id)
        ctx = context or {}

        message = NUDGE_TEMPLATES.get(nudge_type, "").format(
            count=ctx.get("count", 0),
            days=ctx.get("days", 0),
        )

        nudge = NudgeEvent(
            workspace_id=workspace_id,
            nudge_type=nudge_type,
            message=message,
        )

        if not state.can_nudge:
            nudge.suppressed = True
            nudge.suppress_reason = "cooldown_or_suppressed"

        if not nudge.suppressed:
            state.last_nudge_at = datetime.now(timezone.utc)
            state.nudge_count += 1

        self._nudges.append(nudge)
        return nudge

    def suppress(self, workspace_id: str, days: int = 30) -> None:
        state = self.get_or_create_state(workspace_id)
        state.suppressed_until = datetime.now(timezone.utc) + timedelta(days=days)

    def deactivate(self, workspace_id: str) -> None:
        state = self.get_or_create_state(workspace_id)
        state.active = False

    def sent_nudges(self, workspace_id: str = "") -> list[NudgeEvent]:
        if workspace_id:
            return [n for n in self._nudges if n.workspace_id == workspace_id and not n.suppressed]
        return [n for n in self._nudges if not n.suppressed]
