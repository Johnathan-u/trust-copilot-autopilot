"""SIE-404: Competitor presence detection — detects public signs that an
account uses competitors or adjacent tools."""

import re
from dataclasses import dataclass, field


@dataclass
class CompetitorHit:
    competitor: str
    evidence_snippet: str
    evidence_url: str
    confidence: float
    effect: str         # "block" | "soften" | "reposition"
    reason: str


COMPETITORS: list[tuple[str, re.Pattern, str, str]] = [
    ("vanta",       re.compile(r"\b(vanta|powered\s*by\s*vanta|vanta\s*trust\s*center)\b", re.I),
     "block", "Vanta is a direct competitor"),
    ("drata",       re.compile(r"\b(drata|powered\s*by\s*drata)\b", re.I),
     "block", "Drata is a direct competitor"),
    ("secureframe", re.compile(r"\b(secureframe)\b", re.I),
     "block", "Secureframe is a direct competitor"),
    ("laika",       re.compile(r"\b(laika\s*compliance|laika\s*grc)\b", re.I),
     "soften", "Laika is a smaller competitor — reposition on value"),
    ("sprinto",     re.compile(r"\b(sprinto)\b", re.I),
     "soften", "Sprinto is a competitor — reposition on depth"),
    ("tugboat",     re.compile(r"\b(tugboat\s*logic)\b", re.I),
     "soften", "Tugboat Logic is a legacy competitor"),
    ("thoropass",   re.compile(r"\b(thoropass)\b", re.I),
     "soften", "Thoropass is a competitor with different positioning"),
    ("anecdotes",   re.compile(r"\b(anecdotes)\b", re.I),
     "reposition", "Anecdotes targets enterprise GRC — different segment"),
    ("oneleet",     re.compile(r"\b(oneleet)\b", re.I),
     "reposition", "Oneleet focuses on pentesting — complementary"),
    ("very_good_security", re.compile(r"\b(very\s*good\s*security)\b", re.I),
     "reposition", "VGS focuses on data security — different problem"),
]

USAGE_PATTERNS = [
    (0.15, re.compile(r"\b(already\s*(use|using|deploy)|powered\s*by|partner(ed)?\s*with|built\s*on)\b", re.I)),
    (0.10, re.compile(r"\b(integrated?\s*with|connected?\s*to|runs?\s*on)\b", re.I)),
    (-0.10, re.compile(r"\b(compet(e|itor|ition)|vs\.?|versus|compared?\s*to|alternative)\b", re.I)),
]


def detect_competitors(
    text: str,
    url: str = "",
) -> list[CompetitorHit]:
    hits: list[CompetitorHit] = []
    seen: set[str] = set()

    for comp_name, pattern, effect, reason in COMPETITORS:
        matches = list(pattern.finditer(text))
        if not matches:
            continue
        if comp_name in seen:
            continue
        seen.add(comp_name)

        m = matches[0]
        start = max(0, m.start() - 60)
        end = min(len(text), m.end() + 60)
        snippet = text[start:end].strip()

        base_confidence = 0.65
        context_window = text[max(0, m.start()-120):min(len(text), m.end()+120)]
        for delta, upattern in USAGE_PATTERNS:
            if upattern.search(context_window):
                base_confidence += delta

        base_confidence = max(0.3, min(0.95, base_confidence))

        hits.append(CompetitorHit(
            competitor=comp_name,
            evidence_snippet=snippet[:150],
            evidence_url=url,
            confidence=round(base_confidence, 2),
            effect=effect,
            reason=reason,
        ))

    hits.sort(key=lambda h: -h.confidence)
    return hits


def has_blocking_competitor(hits: list[CompetitorHit], threshold: float = 0.7) -> bool:
    return any(h.effect == "block" and h.confidence >= threshold for h in hits)


def competitor_strategy_effect(hits: list[CompetitorHit]) -> str:
    if not hits:
        return "no_competitor"
    if has_blocking_competitor(hits):
        return "block"
    effects = {h.effect for h in hits}
    if "soften" in effects:
        return "soften"
    return "reposition"
