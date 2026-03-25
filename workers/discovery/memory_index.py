"""SCALE-403: Account memory index — stores signal snippets, briefs, replies,
and proof summaries for retrieval by account context."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class MemoryChunk:
    account_id: str
    chunk_type: str         # "signal_evidence" | "research_brief" | "reply" | "proof_summary"
    text: str
    source_id: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    relevance_score: float = 0.0


class AccountMemoryIndex:
    """In-memory implementation; production uses pgvector for similarity search."""

    def __init__(self) -> None:
        self._chunks: list[MemoryChunk] = []

    def store(self, account_id: str, chunk_type: str, text: str,
              source_id: str = "", relevance: float = 0.5) -> MemoryChunk:
        chunk = MemoryChunk(
            account_id=account_id, chunk_type=chunk_type,
            text=text, source_id=source_id, relevance_score=relevance,
        )
        self._chunks.append(chunk)
        return chunk

    def retrieve(self, account_id: str, chunk_type: str = "",
                 top_k: int = 5) -> list[MemoryChunk]:
        results = [c for c in self._chunks if c.account_id == account_id]
        if chunk_type:
            results = [c for c in results if c.chunk_type == chunk_type]
        results.sort(key=lambda c: -c.relevance_score)
        return results[:top_k]

    def retrieve_grounded(self, account_id: str, max_tokens: int = 500,
                          top_k: int = 10) -> list[MemoryChunk]:
        candidates = self.retrieve(account_id, top_k=top_k)
        selected = []
        total_len = 0
        for c in candidates:
            chunk_tokens = len(c.text.split())
            if total_len + chunk_tokens > max_tokens:
                break
            selected.append(c)
            total_len += chunk_tokens
        return selected
