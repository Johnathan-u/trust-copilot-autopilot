"""SIE-402: Role-to-pain buyer psychology map — versioned mapping from pain
types and company stage to buyer role priorities."""

from dataclasses import dataclass, field
from workers.qualification.pain_inference import PainType

MAP_VERSION = 1


@dataclass(frozen=True)
class BuyerPriority:
    primary_role: str
    secondary_roles: list[str]
    reasoning: str


PAIN_ROLE_MAP: dict[PainType, dict[str, BuyerPriority]] = {
    PainType.FIRST_ENTERPRISE_REVIEW: {
        "micro": BuyerPriority("founder_ceo", ["cto"],
            "At micro stage, founders own first enterprise deals and security reviews"),
        "small": BuyerPriority("cto", ["founder_ceo", "head_engineering"],
            "CTO typically drives first SOC 2 / enterprise review at small companies"),
        "mid": BuyerPriority("ciso", ["head_security", "head_compliance", "cto"],
            "Mid-size companies usually have a security or compliance lead for reviews"),
        "growth": BuyerPriority("ciso", ["head_compliance", "vp_eng"],
            "Growth stage has dedicated security leadership"),
        "enterprise": BuyerPriority("head_compliance", ["ciso", "head_it"],
            "Enterprise has specialized compliance teams"),
    },
    PainType.QUESTIONNAIRE_OVERLOAD: {
        "micro": BuyerPriority("founder_ceo", ["cto"],
            "Founders handle vendor questionnaires at early stage"),
        "small": BuyerPriority("cto", ["head_security", "head_engineering"],
            "CTO or first security hire handles questionnaire burden"),
        "mid": BuyerPriority("head_security", ["head_compliance", "ciso"],
            "Security lead owns questionnaire workflow"),
        "growth": BuyerPriority("head_compliance", ["ciso", "head_security"],
            "Compliance team absorbs questionnaire volume at scale"),
        "enterprise": BuyerPriority("head_compliance", ["ciso"],
            "Dedicated compliance ops team handles questionnaires"),
    },
    PainType.EVIDENCE_CHAOS: {
        "micro": BuyerPriority("founder_ceo", ["cto"],
            "Founders scramble to gather evidence for audits"),
        "small": BuyerPriority("cto", ["head_engineering"],
            "CTO needs evidence automation to stop manual collection"),
        "mid": BuyerPriority("head_compliance", ["ciso", "head_security"],
            "Compliance lead needs evidence management tooling"),
        "growth": BuyerPriority("head_compliance", ["ciso"],
            "Compliance team needs automated evidence workflows"),
        "enterprise": BuyerPriority("head_compliance", ["ciso"],
            "Enterprise compliance teams need evidence automation at scale"),
    },
    PainType.TRUST_CENTER_PRESSURE: {
        "micro": BuyerPriority("founder_ceo", ["cto"],
            "Founder builds trust page to close enterprise deals"),
        "small": BuyerPriority("cto", ["head_security", "head_product"],
            "CTO drives trust center as product/security concern"),
        "mid": BuyerPriority("head_security", ["ciso", "head_product"],
            "Security lead owns public trust posture"),
        "growth": BuyerPriority("ciso", ["head_security", "head_product"],
            "CISO manages public-facing security trust center"),
        "enterprise": BuyerPriority("ciso", ["head_compliance"],
            "CISO oversees trust and transparency programs"),
    },
    PainType.COMPLIANCE_SCALING: {
        "micro": BuyerPriority("founder_ceo", [],
            "Too early for compliance scaling pain at micro"),
        "small": BuyerPriority("cto", ["head_compliance"],
            "CTO feels compliance scaling pain first"),
        "mid": BuyerPriority("head_compliance", ["ciso", "vp_eng"],
            "Compliance lead drives tooling decisions for scaling"),
        "growth": BuyerPriority("head_compliance", ["ciso"],
            "Compliance team needs process automation at scale"),
        "enterprise": BuyerPriority("head_compliance", ["ciso"],
            "Enterprise compliance operations need unified platform"),
    },
    PainType.CERTIFICATION_PREP: {
        "micro": BuyerPriority("founder_ceo", ["cto"],
            "Founders drive certification decisions at micro stage"),
        "small": BuyerPriority("cto", ["founder_ceo", "head_engineering"],
            "CTO owns certification prep and audit readiness"),
        "mid": BuyerPriority("head_compliance", ["ciso", "cto"],
            "Compliance lead manages certification projects"),
        "growth": BuyerPriority("head_compliance", ["ciso"],
            "Compliance team runs certification programs"),
        "enterprise": BuyerPriority("head_compliance", ["ciso"],
            "Enterprise has dedicated certification program managers"),
    },
    PainType.VENDOR_RISK_FRICTION: {
        "micro": BuyerPriority("founder_ceo", ["cto"],
            "Founders field vendor risk requests from customers"),
        "small": BuyerPriority("cto", ["head_security"],
            "CTO manages vendor risk responses"),
        "mid": BuyerPriority("head_security", ["head_compliance"],
            "Security lead handles vendor risk program"),
        "growth": BuyerPriority("head_compliance", ["ciso", "head_security"],
            "Compliance team owns third-party risk management"),
        "enterprise": BuyerPriority("head_compliance", ["ciso"],
            "Enterprise vendor risk managed by dedicated team"),
    },
}


def get_buyer_priority(
    pain_type: PainType,
    size_band: str,
) -> BuyerPriority:
    stage_map = PAIN_ROLE_MAP.get(pain_type)
    if not stage_map:
        return BuyerPriority("founder_ceo", ["cto"],
            f"No specific role map for {pain_type.value}; defaulting to founder/CTO")

    priority = stage_map.get(size_band)
    if not priority:
        priority = stage_map.get("small", stage_map.get("mid"))
    if not priority:
        return BuyerPriority("founder_ceo", ["cto"],
            f"No stage match for {size_band}; defaulting to founder/CTO")

    return priority


def explain_buyer_choice(
    pain_type: PainType,
    size_band: str,
    chosen_role: str,
) -> str:
    bp = get_buyer_priority(pain_type, size_band)
    if chosen_role == bp.primary_role:
        return f"Primary buyer for {pain_type.value} at {size_band} stage: {bp.reasoning}"
    if chosen_role in bp.secondary_roles:
        rank = bp.secondary_roles.index(chosen_role) + 2
        return f"#{rank} fallback for {pain_type.value} at {size_band}: primary is {bp.primary_role}"
    return f"{chosen_role} is not in the buyer map for {pain_type.value}/{size_band}"
