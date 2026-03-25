"""SIE-301: Firmographic estimator — infers company type, industry, size band,
and go-to-market motion from public evidence without paid enrichment."""

import re
from dataclasses import dataclass, field


@dataclass
class FirmographicEstimate:
    size_band: str          # "micro" | "small" | "mid" | "growth" | "enterprise"
    industry: str           # "saas" | "fintech" | "healthtech" | "devtools" | ...
    is_b2b: float           # 0.0 – 1.0
    enterprise_motion: float  # 0.0 – 1.0
    product_type: str       # "platform" | "tool" | "marketplace" | "service" | "unknown"
    confidence: float
    matched_rules: list[str] = field(default_factory=list)
    explanation: str = ""


SIZE_PATTERNS: list[tuple[str, re.Pattern, str]] = [
    ("micro",      re.compile(r"\b([1-9]|10)\s*employee", re.I), "size_micro"),
    ("small",      re.compile(r"\b(1[1-9]|[2-4]\d)\s*employee", re.I), "size_small"),
    ("mid",        re.compile(r"\b(5\d|[6-9]\d|[1-2]\d{2})\s*employee", re.I), "size_mid"),
    ("growth",     re.compile(r"\b([3-9]\d{2}|1\d{3})\s*employee", re.I), "size_growth"),
    ("enterprise", re.compile(r"\b[2-9]\d{3,}\s*employee|\b\d{2,3},\d{3}\s*employee", re.I), "size_enterprise"),
]

INDUSTRY_PATTERNS: list[tuple[str, re.Pattern, str]] = [
    ("fintech",    re.compile(r"\b(fintech|financial\s*technology|banking\s*api|payment)", re.I), "ind_fintech"),
    ("healthtech", re.compile(r"\b(healthtech|health\s*tech|hipaa|ehr|telehealth|clinical)", re.I), "ind_health"),
    ("devtools",   re.compile(r"\b(developer\s*tool|devtool|api\s*platform|sdk|infrastructure)", re.I), "ind_devtools"),
    ("cybersecurity", re.compile(r"\b(cybersecurity|threat\s*detection|endpoint|siem|xdr)", re.I), "ind_cyber"),
    ("edtech",     re.compile(r"\b(edtech|education\s*technology|e-?learning|lms)", re.I), "ind_edtech"),
    ("martech",    re.compile(r"\b(martech|marketing\s*tech|analytics\s*platform|crm)", re.I), "ind_martech"),
    ("saas",       re.compile(r"\b(saas|software\s*as\s*a\s*service|cloud\s*platform)\b", re.I), "ind_saas"),
    ("ecommerce",  re.compile(r"\b(e-?commerce|online\s*store|shopify|marketplace)", re.I), "ind_ecomm"),
]

B2B_PATTERNS = [
    (0.3, re.compile(r"\b(enterprise|b2b|business\s*customer|vendor|procurement)", re.I), "b2b_enterprise"),
    (0.2, re.compile(r"\b(api|sdk|integration|developer|platform)", re.I), "b2b_platform"),
    (-0.3, re.compile(r"\b(consumer|b2c|retail\s*customer|download\s*the\s*app)", re.I), "b2c_consumer"),
]

ENTERPRISE_MOTION_PATTERNS = [
    (0.25, re.compile(r"\b(enterprise\s*(plan|tier|grade|customer|deal))", re.I), "ent_plan"),
    (0.2, re.compile(r"\b(soc\s*2|iso\s*27001|compliance|security\s*review)", re.I), "ent_compliance"),
    (0.2, re.compile(r"\b(sales\s*team|account\s*executive|demo\s*request)", re.I), "ent_sales_team"),
    (0.15, re.compile(r"\b(custom\s*pricing|contact\s*sales|talk\s*to\s*sales)", re.I), "ent_custom_price"),
]

PRODUCT_TYPE_PATTERNS: list[tuple[str, re.Pattern, str]] = [
    ("platform", re.compile(r"\b(platform|infrastructure|cloud)", re.I), "prod_platform"),
    ("tool",     re.compile(r"\b(tool|app|widget|extension|plugin)", re.I), "prod_tool"),
    ("marketplace", re.compile(r"\b(marketplace|exchange|aggregator)", re.I), "prod_marketplace"),
    ("service",  re.compile(r"\b(consulting|agency|services|managed)", re.I), "prod_service"),
]


def estimate_firmographics(
    text: str,
    domain: str = "",
    job_titles: list[str] | None = None,
) -> FirmographicEstimate:
    combined = text
    if job_titles:
        combined += " " + " ".join(job_titles)

    rules: list[str] = []

    size_band = "unknown"
    for band, pattern, rule_id in SIZE_PATTERNS:
        if pattern.search(combined):
            size_band = band
            rules.append(rule_id)
            break

    industry = "unknown"
    for ind, pattern, rule_id in INDUSTRY_PATTERNS:
        if pattern.search(combined):
            industry = ind
            rules.append(rule_id)
            break

    b2b_score = 0.5
    for delta, pattern, rule_id in B2B_PATTERNS:
        if pattern.search(combined):
            b2b_score += delta
            rules.append(rule_id)
    b2b_score = max(0.0, min(1.0, b2b_score))

    ent_score = 0.0
    for delta, pattern, rule_id in ENTERPRISE_MOTION_PATTERNS:
        if pattern.search(combined):
            ent_score += delta
            rules.append(rule_id)
    ent_score = max(0.0, min(1.0, ent_score))

    product_type = "unknown"
    for ptype, pattern, rule_id in PRODUCT_TYPE_PATTERNS:
        if pattern.search(combined):
            product_type = ptype
            rules.append(rule_id)
            break

    confidence = min(0.3 + 0.1 * len(rules), 0.95)

    parts = []
    if size_band != "unknown":
        parts.append(f"Size: {size_band}")
    if industry != "unknown":
        parts.append(f"Industry: {industry}")
    parts.append(f"B2B likelihood: {b2b_score:.0%}")
    parts.append(f"Enterprise motion: {ent_score:.0%}")

    return FirmographicEstimate(
        size_band=size_band,
        industry=industry,
        is_b2b=round(b2b_score, 2),
        enterprise_motion=round(ent_score, 2),
        product_type=product_type,
        confidence=round(confidence, 2),
        matched_rules=rules,
        explanation="; ".join(parts),
    )
