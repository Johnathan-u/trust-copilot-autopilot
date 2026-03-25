"""OPS-407: Incident runbooks and replay tools — admin tools for pausing,
inspecting, and replaying bounded ranges of events safely."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class ReplayRequest:
    job_type: str           # "fulfillment" | "send" | "crawl" | "outbox"
    date_start: str
    date_end: str
    scope: str = ""         # optional filter: source_id, mailbox_id, etc.
    dry_run: bool = True
    requested_by: str = ""


@dataclass
class ReplayResult:
    total_found: int = 0
    replayed: int = 0
    skipped_duplicate: int = 0
    errors: int = 0
    dry_run: bool = True
    details: list[str] = field(default_factory=list)


class ReplayService:
    def __init__(self) -> None:
        self._replays: list[tuple[ReplayRequest, ReplayResult]] = []
        self._paused_queues: set[str] = set()

    def pause_queue(self, queue_name: str) -> bool:
        self._paused_queues.add(queue_name)
        return True

    def resume_queue(self, queue_name: str) -> bool:
        self._paused_queues.discard(queue_name)
        return True

    def is_paused(self, queue_name: str) -> bool:
        return queue_name in self._paused_queues

    def replay(self, request: ReplayRequest,
               job_finder=None, job_executor=None) -> ReplayResult:
        result = ReplayResult(dry_run=request.dry_run)

        if job_finder:
            jobs = job_finder(request.job_type, request.date_start,
                              request.date_end, request.scope)
        else:
            jobs = []

        result.total_found = len(jobs)

        for job in jobs:
            if request.dry_run:
                result.details.append(f"[DRY RUN] Would replay: {job}")
                result.replayed += 1
            else:
                try:
                    if job_executor:
                        job_executor(job)
                    result.replayed += 1
                    result.details.append(f"Replayed: {job}")
                except Exception as e:
                    result.errors += 1
                    result.details.append(f"Error: {job} — {e}")

        self._replays.append((request, result))
        return result

    def replay_history(self) -> list[tuple[ReplayRequest, ReplayResult]]:
        return list(self._replays)

    def paused_queues(self) -> set[str]:
        return set(self._paused_queues)
