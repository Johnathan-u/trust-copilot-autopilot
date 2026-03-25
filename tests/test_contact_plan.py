"""SIE-403: Contact plan tests."""

import pytest
from workers.qualification.buyer_resolver import BuyerCandidate
from workers.qualification.buyer_psychology import BuyerPriority
from workers.qualification.contact_plan import build_contact_plan, ContactPlan


def _candidate(name, role, norm, conf=0.75):
    return BuyerCandidate(name=name, role=role, normalized_role=norm,
                          confidence=conf, source="team_page")


def _priority(primary="cto", secondary=None):
    return BuyerPriority(primary, secondary or ["head_security", "vp_eng"], "test")


class TestContactPlan:
    def test_primary_match_ranked_first(self):
        plan = build_contact_plan("acc-1", [
            _candidate("Alice", "VP Eng", "vp_eng"),
            _candidate("Bob", "CTO", "cto"),
        ], _priority("cto"))
        assert plan.slots[0].normalized_role == "cto"
        assert plan.slots[0].rank == 1

    def test_ordered_by_combined_score(self):
        plan = build_contact_plan("acc-1", [
            _candidate("A", "CTO", "cto", 0.9),
            _candidate("B", "VP Eng", "vp_eng", 0.9),
            _candidate("C", "CISO", "ciso", 0.4),
        ], _priority("cto", ["vp_eng"]))
        assert plan.slots[0].normalized_role == "cto"
        ranks = [s.rank for s in plan.slots]
        assert ranks == sorted(ranks)

    def test_empty_candidates(self):
        plan = build_contact_plan("acc-1", [], _priority())
        assert plan.max_attempts == 0
        assert plan.stop_reason == "no_candidates_found"

    def test_max_attempts_capped(self):
        plan = build_contact_plan("acc-1", [
            _candidate("A", "CTO", "cto"),
            _candidate("B", "VP", "vp_eng"),
            _candidate("C", "CISO", "ciso"),
            _candidate("D", "CEO", "founder_ceo"),
        ], _priority(), max_attempts=2)
        assert plan.max_attempts <= 2

    def test_stop_if_no_response_on_deep_fallback(self):
        plan = build_contact_plan("acc-1", [
            _candidate("A", "CTO", "cto"),
            _candidate("B", "VP", "vp_eng"),
            _candidate("C", "CISO", "ciso"),
        ], _priority("cto", ["vp_eng", "ciso"]))
        deep = [s for s in plan.slots if s.rank >= 3]
        if deep:
            assert deep[0].stop_if_no_response

    def test_confidence_is_combined(self):
        plan = build_contact_plan("acc-1", [
            _candidate("A", "CTO", "cto", 0.8),
        ], _priority("cto"))
        assert 0.0 < plan.slots[0].confidence <= 1.0

    def test_evidence_url_preserved(self):
        c = _candidate("A", "CTO", "cto")
        c.evidence_url = "https://acme.com/team"
        plan = build_contact_plan("acc-1", [c], _priority())
        assert plan.slots[0].evidence_url == "https://acme.com/team"
