"""FUL-303: Proof pack renderer — generates buyer-readable proof artifacts
with answered percentages, citations, gap reports, and delivery emails."""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class ProofItem:
    question: str
    answer: str
    evidence_citation: str = ""
    status: str = "answered"    # "answered" | "partial" | "unanswered"


@dataclass
class ProofPack:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str = ""
    account_id: str = ""
    total_questions: int = 0
    answered: int = 0
    partial: int = 0
    unanswered: int = 0
    items: list[ProofItem] = field(default_factory=list)
    gaps: list[str] = field(default_factory=list)
    next_steps: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    access_token: str = ""
    url: str = ""

    @property
    def answered_pct(self) -> float:
        if self.total_questions == 0:
            return 0.0
        return round(self.answered / self.total_questions * 100, 1)

    @property
    def citation_coverage(self) -> float:
        cited = sum(1 for i in self.items if i.evidence_citation and i.status == "answered")
        return round(cited / max(self.answered, 1) * 100, 1)


@dataclass
class ProofDeliveryEmail:
    to: str
    subject: str
    body: str
    proof_url: str
    checkout_url: str


def render_proof_pack(
    job_id: str,
    account_id: str,
    items: list[ProofItem],
) -> ProofPack:
    answered = sum(1 for i in items if i.status == "answered")
    partial = sum(1 for i in items if i.status == "partial")
    unanswered = sum(1 for i in items if i.status == "unanswered")

    gaps = [i.question for i in items if i.status == "unanswered"]

    next_steps = []
    if unanswered > 0:
        next_steps.append(f"Upload additional evidence for {unanswered} unanswered items")
    if partial > 0:
        next_steps.append(f"Review {partial} partially answered items for completeness")
    next_steps.append("Proceed to checkout to activate your workspace")

    token = uuid.uuid4().hex[:24]
    pack = ProofPack(
        job_id=job_id, account_id=account_id,
        total_questions=len(items),
        answered=answered, partial=partial, unanswered=unanswered,
        items=items, gaps=gaps, next_steps=next_steps,
        access_token=token,
        url=f"/proof/{job_id}?token={token}",
    )
    return pack


def compose_delivery_email(
    pack: ProofPack,
    recipient_email: str,
    recipient_name: str,
    checkout_url: str = "",
) -> ProofDeliveryEmail:
    subject = f"Your proof pack is ready — {pack.answered_pct}% answered"

    body_parts = [
        f"Hi {recipient_name},",
        f"\nYour security questionnaire proof pack is ready with {pack.answered} of {pack.total_questions} questions answered ({pack.answered_pct}%).",
    ]

    if pack.gaps:
        body_parts.append(f"\n{len(pack.gaps)} items still need evidence — you can upload more at any time.")

    body_parts.append(f"\nView your proof pack: {pack.url}")

    if checkout_url:
        body_parts.append(f"\nReady to activate? {checkout_url}")

    body_parts.append("\nBest,\n[Trust Copilot Team]")

    return ProofDeliveryEmail(
        to=recipient_email,
        subject=subject,
        body="\n".join(body_parts),
        proof_url=pack.url,
        checkout_url=checkout_url,
    )
