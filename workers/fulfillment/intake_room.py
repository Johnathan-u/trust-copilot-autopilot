"""INTAKE-301: Secure intake room — tokenized upload links that replace
the demo call, bridging interest to proof."""

import hashlib
import secrets
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Optional


@dataclass
class IntakeRoom:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    account_id: str = ""
    contact_email: str = ""
    token: str = field(default_factory=lambda: secrets.token_urlsafe(32))
    status: str = "open"            # "open" | "uploads_received" | "processing" | "completed" | "expired"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None
    trust_note: str = ""
    nda_required: bool = False
    nda_accepted: bool = False

    def __post_init__(self):
        if not self.expires_at:
            self.expires_at = self.created_at + timedelta(days=7)

    @property
    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) > self.expires_at

    @property
    def url(self) -> str:
        return f"/intake/{self.id}?token={self.token}"


@dataclass
class UploadRecord:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str = ""
    filename: str = ""
    content_type: str = ""
    size_bytes: int = 0
    content_hash: str = ""
    storage_key: str = ""
    uploaded_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    uploader_context: str = ""


SUPPORTED_TYPES = {
    "application/pdf", "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain", "application/json",
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


class IntakeService:
    def __init__(self) -> None:
        self._rooms: dict[str, IntakeRoom] = {}
        self._uploads: dict[str, list[UploadRecord]] = {}

    def create_room(self, account_id: str, contact_email: str,
                    trust_note: str = "", nda_required: bool = False) -> IntakeRoom:
        room = IntakeRoom(
            account_id=account_id,
            contact_email=contact_email,
            trust_note=trust_note or "Upload your security questionnaire and we'll return a completed proof pack.",
            nda_required=nda_required,
        )
        self._rooms[room.id] = room
        self._uploads[room.id] = []
        return room

    def validate_token(self, room_id: str, token: str) -> tuple[bool, Optional[IntakeRoom]]:
        room = self._rooms.get(room_id)
        if not room:
            return False, None
        if room.token != token:
            return False, None
        if room.is_expired:
            return False, None
        return True, room

    def upload(self, room_id: str, token: str, filename: str,
               content: bytes, content_type: str,
               uploader_context: str = "") -> tuple[bool, str, Optional[UploadRecord]]:
        valid, room = self.validate_token(room_id, token)
        if not valid:
            return False, "invalid_or_expired_token", None

        if room.nda_required and not room.nda_accepted:
            return False, "nda_not_accepted", None

        if content_type not in SUPPORTED_TYPES:
            return False, f"unsupported_type:{content_type}", None

        if len(content) > MAX_FILE_SIZE:
            return False, "file_too_large", None

        content_hash = hashlib.sha256(content).hexdigest()
        storage_key = f"uploads/{room.account_id}/{room_id}/{content_hash[:16]}_{filename}"

        record = UploadRecord(
            room_id=room_id, filename=filename,
            content_type=content_type, size_bytes=len(content),
            content_hash=content_hash, storage_key=storage_key,
            uploader_context=uploader_context,
        )
        self._uploads[room_id].append(record)
        room.status = "uploads_received"
        return True, "ok", record

    def accept_nda(self, room_id: str, token: str) -> bool:
        valid, room = self.validate_token(room_id, token)
        if valid and room:
            room.nda_accepted = True
            return True
        return False

    def get_uploads(self, room_id: str) -> list[UploadRecord]:
        return self._uploads.get(room_id, [])
