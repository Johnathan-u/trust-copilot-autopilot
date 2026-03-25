"""SIE-504: Explanation bundle tests."""

import pytest
from workers.send.explanation_bundle import build_explanation, ExplanationBundle


class TestExplanationBundle:
    def test_send_bundle(self):
        b = build_explanation(
            "acc-1", "send", 2,
            [("soc2_announced", "ev-1"), ("funding_round", "ev-2")],
            [], "CTO is primary buyer", "Upload CTA chosen",
            ["all_checks_passed"], ["tier2_good_composite"],
        )
        assert b.decision == "send"
        assert b.priority_tier == 2
        assert len(b.triggers()) == 2
        assert "SEND" in b.summary

    def test_no_send_bundle(self):
        b = build_explanation(
            "acc-2", "no_send", 0,
            [("soc2_announced", "ev-1")],
            [("negative_competitor", "Uses Vanta")],
            "", "", ["domain_suppressed"], ["blocking_competitor"],
        )
        assert b.decision == "no_send"
        assert len(b.negatives()) == 1
        assert "NO SEND" in b.summary

    def test_to_dict(self):
        b = build_explanation("acc-1", "send", 1, [], [], "", "", [], [])
        d = b.to_dict()
        assert d["account_id"] == "acc-1"
        assert isinstance(d["items"], list)

    def test_reason_codes_map_to_items(self):
        b = build_explanation(
            "acc-1", "send", 1,
            [("funding_round", "ev-1")], [],
            "CTO chosen", "Proof page CTA",
            ["all_checks_passed"], ["tier1_high"],
        )
        categories = {i.category for i in b.items}
        assert "trigger" in categories
        assert "buyer" in categories
        assert "cta" in categories
        assert "decision" in categories

    def test_empty_triggers(self):
        b = build_explanation("acc-1", "defer", 0, [], [], "", "", [], ["snoozed"])
        assert len(b.triggers()) == 0
        assert "DEFERRED" in b.summary
