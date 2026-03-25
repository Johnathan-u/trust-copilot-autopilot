"""SIE-406: Account memory and re-contact logic — remembers prior outcomes
and manages re-contact conditions."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class AccountMemory:
    account_id: str
    last_contacted: Optional[datetime] = None
    last_outcome: Optional[str] = None       # "no_reply" | "positive_reply" | "negative_reply" | "bounce"
    contact_count: int = 0
    snooze_until: Optional[datetime] = None
    objection_tags: list[str] = field(default_factory=list)
    reactivation_triggers: list[str] = field(default_factory=list)
    last_trigger_at: Optional[datetime] = None
    notes: str = ""

    @property
    def is_snoozed(self) -> bool:
        if not self.snooze_until:
            return False
        return datetime.now(timezone.utc) < self.snooze_until

    @property
    def hard_objection(self) -> bool:
        hard_tags = {"not_interested", "competitor_locked", "do_not_contact", "unsubscribed"}
        return bool(set(self.objection_tags) & hard_tags)

    @property
    def has_new_trigger(self) -> bool:
        if not self.last_trigger_at or not self.last_contacted:
            return bool(self.reactivation_triggers)
        return self.last_trigger_at > self.last_contacted


SNOOZE_DURATIONS = {
    "no_reply": 30,         # days
    "soft_no": 60,
    "timing_bad": 90,
    "budget_issue": 90,
    "evaluating_others": 45,
}

REACTIVATION_SIGNALS = {
    "soc2_announced", "funding_round", "upmarket_expansion",
    "compliance_hiring", "security_hiring", "trust_center_launched",
    "certification_milestone",
}


def record_outcome(
    memory: AccountMemory,
    outcome: str,
    objections: list[str] | None = None,
    snooze_reason: str | None = None,
) -> AccountMemory:
    memory.last_contacted = datetime.now(timezone.utc)
    memory.last_outcome = outcome
    memory.contact_count += 1

    if objections:
        for tag in objections:
            if tag not in memory.objection_tags:
                memory.objection_tags.append(tag)

    if snooze_reason and snooze_reason in SNOOZE_DURATIONS:
        from datetime import timedelta
        memory.snooze_until = datetime.now(timezone.utc) + timedelta(
            days=SNOOZE_DURATIONS[snooze_reason]
        )

    return memory


def check_reactivation(
    memory: AccountMemory,
    new_signal_types: list[str],
) -> tuple[bool, list[str]]:
    matching = [s for s in new_signal_types if s in REACTIVATION_SIGNALS]
    if not matching:
        return False, []

    if not memory.hard_objection:
        return True, matching

    if memory.last_contacted:
        from datetime import timedelta
        cooldown = timedelta(days=90)
        if datetime.now(timezone.utc) - memory.last_contacted < cooldown:
            return False, matching

    memory.reactivation_triggers = matching
    memory.last_trigger_at = datetime.now(timezone.utc)
    return True, matching


def should_recontact(memory: AccountMemory) -> tuple[bool, str]:
    if memory.is_snoozed:
        return False, f"snoozed_until:{memory.snooze_until}"

    if memory.hard_objection and not memory.has_new_trigger:
        return False, f"hard_objection:{','.join(memory.objection_tags)}"

    if memory.contact_count >= 3 and memory.last_outcome == "no_reply":
        if not memory.has_new_trigger:
            return False, "max_attempts_no_reply"

    if memory.has_new_trigger:
        return True, f"reactivated_by:{','.join(memory.reactivation_triggers)}"

    if memory.contact_count == 0:
        return True, "first_contact"

    return True, "eligible"
