"""FUL-302: Fulfillment job runner tests."""

import pytest
from workers.fulfillment.job_runner import FulfillmentRunner


class TestFulfillmentRunner:
    def setup_method(self):
        self.runner = FulfillmentRunner()

    def test_create_job(self):
        job, created = self.runner.create_job("room-1", "acc-1", ["file1.pdf"])
        assert created
        assert job.status == "pending"

    def test_idempotent_create(self):
        j1, c1 = self.runner.create_job("room-1", "acc-1", ["f.pdf"])
        j2, c2 = self.runner.create_job("room-1", "acc-1", ["f.pdf"])
        assert c1 and not c2
        assert j1.id == j2.id

    def test_run_completes(self):
        job, _ = self.runner.create_job("room-1", "acc-1", ["f.pdf"])
        result = self.runner.run_job(job.id)
        assert result.status == "completed"
        assert result.output_artifact_id != ""

    def test_run_with_gaps(self):
        def process(job):
            return {"artifact_id": "art-1", "has_gaps": True, "metadata": {}}
        runner = FulfillmentRunner(process_fn=process)
        job, _ = runner.create_job("room-1", "acc-1", ["f.pdf"])
        result = runner.run_job(job.id)
        assert result.status == "completed_with_gaps"

    def test_run_needs_more(self):
        def process(job):
            return {"artifact_id": "art-1", "needs_more": True, "metadata": {}}
        runner = FulfillmentRunner(process_fn=process)
        job, _ = runner.create_job("room-1", "acc-1", ["f.pdf"])
        result = runner.run_job(job.id)
        assert result.status == "awaiting_more_evidence"

    def test_retry_on_failure(self):
        call_count = 0
        def process(job):
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise RuntimeError("temporary")
            return {"artifact_id": "art-1", "metadata": {}}
        runner = FulfillmentRunner(process_fn=process)
        job, _ = runner.create_job("room-1", "acc-1", ["f.pdf"])
        runner.run_job(job.id)  # retry 1
        runner.run_job(job.id)  # retry 2
        result = runner.run_job(job.id)  # success
        assert result.status == "completed"

    def test_max_retries_fails(self):
        def process(job):
            raise RuntimeError("permanent")
        runner = FulfillmentRunner(process_fn=process)
        job, _ = runner.create_job("room-1", "acc-1", ["f.pdf"])
        for _ in range(4):
            runner.run_job(job.id)
        assert runner.get_job(job.id).status == "failed"
