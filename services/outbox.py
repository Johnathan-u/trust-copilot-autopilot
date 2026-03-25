"""OPS-004: Outbox event publisher and poller for reliable side effects."""

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.ops import OutboxEvent


class OutboxPublisher:
    """Write outbox events inside the same transaction as your business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def publish(
        self,
        event_type: str,
        payload: dict[str, Any],
        idempotency_key: str | None = None,
    ) -> OutboxEvent:
        key = idempotency_key or str(uuid.uuid4())
        event = OutboxEvent(
            event_type=event_type,
            payload=payload,
            idempotency_key=key,
        )
        self.db.add(event)
        await self.db.flush()
        return event


class OutboxPoller:
    """Claim and process outbox events in worker loops."""

    def __init__(self, db: AsyncSession, worker_id: str):
        self.db = db
        self.worker_id = worker_id

    async def claim_batch(self, batch_size: int = 10) -> list[OutboxEvent]:
        stmt = (
            select(OutboxEvent)
            .where(OutboxEvent.status == "pending")
            .order_by(OutboxEvent.created_at)
            .limit(batch_size)
            .with_for_update(skip_locked=True)
        )
        result = await self.db.execute(stmt)
        events = list(result.scalars().all())

        now = datetime.now(timezone.utc)
        for event in events:
            event.status = "claimed"
            event.claimed_by = self.worker_id
            event.claimed_at = now
            event.attempts += 1

        await self.db.flush()
        return events

    async def complete(self, event: OutboxEvent) -> None:
        event.status = "completed"
        event.completed_at = datetime.now(timezone.utc)
        await self.db.flush()

    async def fail(self, event: OutboxEvent, error: str) -> None:
        event.last_error = error
        if event.attempts >= event.max_attempts:
            event.status = "dead"
        else:
            event.status = "pending"
            event.claimed_by = None
            event.claimed_at = None
        await self.db.flush()
