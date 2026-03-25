"""MAIL-204: Mailbox orchestrator and send-budget allocator — manages mailbox
pools, timezone windows, per-mailbox caps, and health-based allocation."""

import enum
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


class MailboxStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    WARMING = "warming"
    UNHEALTHY = "unhealthy"


@dataclass
class Mailbox:
    id: str
    email: str
    status: MailboxStatus = MailboxStatus.ACTIVE
    health_score: float = 1.0
    daily_cap: int = 50
    hourly_cap: int = 10
    sent_today: int = 0
    sent_this_hour: int = 0
    spf_ok: bool = True
    dkim_ok: bool = True
    dmarc_ok: bool = True
    tls_ok: bool = True
    timezone_offset: int = 0    # hours from UTC

    @property
    def dns_ready(self) -> bool:
        return self.spf_ok and self.dkim_ok and self.dmarc_ok and self.tls_ok

    @property
    def can_send(self) -> bool:
        return (
            self.status == MailboxStatus.ACTIVE
            and self.health_score >= 0.5
            and self.sent_today < self.daily_cap
            and self.sent_this_hour < self.hourly_cap
            and self.dns_ready
        )


@dataclass
class SendAllocation:
    mailbox_id: str
    mailbox_email: str
    recipient_email: str
    scheduled_at: Optional[datetime] = None
    dry_run: bool = False


@dataclass
class AllocationResult:
    allocated: list[SendAllocation] = field(default_factory=list)
    unallocated: list[str] = field(default_factory=list)  # recipient emails that couldn't be allocated
    reason: str = ""


class MailboxOrchestrator:
    def __init__(self, mailboxes: list[Mailbox]) -> None:
        self._mailboxes = {m.id: m for m in mailboxes}

    def get_available(self) -> list[Mailbox]:
        return sorted(
            [m for m in self._mailboxes.values() if m.can_send],
            key=lambda m: (-m.health_score, m.sent_today),
        )

    def allocate(
        self,
        recipients: list[str],
        dry_run: bool = False,
    ) -> AllocationResult:
        available = self.get_available()
        if not available:
            return AllocationResult(
                unallocated=recipients,
                reason="no_mailboxes_available",
            )

        allocations: list[SendAllocation] = []
        unallocated: list[str] = []

        for recipient in recipients:
            allocated = False
            for mailbox in available:
                if mailbox.sent_today >= mailbox.daily_cap:
                    continue
                if mailbox.sent_this_hour >= mailbox.hourly_cap:
                    continue

                recipient_domain = recipient.split("@")[1] if "@" in recipient else ""
                mailbox_domain = mailbox.email.split("@")[1] if "@" in mailbox.email else ""
                if recipient_domain == mailbox_domain:
                    continue

                allocations.append(SendAllocation(
                    mailbox_id=mailbox.id,
                    mailbox_email=mailbox.email,
                    recipient_email=recipient,
                    dry_run=dry_run,
                ))
                if not dry_run:
                    mailbox.sent_today += 1
                    mailbox.sent_this_hour += 1
                allocated = True
                break

            if not allocated:
                unallocated.append(recipient)

        return AllocationResult(
            allocated=allocations,
            unallocated=unallocated,
            reason="" if not unallocated else "some_recipients_unallocated",
        )

    def pause_mailbox(self, mailbox_id: str) -> bool:
        if mailbox_id in self._mailboxes:
            self._mailboxes[mailbox_id].status = MailboxStatus.PAUSED
            return True
        return False

    def resume_mailbox(self, mailbox_id: str) -> bool:
        if mailbox_id in self._mailboxes:
            self._mailboxes[mailbox_id].status = MailboxStatus.ACTIVE
            return True
        return False

    def preflight_check(self, mailbox_id: str) -> dict:
        m = self._mailboxes.get(mailbox_id)
        if not m:
            return {"exists": False}
        return {
            "exists": True,
            "status": m.status.value,
            "health": m.health_score,
            "dns_ready": m.dns_ready,
            "can_send": m.can_send,
            "daily_remaining": m.daily_cap - m.sent_today,
            "hourly_remaining": m.hourly_cap - m.sent_this_hour,
        }
