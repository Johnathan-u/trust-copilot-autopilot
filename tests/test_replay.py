"""OPS-407: Replay tools tests."""

import pytest
from workers.send.replay_tools import ReplayService, ReplayRequest


class TestReplayService:
    def setup_method(self):
        self.svc = ReplayService()

    def test_pause_queue(self):
        self.svc.pause_queue("queue:send")
        assert self.svc.is_paused("queue:send")

    def test_resume_queue(self):
        self.svc.pause_queue("queue:send")
        self.svc.resume_queue("queue:send")
        assert not self.svc.is_paused("queue:send")

    def test_dry_run_replay(self):
        def finder(jtype, start, end, scope):
            return ["job-1", "job-2"]

        req = ReplayRequest(job_type="fulfillment", date_start="2026-03-01",
                            date_end="2026-03-25", dry_run=True)
        result = self.svc.replay(req, job_finder=finder)
        assert result.replayed == 2
        assert result.dry_run
        assert "[DRY RUN]" in result.details[0]

    def test_live_replay(self):
        executed = []
        def finder(jtype, start, end, scope):
            return ["job-1"]
        def executor(job):
            executed.append(job)

        req = ReplayRequest(job_type="send", date_start="2026-03-01",
                            date_end="2026-03-25", dry_run=False)
        result = self.svc.replay(req, job_finder=finder, job_executor=executor)
        assert result.replayed == 1
        assert not result.dry_run
        assert len(executed) == 1

    def test_replay_error_handling(self):
        def finder(jtype, start, end, scope):
            return ["job-1"]
        def executor(job):
            raise RuntimeError("fail")

        req = ReplayRequest(job_type="crawl", date_start="2026-03-01",
                            date_end="2026-03-25", dry_run=False)
        result = self.svc.replay(req, job_finder=finder, job_executor=executor)
        assert result.errors == 1

    def test_replay_history(self):
        req = ReplayRequest(job_type="test", date_start="", date_end="")
        self.svc.replay(req)
        assert len(self.svc.replay_history()) == 1

    def test_no_duplicate_side_effects(self):
        self.svc.pause_queue("queue:send")
        assert self.svc.is_paused("queue:send")
        # Pausing again is idempotent
        self.svc.pause_queue("queue:send")
        assert len(self.svc.paused_queues()) == 1
