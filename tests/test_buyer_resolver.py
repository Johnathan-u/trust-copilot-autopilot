"""SIE-401: Buyer resolver tests."""

import pytest
from workers.qualification.buyer_resolver import resolve_buyers, BuyerCandidate


class TestBuyerResolver:
    def test_extract_from_team_page(self):
        text = """Our Leadership Team
Jane Smith - Chief Technology Officer
Bob Jones, VP of Engineering
Alice Brown — Head of Security"""
        candidates = resolve_buyers([(text, "team_page", "https://co.com/team")])
        assert len(candidates) >= 2
        roles = {c.normalized_role for c in candidates}
        assert "cto" in roles

    def test_extract_from_leadership(self):
        text = "Sarah Chen, Chief Information Security Officer leads our security."
        candidates = resolve_buyers([(text, "leadership", "https://co.com/about")])
        assert any(c.normalized_role == "ciso" for c in candidates)

    def test_structured_data(self):
        text = '{"name": "Tom Lee", "jobTitle": "Head of Compliance"}'
        candidates = resolve_buyers([(text, "about", "https://co.com")])
        assert any(c.normalized_role == "head_compliance" for c in candidates)

    def test_deduplication(self):
        text1 = "Jane Smith - CTO"
        text2 = "Jane Smith, Chief Technology Officer"
        candidates = resolve_buyers([
            (text1, "team_page", ""),
            (text2, "leadership", ""),
        ])
        names = [c.name for c in candidates]
        assert names.count("Jane Smith") == 1

    def test_confidence_boosted_by_source(self):
        text = "John Doe - Chief Technology Officer"
        team = resolve_buyers([(text, "leadership", "")])
        about = resolve_buyers([(text, "about", "")])
        assert team[0].confidence > about[0].confidence

    def test_sorted_by_confidence(self):
        text = """Mike A - CEO
Lisa B, Head of Compliance
Tom C — VP of Engineering"""
        candidates = resolve_buyers([(text, "team_page", "")])
        confs = [c.confidence for c in candidates]
        assert confs == sorted(confs, reverse=True)

    def test_no_matches_returns_empty(self):
        candidates = resolve_buyers([("We build great software.", "about", "")])
        assert candidates == []

    def test_evidence_url_preserved(self):
        text = "Jane Smith - Chief Technology Officer"
        candidates = resolve_buyers([(text, "team_page", "https://acme.com/team")])
        assert candidates[0].evidence_url == "https://acme.com/team"

    def test_multiple_pages(self):
        page1 = "Alice Brown - CISO"
        page2 = "Bob Jones, Head of Engineering"
        candidates = resolve_buyers([
            (page1, "team_page", ""),
            (page2, "about", ""),
        ])
        assert len(candidates) == 2
