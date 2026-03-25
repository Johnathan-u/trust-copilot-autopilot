"""RET-307: Retention agent tests."""

import pytest
from datetime import timedelta, datetime, timezone
from workers.retention.retention_agent import RetentionAgent, NudgeType


class TestRetentionAgent:
    def setup_method(self):
        self.agent = RetentionAgent()

    def test_schedule_nudge(self):
        nudge = self.agent.schedule_nudge("ws-1", NudgeType.MISSING_EVIDENCE, {"count": 3})
        assert not nudge.suppressed
        assert "3" in nudge.message

    def test_cooldown_suppresses(self):
        self.agent.schedule_nudge("ws-1", NudgeType.MISSING_EVIDENCE, {"count": 3})
        nudge2 = self.agent.schedule_nudge("ws-1", NudgeType.EXPIRING_DOCUMENT, {"count": 1})
        assert nudge2.suppressed

    def test_suppress_workspace(self):
        self.agent.suppress("ws-1", days=30)
        nudge = self.agent.schedule_nudge("ws-1", NudgeType.NEW_QUESTIONNAIRE)
        assert nudge.suppressed

    def test_deactivate_workspace(self):
        self.agent.deactivate("ws-1")
        nudge = self.agent.schedule_nudge("ws-1", NudgeType.USAGE_REMINDER, {"days": 30})
        assert nudge.suppressed

    def test_sent_nudges_excludes_suppressed(self):
        self.agent.schedule_nudge("ws-1", NudgeType.MISSING_EVIDENCE, {"count": 2})
        self.agent.suppress("ws-1")
        self.agent.schedule_nudge("ws-1", NudgeType.EXPIRING_DOCUMENT, {"count": 1})
        sent = self.agent.sent_nudges("ws-1")
        assert len(sent) == 1

    def test_different_workspaces_independent(self):
        self.agent.schedule_nudge("ws-1", NudgeType.MISSING_EVIDENCE, {"count": 1})
        nudge = self.agent.schedule_nudge("ws-2", NudgeType.MISSING_EVIDENCE, {"count": 1})
        assert not nudge.suppressed

    def test_nudge_types_covered(self):
        types = [NudgeType.MISSING_EVIDENCE, NudgeType.EXPIRING_DOCUMENT,
                 NudgeType.NEW_QUESTIONNAIRE, NudgeType.PROOF_GAPS]
        for i, nt in enumerate(types):
            ws = f"ws-{i}"
            nudge = self.agent.schedule_nudge(ws, nt, {"count": 1, "days": 7})
            assert not nudge.suppressed
