"""SIE-107: Page-type classifier tests."""

import pytest

from workers.discovery.page_classifier import classify_page


class TestURLClassification:
    def test_trust_page_url(self):
        r = classify_page("https://example.com/trust")
        assert r.page_type == "trust_page"
        assert r.confidence >= 0.5
        assert "url_trust" in r.matched_rules

    def test_security_page_url(self):
        r = classify_page("https://example.com/security")
        assert r.page_type == "security_page"

    def test_careers_page_url(self):
        r = classify_page("https://example.com/careers")
        assert r.page_type == "careers_page"

    def test_blog_page_url(self):
        r = classify_page("https://example.com/blog/post-1")
        assert r.page_type == "blog_page"

    def test_press_page_url(self):
        r = classify_page("https://example.com/press")
        assert r.page_type == "press_page"

    def test_pricing_page_url(self):
        r = classify_page("https://example.com/pricing")
        assert r.page_type == "pricing_page"

    def test_docs_page_url(self):
        r = classify_page("https://example.com/docs/getting-started")
        assert r.page_type == "docs_page"

    def test_team_page_url(self):
        r = classify_page("https://example.com/about")
        assert r.page_type == "team_page"


class TestContentClassification:
    def test_compliance_content_boosts_trust(self):
        r = classify_page(
            "https://example.com/info",
            text_content="We are SOC 2 Type II certified and HIPAA compliant.",
        )
        assert r.page_type == "trust_page"

    def test_hiring_content_detects_careers(self):
        r = classify_page(
            "https://example.com/page",
            text_content="We're hiring! Join our team and apply now.",
        )
        assert r.page_type == "careers_page"


class TestTitleClassification:
    def test_trust_center_title(self):
        r = classify_page("https://example.com/info", title="Trust Center")
        assert r.page_type == "trust_page"

    def test_blog_title(self):
        r = classify_page("https://example.com/page", title="Blog - Latest Posts")
        assert r.page_type == "blog_page"


class TestGenericFallback:
    def test_unknown_page_is_generic(self):
        r = classify_page("https://example.com/random-page")
        assert r.page_type == "generic"
        assert r.confidence < 0.5

    def test_empty_inputs(self):
        r = classify_page("")
        assert r.page_type == "generic"


class TestMultiRuleBoost:
    def test_url_and_content_match_boosts_confidence(self):
        r = classify_page(
            "https://example.com/trust",
            text_content="We are SOC 2 Type II certified.",
        )
        assert r.page_type == "trust_page"
        assert r.confidence > 0.6
        assert len(r.matched_rules) >= 2
