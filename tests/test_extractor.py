"""SIE-104: HTML-to-text extraction tests."""

import pytest

from workers.discovery.extractor import extract_text, _split_into_chunks


class TestExtractText:
    def test_basic_html_extraction(self):
        html = """
        <html><body>
        <h1>Trust Center</h1>
        <p>We are SOC 2 Type II certified. Our security program covers all aspects of data protection.</p>
        <p>We undergo annual penetration tests conducted by independent third parties.</p>
        </body></html>
        """
        result = extract_text(html, url="https://example.com/trust")
        assert result.full_text != ""
        assert result.method in ("trafilatura", "fallback")
        assert result.error is None

    def test_empty_html_returns_no_error(self):
        result = extract_text("<html><body></body></html>", url="https://empty.com")
        assert result.error is None

    def test_script_tags_excluded(self):
        html = "<html><body><script>var x=1;</script><p>Real content here.</p></body></html>"
        result = extract_text(html)
        assert "var x=1" not in result.full_text


class TestChunkSplitting:
    def test_single_paragraph(self):
        chunks = _split_into_chunks("Hello world, this is a test paragraph.", method="test")
        assert len(chunks) == 1
        assert chunks[0].chunk_index == 0
        assert chunks[0].text == "Hello world, this is a test paragraph."

    def test_heading_creates_section(self):
        text = "Security Overview\n\nWe take security seriously. Our platform is protected."
        chunks = _split_into_chunks(text, method="test")
        assert any(c.section_title == "Security Overview" for c in chunks)

    def test_long_text_splits_at_max(self):
        para = "Word " * 500
        text = f"Section One\n\n{para}\n\n{para}"
        chunks = _split_into_chunks(text, method="test", max_chunk_chars=1000)
        assert len(chunks) >= 2

    def test_offsets_are_non_negative(self):
        text = "Title\n\nParagraph one.\n\nParagraph two."
        chunks = _split_into_chunks(text, method="test")
        for c in chunks:
            assert c.char_offset_start >= 0
            assert c.char_offset_end >= c.char_offset_start
