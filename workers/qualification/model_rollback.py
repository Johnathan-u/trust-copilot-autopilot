"""SIE-606: Model rollback and safe fallback — config-driven version
selection with instant rollback to deterministic scoring."""

from dataclasses import dataclass, field
from typing import Optional

from workers.qualification.ranking_model import (
    ModelRegistry, DeterministicRanker, FeatureVector, ModelArtifact,
)


@dataclass
class ModelConfig:
    active_version: Optional[str] = None
    use_learned_ranker: bool = False
    fallback_on_error: bool = True
    shadow_mode: bool = False


class ModelSelector:
    def __init__(self, registry: ModelRegistry) -> None:
        self._registry = registry
        self._config = ModelConfig()
        self._fallback = DeterministicRanker()
        self._rollback_log: list[dict] = []

    @property
    def config(self) -> ModelConfig:
        return self._config

    def activate_model(self, version: str) -> bool:
        if self._registry.activate(version):
            self._config.active_version = version
            self._config.use_learned_ranker = True
            self._rollback_log.append({
                "action": "activate",
                "version": version,
            })
            return True
        return False

    def rollback(self) -> None:
        self._registry.rollback_to_deterministic()
        self._config.active_version = None
        self._config.use_learned_ranker = False
        self._rollback_log.append({"action": "rollback_to_deterministic"})

    def score(self, fv: FeatureVector) -> tuple[float, str]:
        if self._config.use_learned_ranker and self._config.active_version:
            try:
                return self._registry.score(fv)
            except Exception:
                if self._config.fallback_on_error:
                    return self._fallback.score(fv), "deterministic_fallback"
                raise
        return self._fallback.score(fv), "deterministic"

    def is_deterministic(self) -> bool:
        return not self._config.use_learned_ranker

    def rollback_history(self) -> list[dict]:
        return list(self._rollback_log)
