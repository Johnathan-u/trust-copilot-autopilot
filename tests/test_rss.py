"""SIE-106: RSS ingest tests."""

import pytest

from workers.discovery.rss_ingest import FeedItem, dedupe_items, _item_hash


class TestItemHash:
    def test_same_inputs_same_hash(self):
        assert _item_hash("Title", "https://a.com") == _item_hash("Title", "https://a.com")

    def test_different_inputs_different_hash(self):
        assert _item_hash("A", "https://a.com") != _item_hash("B", "https://a.com")


class TestDedupe:
    def test_removes_duplicates(self):
        items = [
            FeedItem(guid="1", title="A", url="https://a.com", content_hash="h1"),
            FeedItem(guid="2", title="B", url="https://b.com", content_hash="h2"),
            FeedItem(guid="3", title="A", url="https://a.com", content_hash="h1"),
        ]
        seen: set[str] = set()
        unique = dedupe_items(items, seen)
        assert len(unique) == 2

    def test_respects_existing_seen(self):
        items = [
            FeedItem(guid="1", title="A", url="https://a.com", content_hash="h1"),
        ]
        seen = {"h1"}
        unique = dedupe_items(items, seen)
        assert len(unique) == 0

    def test_empty_list(self):
        unique = dedupe_items([], set())
        assert unique == []

    def test_all_unique(self):
        items = [
            FeedItem(guid="1", title="A", url="https://a.com", content_hash="h1"),
            FeedItem(guid="2", title="B", url="https://b.com", content_hash="h2"),
            FeedItem(guid="3", title="C", url="https://c.com", content_hash="h3"),
        ]
        seen: set[str] = set()
        unique = dedupe_items(items, seen)
        assert len(unique) == 3
