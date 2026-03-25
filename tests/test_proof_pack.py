"""FUL-303: Proof pack tests."""

import pytest
from workers.fulfillment.proof_pack import (
    render_proof_pack, compose_delivery_email, ProofItem,
)


class TestProofPack:
    def test_render_all_answered(self):
        items = [
            ProofItem("Q1", "A1", "ev-1"),
            ProofItem("Q2", "A2", "ev-2"),
        ]
        pack = render_proof_pack("job-1", "acc-1", items)
        assert pack.answered_pct == 100.0
        assert pack.total_questions == 2
        assert len(pack.gaps) == 0

    def test_render_with_gaps(self):
        items = [
            ProofItem("Q1", "A1", "ev-1"),
            ProofItem("Q2", "", "", status="unanswered"),
        ]
        pack = render_proof_pack("job-1", "acc-1", items)
        assert pack.answered_pct == 50.0
        assert len(pack.gaps) == 1
        assert "Q2" in pack.gaps

    def test_citation_coverage(self):
        items = [
            ProofItem("Q1", "A1", "ev-1"),
            ProofItem("Q2", "A2", ""),
        ]
        pack = render_proof_pack("job-1", "acc-1", items)
        assert pack.citation_coverage == 50.0

    def test_next_steps_include_upload_for_gaps(self):
        items = [ProofItem("Q1", "", "", status="unanswered")]
        pack = render_proof_pack("job-1", "acc-1", items)
        assert any("Upload" in s or "upload" in s for s in pack.next_steps)

    def test_access_token_present(self):
        pack = render_proof_pack("job-1", "acc-1", [ProofItem("Q1", "A1", "ev-1")])
        assert pack.access_token != ""
        assert pack.access_token in pack.url


class TestDeliveryEmail:
    def test_compose(self):
        items = [ProofItem("Q1", "A1", "ev-1")]
        pack = render_proof_pack("job-1", "acc-1", items)
        email = compose_delivery_email(pack, "alice@acme.com", "Alice", "/checkout/1")
        assert "100.0%" in email.subject
        assert "Alice" in email.body
        assert email.proof_url != ""

    def test_gaps_mentioned(self):
        items = [ProofItem("Q1", "", "", status="unanswered")]
        pack = render_proof_pack("job-1", "acc-1", items)
        email = compose_delivery_email(pack, "alice@acme.com", "Alice")
        assert "still need" in email.body or "missing" in email.body
