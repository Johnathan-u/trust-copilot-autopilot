"""MAIL-205: Send worker — traceable, reversible, suppression-aware sending
with bounce/complaint handling."""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from libs.policy.suppression import SuppressionService, SuppressionScope, SuppressionReason


@dataclass
class SendTask:
    id: str = ""
    mailbox_id: str = ""
    mailbox_email: str = ""
    recipient_email: str = ""
    subject: str = ""
    body_text: str = ""
    policy_decision_id: str = ""
    budget_token: str = ""
    account_id: str = ""
    contact_id: str = ""
    campaign_id: str = ""


@dataclass
class SendResult:
    task_id: str
    success: bool
    provider_message_id: str = ""
    payload_hash: str = ""
    error: str = ""
    sent_at: Optional[datetime] = None
    thread_id: str = ""


@dataclass
class BounceEvent:
    recipient_email: str
    bounce_type: str        # "hard" | "soft"
    reason: str = ""
    provider_message_id: str = ""


@dataclass
class ComplaintEvent:
    recipient_email: str
    complaint_type: str     # "spam" | "abuse"
    provider_message_id: str = ""


class SendWorker:
    def __init__(self, suppression: SuppressionService, send_fn=None):
        self._suppression = suppression
        self._send_fn = send_fn
        self._sent: list[SendResult] = []

    def validate_task(self, task: SendTask) -> list[str]:
        errors: list[str] = []
        if not task.policy_decision_id:
            errors.append("Missing policy decision — send not authorized")
        if not task.budget_token:
            errors.append("Missing budget token — send not budgeted")
        if not task.recipient_email:
            errors.append("Missing recipient email")
        if not task.subject or not task.body_text:
            errors.append("Missing message content")

        suppressed, record = self._suppression.is_suppressed(
            email=task.recipient_email, account_id=task.account_id,
        )
        if suppressed:
            errors.append(f"Recipient suppressed: {record.reason.value if record else 'unknown'}")

        return errors

    def send(self, task: SendTask) -> SendResult:
        errors = self.validate_task(task)
        if errors:
            return SendResult(
                task_id=task.id, success=False,
                error="; ".join(errors),
            )

        import hashlib
        payload = f"{task.subject}|{task.body_text}|{task.recipient_email}"
        payload_hash = hashlib.sha256(payload.encode()).hexdigest()[:16]

        provider_id = f"msg_{uuid.uuid4().hex[:12]}"
        thread_id = f"thread_{task.account_id[:8]}" if task.account_id else ""

        if self._send_fn:
            try:
                self._send_fn(task)
            except Exception as e:
                return SendResult(
                    task_id=task.id, success=False,
                    error=str(e), payload_hash=payload_hash,
                )

        result = SendResult(
            task_id=task.id, success=True,
            provider_message_id=provider_id,
            payload_hash=payload_hash,
            sent_at=datetime.now(timezone.utc),
            thread_id=thread_id,
        )
        self._sent.append(result)
        return result

    def process_bounce(self, event: BounceEvent) -> None:
        if event.bounce_type == "hard":
            self._suppression.add(
                SuppressionScope.EMAIL, event.recipient_email,
                SuppressionReason.HARD_BOUNCE,
                notes=f"Hard bounce: {event.reason}",
            )

    def process_complaint(self, event: ComplaintEvent) -> None:
        self._suppression.add(
            SuppressionScope.EMAIL, event.recipient_email,
            SuppressionReason.COMPLAINT,
            notes=f"Complaint: {event.complaint_type}",
        )
