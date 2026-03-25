"""SIE-202: Versioned trigger taxonomy — maps signal types to categories,
weights, decay half-lives, and human-readable explanations."""

from dataclasses import dataclass
from db.models.enums import TriggerCategory

TAXONOMY_VERSION = 1


@dataclass(frozen=True)
class TriggerSpec:
    signal_type: str
    category: TriggerCategory
    base_weight: float
    decay_half_life_days: int
    explanation: str


TRIGGER_TAXONOMY: dict[str, TriggerSpec] = {
    # ── Positive triggers ──
    "soc2_announced": TriggerSpec(
        "soc2_announced", TriggerCategory.POSITIVE, 1.0, 90,
        "Company announced or achieved SOC 2 certification"),
    "iso27001_mentioned": TriggerSpec(
        "iso27001_mentioned", TriggerCategory.POSITIVE, 0.9, 90,
        "ISO 27001 certification mentioned"),
    "trust_center_launched": TriggerSpec(
        "trust_center_launched", TriggerCategory.POSITIVE, 0.95, 60,
        "Trust center or security portal launched"),
    "security_hiring": TriggerSpec(
        "security_hiring", TriggerCategory.POSITIVE, 0.8, 45,
        "Hiring for security/infosec roles"),
    "compliance_hiring": TriggerSpec(
        "compliance_hiring", TriggerCategory.POSITIVE, 0.85, 45,
        "Hiring for compliance/GRC roles"),
    "funding_round": TriggerSpec(
        "funding_round", TriggerCategory.POSITIVE, 0.7, 60,
        "Recently closed a funding round"),
    "upmarket_expansion": TriggerSpec(
        "upmarket_expansion", TriggerCategory.POSITIVE, 0.8, 60,
        "Moving upmarket or targeting enterprise customers"),
    "procurement_review": TriggerSpec(
        "procurement_review", TriggerCategory.POSITIVE, 0.75, 30,
        "Procurement or security review process mentioned"),
    "certification_milestone": TriggerSpec(
        "certification_milestone", TriggerCategory.POSITIVE, 0.85, 90,
        "Achieved a compliance certification milestone"),

    # ── Supporting signals ──
    "trust_page_added": TriggerSpec(
        "trust_page_added", TriggerCategory.SUPPORTING, 0.5, 120,
        "Trust or security page exists on the site"),
    "enterprise_customer_mention": TriggerSpec(
        "enterprise_customer_mention", TriggerCategory.SUPPORTING, 0.4, 90,
        "Enterprise customers mentioned"),
    "vendor_security_mention": TriggerSpec(
        "vendor_security_mention", TriggerCategory.SUPPORTING, 0.5, 60,
        "Vendor security or third-party risk mentioned"),

    # ── Negative signals ──
    "negative_competitor": TriggerSpec(
        "negative_competitor", TriggerCategory.NEGATIVE, -0.9, 180,
        "Competitor product already in use"),
    "negative_too_small": TriggerSpec(
        "negative_too_small", TriggerCategory.NEGATIVE, -0.6, 365,
        "Company appears too small for the product"),
    "negative_too_large": TriggerSpec(
        "negative_too_large", TriggerCategory.NEGATIVE, -0.5, 365,
        "Company appears too large for the product"),
    "negative_stale": TriggerSpec(
        "negative_stale", TriggerCategory.NEGATIVE, -0.3, 30,
        "Signal references an old date, likely stale"),
}


def get_spec(signal_type: str) -> TriggerSpec | None:
    return TRIGGER_TAXONOMY.get(signal_type)


def get_weight(signal_type: str) -> float:
    spec = get_spec(signal_type)
    return spec.base_weight if spec else 0.0


def get_category(signal_type: str) -> TriggerCategory:
    spec = get_spec(signal_type)
    return spec.category if spec else TriggerCategory.SUPPORTING


def all_positive() -> list[TriggerSpec]:
    return [s for s in TRIGGER_TAXONOMY.values() if s.category == TriggerCategory.POSITIVE]


def all_negative() -> list[TriggerSpec]:
    return [s for s in TRIGGER_TAXONOMY.values() if s.category == TriggerCategory.NEGATIVE]
