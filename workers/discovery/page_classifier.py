"""SIE-107: Deterministic page-type classifier using URL patterns, titles,
headings, and keyword rules. Returns page_type, confidence, and matched rules."""

import re
from dataclasses import dataclass, field
from urllib.parse import urlparse


@dataclass
class ClassificationResult:
    page_type: str
    confidence: float
    matched_rules: list[str] = field(default_factory=list)


RULES: list[tuple[str, str, re.Pattern, str]] = [
    # (page_type, match_target, pattern, rule_id)
    # URL-based rules
    ("trust_page", "url", re.compile(r"/trust\b", re.I), "url_trust"),
    ("security_page", "url", re.compile(r"/security\b", re.I), "url_security"),
    ("careers_page", "url", re.compile(r"/(careers|jobs|openings|join)\b", re.I), "url_careers"),
    ("team_page", "url", re.compile(r"/(team|about|people|leadership)\b", re.I), "url_team"),
    ("pricing_page", "url", re.compile(r"/pricing\b", re.I), "url_pricing"),
    ("blog_page", "url", re.compile(r"/(blog|posts|articles|news)\b", re.I), "url_blog"),
    ("press_page", "url", re.compile(r"/(press|newsroom|media)\b", re.I), "url_press"),
    ("docs_page", "url", re.compile(r"/(docs|documentation|help|support|guides)\b", re.I), "url_docs"),
    # Title-based rules
    ("trust_page", "title", re.compile(r"\btrust\s*(center|portal|page)?\b", re.I), "title_trust"),
    ("security_page", "title", re.compile(r"\bsecurity\b", re.I), "title_security"),
    ("careers_page", "title", re.compile(r"\b(careers|join\s*us|open\s*positions)\b", re.I), "title_careers"),
    ("press_page", "title", re.compile(r"\b(press|newsroom|in\s*the\s*news)\b", re.I), "title_press"),
    ("blog_page", "title", re.compile(r"\bblog\b", re.I), "title_blog"),
    # Content-based rules
    ("trust_page", "content", re.compile(r"\b(soc\s*2|iso\s*27001|gdpr|hipaa|penetration\s*test)\b", re.I), "content_compliance"),
    ("security_page", "content", re.compile(r"\b(vulnerability\s*disclosure|bug\s*bounty|responsible\s*disclosure)\b", re.I), "content_vuln_disc"),
    ("careers_page", "content", re.compile(r"\b(we.re\s*hiring|join\s*our\s*team|apply\s*now)\b", re.I), "content_hiring_cta"),
]

PAGE_TYPE_PRIORITY = {
    "trust_page": 10,
    "security_page": 9,
    "careers_page": 8,
    "press_page": 7,
    "team_page": 6,
    "blog_page": 5,
    "pricing_page": 4,
    "docs_page": 3,
    "generic": 0,
}


def classify_page(
    url: str,
    title: str = "",
    text_content: str = "",
) -> ClassificationResult:
    hits: dict[str, list[str]] = {}

    for page_type, target, pattern, rule_id in RULES:
        if target == "url" and pattern.search(url):
            hits.setdefault(page_type, []).append(rule_id)
        elif target == "title" and pattern.search(title):
            hits.setdefault(page_type, []).append(rule_id)
        elif target == "content" and pattern.search(text_content[:5000]):
            hits.setdefault(page_type, []).append(rule_id)

    if not hits:
        return ClassificationResult(page_type="generic", confidence=0.3, matched_rules=[])

    scored = []
    for pt, rules in hits.items():
        base_confidence = min(0.5 + 0.15 * len(rules), 0.95)
        priority = PAGE_TYPE_PRIORITY.get(pt, 0)
        scored.append((pt, base_confidence, priority, rules))

    scored.sort(key=lambda x: (x[2], x[1]), reverse=True)
    best = scored[0]

    return ClassificationResult(
        page_type=best[0],
        confidence=best[1],
        matched_rules=best[3],
    )
