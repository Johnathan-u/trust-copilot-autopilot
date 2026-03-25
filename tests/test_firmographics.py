"""SIE-301: Firmographic estimator tests."""

import pytest
from workers.qualification.firmographics import estimate_firmographics


class TestSizeBand:
    def test_micro(self):
        r = estimate_firmographics("We are a 5 employee startup.")
        assert r.size_band == "micro"

    def test_small(self):
        r = estimate_firmographics("Our team has 30 employees across the US.")
        assert r.size_band == "small"

    def test_mid(self):
        r = estimate_firmographics("We have 200 employees globally.")
        assert r.size_band == "mid"

    def test_growth(self):
        r = estimate_firmographics("The company has grown to 800 employees.")
        assert r.size_band == "growth"

    def test_enterprise(self):
        r = estimate_firmographics("We have 50,000 employees worldwide.")
        assert r.size_band == "enterprise"

    def test_unknown_when_no_clues(self):
        r = estimate_firmographics("We build great software.")
        assert r.size_band == "unknown"


class TestIndustry:
    def test_fintech(self):
        r = estimate_firmographics("We are a fintech company building payment APIs.")
        assert r.industry == "fintech"

    def test_healthtech(self):
        r = estimate_firmographics("Our HIPAA-compliant telehealth platform.")
        assert r.industry == "healthtech"

    def test_saas(self):
        r = estimate_firmographics("We offer a SaaS cloud platform for teams.")
        assert r.industry == "saas"

    def test_devtools(self):
        r = estimate_firmographics("Developer tools and API platform for engineers.")
        assert r.industry == "devtools"


class TestB2BDetection:
    def test_b2b_enterprise(self):
        r = estimate_firmographics("Enterprise B2B platform for procurement teams.")
        assert r.is_b2b >= 0.7

    def test_b2c_consumer(self):
        r = estimate_firmographics("Download the app for consumer retail shopping.")
        assert r.is_b2b <= 0.4

    def test_neutral(self):
        r = estimate_firmographics("We build things.")
        assert 0.3 <= r.is_b2b <= 0.7


class TestEnterpriseMotion:
    def test_strong_motion(self):
        r = estimate_firmographics(
            "Enterprise plan available. SOC 2 Type II. Contact sales for custom pricing."
        )
        assert r.enterprise_motion >= 0.4

    def test_no_motion(self):
        r = estimate_firmographics("Simple tool one-click free.")
        assert r.enterprise_motion < 0.2


class TestConfidence:
    def test_more_rules_higher_confidence(self):
        sparse = estimate("We exist.")
        rich = estimate("B2B SaaS platform with 50 employees. Enterprise plan. SOC 2.")
        assert rich.confidence > sparse.confidence


def estimate(text):
    return estimate_firmographics(text)
