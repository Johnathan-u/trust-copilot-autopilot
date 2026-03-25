"""SIE-104: HTML-to-text extraction pipeline using Trafilatura with fallback."""

import re
from dataclasses import dataclass, field

try:
    import trafilatura
    HAS_TRAFILATURA = True
except ImportError:
    HAS_TRAFILATURA = False

try:
    from lxml import html as lxml_html
    HAS_LXML = True
except ImportError:
    HAS_LXML = False


@dataclass
class TextChunk:
    section_title: str | None
    text: str
    chunk_index: int
    char_offset_start: int
    char_offset_end: int
    extraction_method: str


@dataclass
class ExtractionResult:
    url: str
    chunks: list[TextChunk] = field(default_factory=list)
    full_text: str = ""
    method: str = "trafilatura"
    error: str | None = None


def extract_text(html: str, url: str = "") -> ExtractionResult:
    if HAS_TRAFILATURA:
        return _trafilatura_extract(html, url)
    if HAS_LXML:
        return _fallback_extract(html, url)
    return ExtractionResult(url=url, error="no_extraction_library_available")


def _trafilatura_extract(html: str, url: str) -> ExtractionResult:
    text = trafilatura.extract(
        html,
        include_comments=False,
        include_tables=True,
        deduplicate=True,
        favor_recall=True,
        url=url,
    )

    if not text or len(text.strip()) < 50:
        if HAS_LXML:
            return _fallback_extract(html, url)
        return ExtractionResult(url=url, full_text=text or "", method="trafilatura")

    chunks = _split_into_chunks(text, method="trafilatura")
    return ExtractionResult(url=url, chunks=chunks, full_text=text, method="trafilatura")


def _fallback_extract(html: str, url: str) -> ExtractionResult:
    try:
        tree = lxml_html.fromstring(html)
    except Exception as e:
        return ExtractionResult(url=url, error=f"lxml_parse_error: {e}")

    for tag in tree.iter("script", "style", "noscript", "nav", "footer", "header"):
        tag.getparent().remove(tag)

    text = tree.text_content()
    text = re.sub(r"\n{3,}", "\n\n", text).strip()

    if not text:
        return ExtractionResult(url=url, method="fallback")

    chunks = _split_into_chunks(text, method="fallback")
    return ExtractionResult(url=url, chunks=chunks, full_text=text, method="fallback")


def _split_into_chunks(
    text: str, method: str, max_chunk_chars: int = 2000
) -> list[TextChunk]:
    paragraphs = re.split(r"\n{2,}", text)
    chunks: list[TextChunk] = []
    current_section: str | None = None
    current_text_parts: list[str] = []
    offset = 0

    def flush():
        nonlocal current_text_parts, offset
        if not current_text_parts:
            return
        joined = "\n\n".join(current_text_parts)
        start = offset
        end = start + len(joined)
        chunks.append(TextChunk(
            section_title=current_section,
            text=joined,
            chunk_index=len(chunks),
            char_offset_start=start,
            char_offset_end=end,
            extraction_method=method,
        ))
        offset = end
        current_text_parts = []

    for para in paragraphs:
        stripped = para.strip()
        if not stripped:
            continue

        is_heading = (
            len(stripped) < 120
            and not stripped.endswith(".")
            and stripped[0].isupper()
            and "\n" not in stripped
        )

        if is_heading and current_text_parts:
            flush()
            current_section = stripped
        elif is_heading and not current_text_parts:
            current_section = stripped
        else:
            current_text_parts.append(stripped)
            total = sum(len(p) for p in current_text_parts)
            if total >= max_chunk_chars:
                flush()

    flush()
    return chunks
