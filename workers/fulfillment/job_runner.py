"""FUL-302: Fulfillment bridge and job runner — creates fulfillment jobs
when uploads arrive, tracks processing state with retry safety."""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class FulfillmentJob:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str = ""
    account_id: str = ""
    status: str = "pending"     # "pending" | "running" | "completed" | "completed_with_gaps" | "failed" | "awaiting_more_evidence"
    idempotency_key: str = ""
    input_files: list[str] = field(default_factory=list)
    output_artifact_id: str = ""
    error: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    retries: int = 0
    max_retries: int = 3
    run_metadata: dict = field(default_factory=dict)


class FulfillmentRunner:
    def __init__(self, process_fn=None) -> None:
        self._jobs: dict[str, FulfillmentJob] = {}
        self._seen_keys: set[str] = set()
        self._process_fn = process_fn

    def create_job(self, room_id: str, account_id: str,
                   input_files: list[str]) -> tuple[FulfillmentJob, bool]:
        idem_key = f"ful:{room_id}:{len(input_files)}"
        if idem_key in self._seen_keys:
            existing = next((j for j in self._jobs.values()
                             if j.idempotency_key == idem_key), None)
            if existing:
                return existing, False

        job = FulfillmentJob(
            room_id=room_id, account_id=account_id,
            idempotency_key=idem_key, input_files=input_files,
        )
        self._jobs[job.id] = job
        self._seen_keys.add(idem_key)
        return job, True

    def run_job(self, job_id: str) -> FulfillmentJob:
        job = self._jobs.get(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")

        if job.status in ("completed", "completed_with_gaps"):
            return job

        job.status = "running"
        job.started_at = datetime.now(timezone.utc)

        try:
            if self._process_fn:
                result = self._process_fn(job)
                job.output_artifact_id = result.get("artifact_id", "")
                job.run_metadata = result.get("metadata", {})

                if result.get("has_gaps"):
                    job.status = "completed_with_gaps"
                elif result.get("needs_more"):
                    job.status = "awaiting_more_evidence"
                else:
                    job.status = "completed"
            else:
                job.output_artifact_id = f"artifact_{job.id[:8]}"
                job.status = "completed"

            job.completed_at = datetime.now(timezone.utc)

        except Exception as e:
            job.retries += 1
            if job.retries >= job.max_retries:
                job.status = "failed"
                job.error = str(e)
            else:
                job.status = "pending"
                job.error = f"Retry {job.retries}: {e}"

        return job

    def get_job(self, job_id: str) -> Optional[FulfillmentJob]:
        return self._jobs.get(job_id)

    def jobs_for_room(self, room_id: str) -> list[FulfillmentJob]:
        return [j for j in self._jobs.values() if j.room_id == room_id]
