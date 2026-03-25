"""SIE-102: Fetcher tests."""

import pytest

from workers.discovery.fetcher import _content_hash, FetchResult


class TestContentHash:
    def test_same_content_same_hash(self):
        a = _content_hash("<html>hello</html>")
        b = _content_hash("<html>hello</html>")
        assert a == b

    def test_different_content_different_hash(self):
        a = _content_hash("<html>hello</html>")
        b = _content_hash("<html>world</html>")
        assert a != b

    def test_hash_is_hex_sha256(self):
        h = _content_hash("test")
        assert len(h) == 64
        assert all(c in "0123456789abcdef" for c in h)


class TestFetchResult:
    def test_skipped_result(self):
        r = FetchResult(
            url="https://example.com",
            canonical_url="https://example.com",
            status_code=0,
            skipped=True,
            skip_reason="robots_disallowed",
        )
        assert r.skipped
        assert r.html is None

    def test_successful_result(self):
        r = FetchResult(
            url="https://example.com",
            canonical_url="https://example.com",
            status_code=200,
            html="<html>content</html>",
            content_hash="abc123",
            fetch_ms=150,
        )
        assert not r.skipped
        assert r.html is not None
        assert r.fetch_ms == 150
