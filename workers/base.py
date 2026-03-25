"""SIE-005: Base worker — generic loop with outbox integration and graceful shutdown."""

import asyncio
import logging
import signal
from typing import Any

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_session_factory
from services.outbox import OutboxPublisher

logger = logging.getLogger(__name__)


class BaseWorker:
    """Abstract base for all lane workers. Subclass and implement process_item."""

    name: str = "unnamed"
    queue_key: str = ""
    poll_interval: float = 1.0
    batch_size: int = 1

    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self._running = False
        self._redis: aioredis.Redis | None = None

    async def setup(self) -> None:
        """Hook for subclass initialization."""
        pass

    async def process_item(self, item: str, db: AsyncSession, outbox: OutboxPublisher) -> None:
        """Override in subclass to handle a single queue item."""
        raise NotImplementedError

    async def run(self) -> None:
        self._redis = aioredis.from_url(self.redis_url, decode_responses=True)
        self._running = True
        loop = asyncio.get_event_loop()
        loop.add_signal_handler(signal.SIGTERM, self._stop)
        loop.add_signal_handler(signal.SIGINT, self._stop)

        await self.setup()
        logger.info(f"Worker [{self.name}] started, polling {self.queue_key}")

        factory = get_session_factory()
        while self._running:
            try:
                item = await self._redis.rpop(self.queue_key)
                if item is None:
                    await asyncio.sleep(self.poll_interval)
                    continue

                async with factory() as db:
                    outbox = OutboxPublisher(db)
                    await self.process_item(
                        item if isinstance(item, str) else item.decode(), db, outbox
                    )
                    await db.commit()

            except Exception:
                logger.exception(f"Worker [{self.name}] error processing item")
                await asyncio.sleep(self.poll_interval)

        logger.info(f"Worker [{self.name}] stopped")

    def _stop(self) -> None:
        logger.info(f"Worker [{self.name}] received stop signal")
        self._running = False
