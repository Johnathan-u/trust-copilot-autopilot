"""SIE-401: Public-site buyer resolver — resolves likely buyers from company
pages, team listings, and structured clues."""

import re
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class BuyerCandidate:
    name: str
    role: str
    normalized_role: str        # "cto" | "vp_eng" | "ciso" | "head_security" | ...
    confidence: float
    source: str                 # "team_page" | "leadership" | "byline" | "structured_data"
    evidence_url: str = ""
    evidence_snippet: str = ""


ROLE_NORMALIZATION: list[tuple[str, re.Pattern]] = [
    ("founder_ceo", re.compile(r"\b(founder|co-?founder|ceo|chief\s*executive)\b", re.I)),
    ("cto", re.compile(r"\b(cto|chief\s*technology|chief\s*technical)\b", re.I)),
    ("ciso", re.compile(r"\b(ciso|chief\s*information\s*security)\b", re.I)),
    ("vp_eng", re.compile(r"\b(vp\s*(of\s*)?engineering|vice\s*president.*engineering)\b", re.I)),
    ("head_security", re.compile(r"\b(head\s*of\s*security|director.*security|security\s*lead)\b", re.I)),
    ("head_compliance", re.compile(r"\b(head\s*of\s*compliance|compliance\s*(director|lead|manager)|grc\s*(lead|manager|director))\b", re.I)),
    ("head_engineering", re.compile(r"\b(head\s*of\s*engineering|engineering\s*(director|lead))\b", re.I)),
    ("head_product", re.compile(r"\b(head\s*of\s*product|product\s*(director|vp)|vp\s*(of\s*)?product)\b", re.I)),
    ("head_it", re.compile(r"\b(head\s*of\s*it|it\s*(director|manager)|cio)\b", re.I)),
    ("devops_lead", re.compile(r"\b(devops\s*(lead|manager|director)|platform\s*engineering\s*(lead|director))\b", re.I)),
]

TITLE_PATTERN = re.compile(
    r"(?:^|\n)\s*(?P<name>[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*[,\-–—|]\s*(?P<title>[^\n]{5,80})",
)

STRUCTURED_PATTERN = re.compile(
    r'"(?:name|person)"\s*:\s*"(?P<name>[^"]+)"[^}]*"(?:title|role|jobTitle)"\s*:\s*"(?P<title>[^"]+)"',
    re.I,
)


def _normalize_role(title: str) -> Optional[str]:
    for norm, pattern in ROLE_NORMALIZATION:
        if pattern.search(title):
            return norm
    return None


def _extract_from_text(text: str, source: str, url: str = "") -> list[BuyerCandidate]:
    candidates: list[BuyerCandidate] = []
    seen_names: set[str] = set()

    for m in TITLE_PATTERN.finditer(text):
        name = m.group("name").strip()
        title = m.group("title").strip()
        if name.lower() in seen_names:
            continue
        norm = _normalize_role(title)
        if norm:
            seen_names.add(name.lower())
            candidates.append(BuyerCandidate(
                name=name, role=title, normalized_role=norm,
                confidence=0.70, source=source, evidence_url=url,
                evidence_snippet=m.group(0).strip()[:120],
            ))

    for m in STRUCTURED_PATTERN.finditer(text):
        name = m.group("name").strip()
        title = m.group("title").strip()
        if name.lower() in seen_names:
            continue
        norm = _normalize_role(title)
        if norm:
            seen_names.add(name.lower())
            candidates.append(BuyerCandidate(
                name=name, role=title, normalized_role=norm,
                confidence=0.80, source="structured_data", evidence_url=url,
                evidence_snippet=m.group(0).strip()[:120],
            ))

    return candidates


def resolve_buyers(
    page_texts: list[tuple[str, str, str]],
) -> list[BuyerCandidate]:
    """Resolve buyer candidates from page content.

    Args:
        page_texts: list of (page_text, source_type, url) tuples
            source_type: "team_page" | "leadership" | "about" | "byline"
    """
    all_candidates: list[BuyerCandidate] = []
    seen: set[str] = set()

    source_confidence_boost = {
        "team_page": 0.10,
        "leadership": 0.15,
        "about": 0.05,
        "byline": 0.0,
    }

    for text, source, url in page_texts:
        for c in _extract_from_text(text, source, url):
            key = c.name.lower()
            if key not in seen:
                boost = source_confidence_boost.get(source, 0.0)
                c.confidence = min(0.95, c.confidence + boost)
                all_candidates.append(c)
                seen.add(key)

    all_candidates.sort(key=lambda c: -c.confidence)
    return all_candidates
