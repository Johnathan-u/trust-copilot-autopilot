"""INTAKE-301: Intake room tests."""

import pytest
from workers.fulfillment.intake_room import IntakeService


class TestIntakeRoom:
    def setup_method(self):
        self.svc = IntakeService()

    def test_create_room(self):
        room = self.svc.create_room("acc-1", "alice@acme.com")
        assert room.status == "open"
        assert room.token != ""
        assert "/intake/" in room.url

    def test_validate_token(self):
        room = self.svc.create_room("acc-1", "alice@acme.com")
        valid, r = self.svc.validate_token(room.id, room.token)
        assert valid

    def test_invalid_token_rejected(self):
        room = self.svc.create_room("acc-1", "alice@acme.com")
        valid, _ = self.svc.validate_token(room.id, "bad_token")
        assert not valid

    def test_upload_success(self):
        room = self.svc.create_room("acc-1", "alice@acme.com")
        ok, msg, record = self.svc.upload(
            room.id, room.token, "questionnaire.pdf",
            b"fake pdf content", "application/pdf",
        )
        assert ok
        assert record.storage_key != ""
        assert room.status == "uploads_received"

    def test_upload_unsupported_type(self):
        room = self.svc.create_room("acc-1", "alice@acme.com")
        ok, msg, _ = self.svc.upload(
            room.id, room.token, "virus.exe",
            b"bad", "application/x-executable",
        )
        assert not ok
        assert "unsupported" in msg

    def test_upload_too_large(self):
        room = self.svc.create_room("acc-1", "alice@acme.com")
        ok, msg, _ = self.svc.upload(
            room.id, room.token, "big.pdf",
            b"x" * (51 * 1024 * 1024), "application/pdf",
        )
        assert not ok

    def test_nda_required_blocks_upload(self):
        room = self.svc.create_room("acc-1", "alice@acme.com", nda_required=True)
        ok, msg, _ = self.svc.upload(room.id, room.token, "q.pdf", b"data", "application/pdf")
        assert not ok
        assert "nda" in msg

    def test_nda_accept_then_upload(self):
        room = self.svc.create_room("acc-1", "alice@acme.com", nda_required=True)
        self.svc.accept_nda(room.id, room.token)
        ok, _, _ = self.svc.upload(room.id, room.token, "q.pdf", b"data", "application/pdf")
        assert ok

    def test_get_uploads(self):
        room = self.svc.create_room("acc-1", "alice@acme.com")
        self.svc.upload(room.id, room.token, "a.pdf", b"a", "application/pdf")
        self.svc.upload(room.id, room.token, "b.csv", b"b", "text/csv")
        assert len(self.svc.get_uploads(room.id)) == 2
