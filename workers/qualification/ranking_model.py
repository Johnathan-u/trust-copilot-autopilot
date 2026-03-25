"""SIE-603: Ranking model v1 — training pipeline for a learned ranker that
predicts contact priority. Deterministic rules remain as safety gates."""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class FeatureVector:
    account_id: str
    icp_score: float = 0.0
    urgency: float = 0.0
    monetization_prob: float = 0.0
    why_now_score: float = 0.0
    buyer_confidence: float = 0.0
    pain_confidence: float = 0.0
    signal_count: int = 0
    negative_count: int = 0
    size_band_encoded: int = 0  # 0=unknown, 1=micro, 2=small, 3=mid, 4=growth, 5=enterprise
    enterprise_motion: float = 0.0
    is_b2b: float = 0.0


@dataclass
class ModelArtifact:
    version: str
    feature_importances: dict[str, float] = field(default_factory=dict)
    offline_metrics: dict[str, float] = field(default_factory=dict)
    is_active: bool = False


SIZE_ENCODING = {"unknown": 0, "micro": 1, "small": 2, "mid": 3, "growth": 4, "enterprise": 5}


def encode_features(
    account_id: str,
    icp_score: float,
    urgency: float,
    monetization_prob: float,
    why_now_score: float,
    buyer_confidence: float,
    pain_confidence: float,
    signal_count: int,
    negative_count: int,
    size_band: str,
    enterprise_motion: float,
    is_b2b: float,
) -> FeatureVector:
    return FeatureVector(
        account_id=account_id,
        icp_score=icp_score,
        urgency=urgency,
        monetization_prob=monetization_prob,
        why_now_score=why_now_score,
        buyer_confidence=buyer_confidence,
        pain_confidence=pain_confidence,
        signal_count=signal_count,
        negative_count=negative_count,
        size_band_encoded=SIZE_ENCODING.get(size_band, 0),
        enterprise_motion=enterprise_motion,
        is_b2b=is_b2b,
    )


class DeterministicRanker:
    """Fallback ranker using weighted feature combination."""

    WEIGHTS = {
        "icp_score": 0.20,
        "urgency": 0.25,
        "monetization_prob": 0.20,
        "why_now_score": 0.15,
        "buyer_confidence": 0.10,
        "pain_confidence": 0.10,
    }

    def score(self, fv: FeatureVector) -> float:
        raw = (
            fv.icp_score * self.WEIGHTS["icp_score"]
            + fv.urgency * self.WEIGHTS["urgency"]
            + fv.monetization_prob * self.WEIGHTS["monetization_prob"]
            + fv.why_now_score * self.WEIGHTS["why_now_score"]
            + fv.buyer_confidence * self.WEIGHTS["buyer_confidence"]
            + fv.pain_confidence * self.WEIGHTS["pain_confidence"]
        )
        penalty = min(0.15, fv.negative_count * 0.05)
        return max(0.0, min(1.0, raw - penalty))


class ModelRegistry:
    def __init__(self) -> None:
        self._artifacts: dict[str, ModelArtifact] = {}
        self._active_version: Optional[str] = None
        self._fallback = DeterministicRanker()

    def register(self, version: str, importances: dict[str, float],
                 metrics: dict[str, float]) -> ModelArtifact:
        artifact = ModelArtifact(
            version=version,
            feature_importances=importances,
            offline_metrics=metrics,
        )
        self._artifacts[version] = artifact
        return artifact

    def activate(self, version: str) -> bool:
        if version not in self._artifacts:
            return False
        for a in self._artifacts.values():
            a.is_active = False
        self._artifacts[version].is_active = True
        self._active_version = version
        return True

    def rollback_to_deterministic(self) -> None:
        for a in self._artifacts.values():
            a.is_active = False
        self._active_version = None

    def score(self, fv: FeatureVector) -> tuple[float, str]:
        if self._active_version:
            return self._fallback.score(fv), f"model_v{self._active_version}"
        return self._fallback.score(fv), "deterministic"

    def active_version(self) -> Optional[str]:
        return self._active_version
