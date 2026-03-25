"""ONBD-306: Workspace provisioning — creates workspace, links artifacts,
and sends onboarding email after successful payment."""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class Workspace:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    account_id: str = ""
    plan_id: str = ""
    status: str = "active"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    invite_token: str = field(default_factory=lambda: uuid.uuid4().hex[:24])
    primary_email: str = ""
    linked_uploads: list[str] = field(default_factory=list)
    linked_proof_ids: list[str] = field(default_factory=list)
    settings: dict = field(default_factory=lambda: {
        "timezone": "UTC",
        "notifications_enabled": True,
        "auto_renew": True,
    })


@dataclass
class OnboardingEmail:
    to: str
    subject: str
    body: str
    invite_url: str


class ProvisioningService:
    def __init__(self) -> None:
        self._workspaces: dict[str, Workspace] = {}
        self._provisioned_accounts: set[str] = set()
        self._emails_sent: list[OnboardingEmail] = []

    def provision(self, account_id: str, plan_id: str,
                  primary_email: str, upload_keys: list[str] = None,
                  proof_ids: list[str] = None) -> tuple[Workspace, bool]:
        if account_id in self._provisioned_accounts:
            existing = next(
                (w for w in self._workspaces.values() if w.account_id == account_id),
                None,
            )
            if existing:
                return existing, False

        ws = Workspace(
            account_id=account_id, plan_id=plan_id,
            primary_email=primary_email,
            linked_uploads=upload_keys or [],
            linked_proof_ids=proof_ids or [],
        )
        self._workspaces[ws.id] = ws
        self._provisioned_accounts.add(account_id)

        email = self._compose_onboarding(ws)
        self._emails_sent.append(email)

        return ws, True

    def _compose_onboarding(self, ws: Workspace) -> OnboardingEmail:
        invite_url = f"/activate/{ws.id}?token={ws.invite_token}"
        body_parts = [
            f"Welcome to Trust Copilot!",
            f"\nYour workspace is ready. Click below to get started:",
            f"\n{invite_url}",
        ]
        if ws.linked_proof_ids:
            body_parts.append(f"\nYour {len(ws.linked_proof_ids)} proof pack(s) are already in your workspace.")
        if ws.linked_uploads:
            body_parts.append(f"\n{len(ws.linked_uploads)} uploaded file(s) have been linked.")
        body_parts.append("\nBest,\nThe Trust Copilot Team")

        return OnboardingEmail(
            to=ws.primary_email,
            subject="Your Trust Copilot workspace is ready",
            body="\n".join(body_parts),
            invite_url=invite_url,
        )

    def get_workspace(self, workspace_id: str) -> Optional[Workspace]:
        return self._workspaces.get(workspace_id)

    def emails_sent(self) -> list[OnboardingEmail]:
        return list(self._emails_sent)
