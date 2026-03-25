"""SIE-002: Signal contract validation tests."""

import uuid
from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from db.models.enums import EvidenceKind, SignalType, SourceType, TriggerCategory
from libs.contracts.signals import NormalizedSignalOut, RawSignalIn, SignalFilter


class TestRawSignalIn:
    def test_valid_raw_signal(self):
        sig = RawSignalIn(
            source_type=SourceType.COMPANY_SITE,
            source_url="https://example.com/security",
            candidate_domain="example.com",
            raw_text="We are SOC 2 Type II certified",
        )
        assert sig.source_type == SourceType.COMPANY_SITE
        assert sig.candidate_domain == "example.com"

    def test_rejects_no_scheme_url(self):
        with pytest.raises(ValidationError):
            RawSignalIn(
                source_type=SourceType.COMPANY_SITE,
                source_url="example.com/security",
            )

    def test_rejects_missing_source_type(self):
        with pytest.raises(ValidationError):
            RawSignalIn(source_url="https://example.com")


class TestNormalizedSignalOut:
    def test_valid_normalized_signal(self):
        sig = NormalizedSignalOut(
            id=uuid.uuid4(),
            signal_type=SignalType.SOC2_ANNOUNCED,
            evidence_kind=EvidenceKind.TEXT_SPAN,
            evidence_text="SOC 2 Type II certified as of Q4 2025",
            observed_at=datetime.now(timezone.utc),
            confidence=0.92,
            trigger_category=TriggerCategory.POSITIVE,
        )
        assert sig.confidence == 0.92
        assert sig.trigger_category == TriggerCategory.POSITIVE

    def test_confidence_must_be_0_to_1(self):
        with pytest.raises(ValidationError):
            NormalizedSignalOut(
                id=uuid.uuid4(),
                signal_type=SignalType.SOC2_ANNOUNCED,
                evidence_kind=EvidenceKind.TEXT_SPAN,
                observed_at=datetime.now(timezone.utc),
                confidence=1.5,
            )

    def test_negative_confidence_rejected(self):
        with pytest.raises(ValidationError):
            NormalizedSignalOut(
                id=uuid.uuid4(),
                signal_type=SignalType.SOC2_ANNOUNCED,
                evidence_kind=EvidenceKind.TEXT_SPAN,
                observed_at=datetime.now(timezone.utc),
                confidence=-0.1,
            )


class TestSignalFilter:
    def test_default_limits(self):
        f = SignalFilter()
        assert f.limit == 50
        assert f.offset == 0

    def test_max_limit_enforced(self):
        with pytest.raises(ValidationError):
            SignalFilter(limit=500)

    def test_filter_with_types(self):
        f = SignalFilter(
            signal_types=[SignalType.SOC2_ANNOUNCED, SignalType.FUNDING_ROUND],
            min_confidence=0.5,
            max_freshness_days=30,
        )
        assert len(f.signal_types) == 2
        assert f.min_confidence == 0.5
