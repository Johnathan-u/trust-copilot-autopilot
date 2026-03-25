"""SIE-404: Competitor detection tests."""

import pytest
from workers.qualification.competitor_detection import (
    detect_competitors, has_blocking_competitor, competitor_strategy_effect,
)


class TestCompetitorDetection:
    def test_detect_vanta(self):
        hits = detect_competitors("We use Vanta for our compliance automation.")
        assert len(hits) >= 1
        assert hits[0].competitor == "vanta"

    def test_detect_drata(self):
        hits = detect_competitors("Powered by Drata compliance platform.")
        assert any(h.competitor == "drata" for h in hits)

    def test_detect_secureframe(self):
        hits = detect_competitors("We deployed Secureframe last quarter.")
        assert any(h.competitor == "secureframe" for h in hits)

    def test_soften_competitor(self):
        hits = detect_competitors("We previously used Sprinto for compliance.")
        sprinto = [h for h in hits if h.competitor == "sprinto"]
        assert sprinto[0].effect == "soften"

    def test_reposition_competitor(self):
        hits = detect_competitors("Our security testing is done through Oneleet.")
        oneleet = [h for h in hits if h.competitor == "oneleet"]
        assert oneleet[0].effect == "reposition"

    def test_no_competitors(self):
        hits = detect_competitors("We build great software for teams.")
        assert hits == []

    def test_evidence_snippet(self):
        hits = detect_competitors("Our trust center is powered by Vanta.")
        assert len(hits[0].evidence_snippet) > 5

    def test_usage_context_boosts_confidence(self):
        active = detect_competitors("We already use Vanta for compliance.")
        mention = detect_competitors("Vanta is one option we've looked at.")
        assert active[0].confidence >= mention[0].confidence

    def test_curated_list_coverage(self):
        competitors = ["vanta", "drata", "secureframe", "sprinto", "thoropass"]
        for comp in competitors:
            hits = detect_competitors(f"We use {comp} for compliance.")
            assert len(hits) >= 1, f"Failed to detect {comp}"


class TestStrategyEffect:
    def test_blocking(self):
        hits = detect_competitors("Already using Vanta.")
        assert has_blocking_competitor(hits)

    def test_not_blocking_soft(self):
        hits = detect_competitors("We looked at Sprinto.")
        assert not has_blocking_competitor(hits)

    def test_strategy_block(self):
        hits = detect_competitors("Powered by Drata compliance.")
        assert competitor_strategy_effect(hits) == "block"

    def test_strategy_soften(self):
        hits = detect_competitors("We used Sprinto before.")
        assert competitor_strategy_effect(hits) == "soften"

    def test_strategy_no_competitor(self):
        assert competitor_strategy_effect([]) == "no_competitor"
