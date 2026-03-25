"""INBOX-206: Inbox ingestion tests."""

import pytest
from workers.inbox.ingest import (
    InboxIngestor, InboundMessage, strip_quoted_content,
)


class TestStripQuoted:
    def test_strips_quoted_lines(self):
        body = "Thanks for reaching out.\n\n> On Mon, Jan 1 wrote:\n> Previous message text"
        clean = strip_quoted_content(body)
        assert "Previous message" not in clean
        assert "Thanks" in clean

    def test_strips_original_message(self):
        body = "Sounds good.\n\n--- Original Message ---\nOld content here."
        clean = strip_quoted_content(body)
        assert "Old content" not in clean

    def test_strips_signature(self):
        body = "I'm interested.\n\n--\nJohn Doe\nCTO, Acme Inc"
        clean = strip_quoted_content(body)
        assert "CTO" not in clean
        assert "interested" in clean

    def test_preserves_clean_body(self):
        body = "This is a clean reply with no quotes."
        assert strip_quoted_content(body) == body


class TestInboxIngestor:
    def setup_method(self):
        self.ingestor = InboxIngestor()

    def test_resolve_thread_from_reply(self):
        self.ingestor.register_outbound("out-1", "thread-abc", "acc-1")
        msg = InboundMessage(
            message_id="reply-1", from_email="alice@acme.com",
            to_email="send@myco.com", subject="Re: Test",
            body_raw="Thanks!", in_reply_to="out-1",
        )
        result = self.ingestor.process(msg)
        assert result.thread_id == "thread-abc"

    def test_resolve_from_references(self):
        self.ingestor.register_outbound("out-1", "thread-xyz")
        msg = InboundMessage(
            message_id="reply-2", from_email="bob@co.com",
            to_email="send@myco.com", subject="Re: Test",
            body_raw="Interesting.", references=["out-1"],
        )
        result = self.ingestor.process(msg)
        assert result.thread_id == "thread-xyz"

    def test_duplicate_ignored(self):
        msg = InboundMessage(
            message_id="dup-1", from_email="alice@acme.com",
            to_email="send@myco.com", subject="Re: Test",
            body_raw="First time.",
        )
        r1 = self.ingestor.process(msg)
        r2 = self.ingestor.process(msg)
        assert not r1.is_duplicate
        assert r2.is_duplicate

    def test_attachments_keyed(self):
        self.ingestor.register_outbound("out-1", "thread-att", "acc-1")
        msg = InboundMessage(
            message_id="att-1", from_email="alice@acme.com",
            to_email="send@myco.com", subject="Re: Test",
            body_raw="See attached.", in_reply_to="out-1",
            attachments=["report.pdf", "data.csv"],
        )
        result = self.ingestor.process(msg)
        assert len(result.attachment_keys) == 2

    def test_clean_body_stripped(self):
        msg = InboundMessage(
            message_id="clean-1", from_email="alice@acme.com",
            to_email="send@myco.com", subject="Re: Test",
            body_raw="Sounds great.\n\n> Previous message text",
        )
        result = self.ingestor.process(msg)
        assert "Previous message" not in result.clean_body
