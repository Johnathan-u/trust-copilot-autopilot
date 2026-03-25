"""OFFER-304: Offer engine tests."""

import pytest
from workers.fulfillment.offer_engine import select_offer, PLANS


class TestOfferEngine:
    def test_pilot_after_proof(self):
        offer = select_offer("pro", 0.7, answered_pct=80.0, has_proof=True)
        assert offer.plan.plan_id == "pilot_one_time"
        assert offer.plan.credit_to_subscription

    def test_enterprise_tier(self):
        offer = select_offer("enterprise", 0.8)
        assert offer.plan.plan_id == "enterprise_annual"

    def test_business_tier(self):
        offer = select_offer("business", 0.7)
        assert offer.plan.plan_id == "business_monthly"

    def test_pro_tier(self):
        offer = select_offer("pro", 0.5)
        assert offer.plan.plan_id == "pro_monthly"

    def test_default_pilot(self):
        offer = select_offer("starter", 0.2)
        assert offer.plan.plan_id == "pilot_one_time"

    def test_reasoning_present(self):
        offer = select_offer("pro", 0.7, answered_pct=80.0, has_proof=True)
        assert len(offer.reasoning) > 5

    def test_expiry_set(self):
        offer = select_offer("pro", 0.5)
        assert offer.expires_at is not None

    def test_eligibility_check(self):
        offer = select_offer("enterprise", 0.3)  # below min_icp for enterprise
        assert not offer.eligible
