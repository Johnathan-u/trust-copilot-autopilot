"""SIE-202: Trigger taxonomy tests."""

import pytest
from db.models.enums import TriggerCategory
from workers.discovery.taxonomy import (
    TRIGGER_TAXONOMY,
    TAXONOMY_VERSION,
    get_spec,
    get_weight,
    get_category,
    all_positive,
    all_negative,
)


class TestTaxonomyCompleteness:
    def test_version_exists(self):
        assert TAXONOMY_VERSION >= 1

    def test_all_signal_types_mapped(self):
        expected_types = {
            "soc2_announced", "iso27001_mentioned", "trust_center_launched",
            "security_hiring", "compliance_hiring", "funding_round",
            "upmarket_expansion", "procurement_review", "certification_milestone",
            "trust_page_added", "enterprise_customer_mention", "vendor_security_mention",
            "negative_competitor", "negative_too_small", "negative_too_large", "negative_stale",
        }
        assert set(TRIGGER_TAXONOMY.keys()) == expected_types

    def test_every_signal_has_category(self):
        for name, spec in TRIGGER_TAXONOMY.items():
            assert spec.category in TriggerCategory, f"{name} has invalid category"

    def test_every_signal_has_positive_half_life(self):
        for name, spec in TRIGGER_TAXONOMY.items():
            assert spec.decay_half_life_days > 0, f"{name} has zero/negative half-life"


class TestWeights:
    def test_positive_signals_have_positive_weight(self):
        for spec in all_positive():
            assert spec.base_weight > 0, f"{spec.signal_type} should be positive"

    def test_negative_signals_have_negative_weight(self):
        for spec in all_negative():
            assert spec.base_weight < 0, f"{spec.signal_type} should be negative"

    def test_soc2_is_highest_weight(self):
        assert get_weight("soc2_announced") >= get_weight("funding_round")

    def test_unknown_returns_zero(self):
        assert get_weight("nonexistent_signal") == 0.0


class TestCategories:
    def test_positive_count(self):
        assert len(all_positive()) >= 9

    def test_negative_count(self):
        assert len(all_negative()) >= 4

    def test_unknown_defaults_to_supporting(self):
        assert get_category("unknown_thing") == TriggerCategory.SUPPORTING
