"""DATA-003: State machine — transition guards, audit trail integration."""

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from db.models.accounts import Account
from db.models.enums import AccountState, VALID_TRANSITIONS
from db.models.ops import AuditEvent


class InvalidTransition(Exception):
    def __init__(self, current: AccountState, target: AccountState, account_id: str):
        self.current = current
        self.target = target
        self.account_id = account_id
        super().__init__(
            f"Invalid transition {current.value} -> {target.value} for account {account_id}"
        )


class StateMachine:
    def __init__(self, db: AsyncSession):
        self.db = db

    def can_transition(self, current: AccountState, target: AccountState) -> bool:
        allowed = VALID_TRANSITIONS.get(current, [])
        return target in allowed

    async def transition(
        self,
        account: Account,
        target: AccountState,
        *,
        actor: str = "system",
        detail: dict | None = None,
        idempotency_key: str | None = None,
    ) -> Account:
        current = AccountState(account.state)

        if not self.can_transition(current, target):
            raise InvalidTransition(current, target, str(account.id))

        old_state = account.state
        account.state = target.value
        account.state_changed_at = datetime.now(timezone.utc)
        account.version += 1

        audit = AuditEvent(
            account_id=account.id,
            actor=actor,
            action="state_transition",
            entity_type="account",
            entity_id=str(account.id),
            old_state=old_state,
            new_state=target.value,
            detail=detail or {},
            idempotency_key=idempotency_key,
        )
        self.db.add(audit)
        await self.db.flush()

        return account

    async def transition_by_id(
        self,
        account_id: str,
        target: AccountState,
        *,
        actor: str = "system",
        detail: dict | None = None,
        idempotency_key: str | None = None,
    ) -> Account:
        account = await self.db.get(Account, account_id)
        if account is None:
            raise ValueError(f"Account {account_id} not found")
        return await self.transition(
            account, target, actor=actor, detail=detail, idempotency_key=idempotency_key
        )
