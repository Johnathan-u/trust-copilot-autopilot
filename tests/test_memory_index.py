"""SCALE-403: Memory index tests."""

import pytest
from workers.discovery.memory_index import AccountMemoryIndex


class TestMemoryIndex:
    def setup_method(self):
        self.idx = AccountMemoryIndex()

    def test_store_and_retrieve(self):
        self.idx.store("acc-1", "signal_evidence", "SOC 2 Type II certified", relevance=0.9)
        results = self.idx.retrieve("acc-1")
        assert len(results) == 1
        assert "SOC 2" in results[0].text

    def test_top_k(self):
        for i in range(10):
            self.idx.store("acc-1", "signal_evidence", f"Signal {i}", relevance=i * 0.1)
        results = self.idx.retrieve("acc-1", top_k=3)
        assert len(results) == 3
        assert results[0].relevance_score >= results[1].relevance_score

    def test_filter_by_type(self):
        self.idx.store("acc-1", "signal_evidence", "Signal text")
        self.idx.store("acc-1", "reply", "Thanks for reaching out")
        results = self.idx.retrieve("acc-1", chunk_type="reply")
        assert len(results) == 1

    def test_grounded_retrieval_budget(self):
        self.idx.store("acc-1", "signal_evidence", "Short fact", relevance=0.9)
        self.idx.store("acc-1", "signal_evidence", " ".join(["word"] * 600), relevance=0.8)
        results = self.idx.retrieve_grounded("acc-1", max_tokens=100)
        assert len(results) == 1  # second chunk exceeds budget

    def test_account_isolation(self):
        self.idx.store("acc-1", "reply", "Hello from acc-1")
        self.idx.store("acc-2", "reply", "Hello from acc-2")
        results = self.idx.retrieve("acc-1")
        assert len(results) == 1
