"""INBOX-206: Inbound mail ingestion and thread assembly — resolves threads,
strips quoted content, captures attachments, and maps to account/contact."""

import hashlib
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class InboundMessage:
    message_id: str
    from_email: str
    to_email: str
    subject: str
    body_raw: str
    references: list[str] = field(default_factory=list)
    in_reply_to: str = ""
    received_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    attachments: list[str] = field(default_factory=list)


@dataclass
class ProcessedReply:
    message_id: str
    thread_id: str
    from_email: str
    clean_body: str
    is_duplicate: bool = False
    account_id: str = ""
    contact_id: str = ""
    campaign_id: str = ""
    attachment_keys: list[str] = field(default_factory=list)


QUOTED_PATTERNS = [
    re.compile(r"^>.*$", re.M),
    re.compile(r"^On .+ wrote:$", re.M),
    re.compile(r"^-{3,}\s*Original Message\s*-{3,}.*", re.M | re.S),
    re.compile(r"^_{3,}\s*$", re.M),
    re.compile(r"^From:.*$", re.M),
]

SIGNATURE_PATTERNS = [
    re.compile(r"^--\s*$", re.M),
    re.compile(r"^(Best|Regards|Thanks|Cheers|Sent from),?\s*$", re.M),
]


def strip_quoted_content(body: str) -> str:
    lines = body.split("\n")
    clean: list[str] = []
    in_quote = False

    for line in lines:
        if any(p.match(line) for p in QUOTED_PATTERNS):
            in_quote = True
            continue
        if in_quote:
            continue
        clean.append(line)

    text = "\n".join(clean)

    for pattern in SIGNATURE_PATTERNS:
        m = pattern.search(text)
        if m:
            text = text[:m.start()]

    return text.strip()


class InboxIngestor:
    def __init__(self) -> None:
        self._seen_ids: set[str] = set()
        self._thread_map: dict[str, str] = {}  # message_id -> thread_id
        self._account_map: dict[str, str] = {}  # email -> account_id
        self._contact_map: dict[str, str] = {}  # email -> contact_id
        self._campaign_map: dict[str, str] = {}  # thread_id -> campaign_id

    def register_outbound(self, message_id: str, thread_id: str,
                          account_id: str = "", contact_id: str = "",
                          campaign_id: str = "") -> None:
        self._thread_map[message_id] = thread_id
        if contact_id and "@" in contact_id:
            self._contact_map[contact_id] = contact_id
        if account_id:
            self._account_map[thread_id] = account_id
        if campaign_id:
            self._campaign_map[thread_id] = campaign_id

    def resolve_thread(self, msg: InboundMessage) -> str:
        if msg.in_reply_to and msg.in_reply_to in self._thread_map:
            return self._thread_map[msg.in_reply_to]
        for ref in msg.references:
            if ref in self._thread_map:
                return self._thread_map[ref]
        return f"thread_{hashlib.sha256(msg.from_email.encode()).hexdigest()[:12]}"

    def process(self, msg: InboundMessage) -> ProcessedReply:
        if msg.message_id in self._seen_ids:
            return ProcessedReply(
                message_id=msg.message_id,
                thread_id="",
                from_email=msg.from_email,
                clean_body="",
                is_duplicate=True,
            )
        self._seen_ids.add(msg.message_id)

        thread_id = self.resolve_thread(msg)
        self._thread_map[msg.message_id] = thread_id

        clean_body = strip_quoted_content(msg.body_raw)

        account_id = self._account_map.get(thread_id, "")
        contact_id = self._contact_map.get(msg.from_email, "")
        campaign_id = self._campaign_map.get(thread_id, "")

        attachment_keys = [
            f"attachments/{thread_id}/{hashlib.sha256(a.encode()).hexdigest()[:12]}"
            for a in msg.attachments
        ]

        return ProcessedReply(
            message_id=msg.message_id,
            thread_id=thread_id,
            from_email=msg.from_email,
            clean_body=clean_body,
            account_id=account_id,
            contact_id=contact_id,
            campaign_id=campaign_id,
            attachment_keys=attachment_keys,
        )
