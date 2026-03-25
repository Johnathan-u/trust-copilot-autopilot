"""SIE-305: Deal value estimator tests."""

import pytest
from workers.qualification.firmographics import FirmographicEstimate
from workers.qualification.urgency import UrgencyScore
from workers.qualification.deal_value import estimate_deal_value


def _firm(size="mid", b2b=0.8, ent=0.4):
    return FirmographicEstimate(
        size_band=size, industry="saas", is_b2b=b2b,
        enterprise_motion=ent, product_type="platform", confidence=0.7,
    )


def _urgency(mon=0.7):
    return UrgencyScore(urgency=0.6, monetization_prob=mon,
                        urgency_explanation="", monetization_explanation="")


class TestDealValue:
    def test_mid_company_reasonable_mrr(self):
        dv = estimate_deal_value(_firm("mid"), _urgency())
        assert 30_000 <= dv.monthly_value_estimate <= 150_000

    def test_enterprise_higher_than_micro(self):
        ent = estimate_deal_value(_firm("enterprise"), _urgency())
        micro = estimate_deal_value(_firm("micro"), _urgency())
        assert ent.monthly_value_estimate > micro.monthly_value_estimate

    def test_expected_value_includes_win_prob(self):
        high_prob = estimate_deal_value(_firm(), _urgency(0.9))
        low_prob = estimate_deal_value(_firm(), _urgency(0.1))
        assert high_prob.expected_value > low_prob.expected_value

    def test_b2c_discount(self):
        b2b = estimate_deal_value(_firm(b2b=0.9), _urgency())
        b2c = estimate_deal_value(_firm(b2b=0.2), _urgency())
        assert b2b.monthly_value_estimate > b2c.monthly_value_estimate

    def test_tier_assignment(self):
        dv = estimate_deal_value(_firm("growth"), _urgency())
        assert dv.tier in ("starter", "pro", "business", "enterprise")

    def test_ltv_bucket(self):
        dv = estimate_deal_value(_firm("mid"), _urgency())
        assert dv.ltv_bucket in ("low", "medium", "high", "enterprise")

    def test_explanation_present(self):
        dv = estimate_deal_value(_firm(), _urgency())
        assert "MRR=" in dv.explanation
        assert "LTV=" in dv.explanation

    def test_sort_by_expected_value(self):
        accounts = [
            estimate_deal_value(_firm("micro"), _urgency(0.3)),
            estimate_deal_value(_firm("growth"), _urgency(0.8)),
            estimate_deal_value(_firm("mid"), _urgency(0.6)),
        ]
        sorted_accs = sorted(accounts, key=lambda d: -d.expected_value)
        assert sorted_accs[0].expected_value >= sorted_accs[-1].expected_value
