"""Shared fixtures for the test suite. Uses in-memory fakes where possible."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy import StaticPool, create_engine, event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session

from db.models.base import Base
from db.models.accounts import Account
from db.models.enums import AccountState


@pytest.fixture
def fake_redis():
    """Simple dict-backed Redis fake for unit tests."""

    class FakeRedis:
        def __init__(self):
            self._data: dict[str, list[str]] = {}

        async def lpush(self, key: str, value: str) -> int:
            self._data.setdefault(key, []).insert(0, value)
            return len(self._data[key])

        async def rpop(self, key: str) -> str | None:
            lst = self._data.get(key, [])
            return lst.pop() if lst else None

        async def ping(self) -> bool:
            return True

    return FakeRedis()


@pytest.fixture
def sample_account() -> Account:
    return Account(
        id=uuid.uuid4(),
        domain="example.com",
        company_name="Example Inc",
        state=AccountState.RAW_SIGNAL.value,
        state_changed_at=datetime.now(timezone.utc),
        version=1,
    )
