import enum


class AccountState(str, enum.Enum):
    RAW_SIGNAL = "raw_signal"
    CANDIDATE_ACCOUNT = "candidate_account"
    QUALIFIED_ACCOUNT = "qualified_account"
    CONTACTABLE = "contactable"
    CONTACTED = "contacted"
    REPLIED = "replied"
    INTAKE_OPEN = "intake_open"
    UPLOADED = "uploaded"
    FULFILLED = "fulfilled"
    OFFER_SENT = "offer_sent"
    PAID = "paid"
    ACTIVATED = "activated"
    SNOOZED = "snoozed"
    SUPPRESSED = "suppressed"
    BLOCKED = "blocked"


VALID_TRANSITIONS: dict[AccountState, list[AccountState]] = {
    AccountState.RAW_SIGNAL: [AccountState.CANDIDATE_ACCOUNT, AccountState.BLOCKED],
    AccountState.CANDIDATE_ACCOUNT: [
        AccountState.QUALIFIED_ACCOUNT,
        AccountState.SNOOZED,
        AccountState.BLOCKED,
    ],
    AccountState.QUALIFIED_ACCOUNT: [
        AccountState.CONTACTABLE,
        AccountState.SNOOZED,
        AccountState.SUPPRESSED,
        AccountState.BLOCKED,
    ],
    AccountState.CONTACTABLE: [
        AccountState.CONTACTED,
        AccountState.SNOOZED,
        AccountState.SUPPRESSED,
        AccountState.BLOCKED,
    ],
    AccountState.CONTACTED: [
        AccountState.REPLIED,
        AccountState.SNOOZED,
        AccountState.SUPPRESSED,
        AccountState.BLOCKED,
    ],
    AccountState.REPLIED: [
        AccountState.INTAKE_OPEN,
        AccountState.SNOOZED,
        AccountState.SUPPRESSED,
        AccountState.BLOCKED,
    ],
    AccountState.INTAKE_OPEN: [
        AccountState.UPLOADED,
        AccountState.SNOOZED,
        AccountState.BLOCKED,
    ],
    AccountState.UPLOADED: [AccountState.FULFILLED, AccountState.BLOCKED],
    AccountState.FULFILLED: [AccountState.OFFER_SENT, AccountState.BLOCKED],
    AccountState.OFFER_SENT: [AccountState.PAID, AccountState.SNOOZED, AccountState.BLOCKED],
    AccountState.PAID: [AccountState.ACTIVATED, AccountState.BLOCKED],
    AccountState.ACTIVATED: [],
    AccountState.SNOOZED: [
        AccountState.CANDIDATE_ACCOUNT,
        AccountState.QUALIFIED_ACCOUNT,
        AccountState.CONTACTABLE,
        AccountState.BLOCKED,
    ],
    AccountState.SUPPRESSED: [],
    AccountState.BLOCKED: [],
}


class Lane(str, enum.Enum):
    DISCOVERY = "discovery"
    QUALIFICATION = "qualification"
    CONTACT = "contact"


class SignalType(str, enum.Enum):
    SOC2_ANNOUNCED = "soc2_announced"
    ISO27001_MENTIONED = "iso27001_mentioned"
    TRUST_CENTER_LAUNCHED = "trust_center_launched"
    SECURITY_HIRING = "security_hiring"
    COMPLIANCE_HIRING = "compliance_hiring"
    ENTERPRISE_CUSTOMER_MENTION = "enterprise_customer_mention"
    VENDOR_SECURITY_MENTION = "vendor_security_mention"
    FUNDING_ROUND = "funding_round"
    UPMARKET_EXPANSION = "upmarket_expansion"
    PROCUREMENT_REVIEW = "procurement_review"
    CERTIFICATION_MILESTONE = "certification_milestone"
    TRUST_PAGE_ADDED = "trust_page_added"
    NEGATIVE_COMPETITOR = "negative_competitor"
    NEGATIVE_TOO_SMALL = "negative_too_small"
    NEGATIVE_TOO_LARGE = "negative_too_large"
    NEGATIVE_STALE = "negative_stale"
    OTHER = "other"


class SourceType(str, enum.Enum):
    COMPANY_SITE = "company_site"
    TRUST_PAGE = "trust_page"
    SECURITY_PAGE = "security_page"
    CAREERS_PAGE = "careers_page"
    BLOG = "blog"
    PRESS_PAGE = "press_page"
    JOB_BOARD = "job_board"
    RSS_FEED = "rss_feed"
    NEWS = "news"


class EvidenceKind(str, enum.Enum):
    TEXT_SPAN = "text_span"
    PAGE_URL = "page_url"
    JOB_POSTING = "job_posting"
    RSS_ITEM = "rss_item"
    STRUCTURED_DATA = "structured_data"


class PolicyVerdict(str, enum.Enum):
    ALLOW = "allow"
    DENY = "deny"
    SNOOZE = "snooze"


class ReplyClassification(str, enum.Enum):
    INTERESTED = "interested"
    SEND_DETAILS = "send_details"
    REFERRAL = "referral"
    WRONG_PERSON = "wrong_person"
    NOT_NOW = "not_now"
    LEGAL_CONCERN = "legal_concern"
    UNSUBSCRIBE = "unsubscribe"
    OUT_OF_OFFICE = "out_of_office"
    ALREADY_SOLVED = "already_solved"
    UNKNOWN = "unknown"


class SuppressionReason(str, enum.Enum):
    UNSUBSCRIBE = "unsubscribe"
    LEGAL_REQUEST = "legal_request"
    HARD_BOUNCE = "hard_bounce"
    MANUAL_BLOCK = "manual_block"
    WRONG_PERSON_DO_NOT_RETRY = "wrong_person_do_not_retry"


class OutboxStatus(str, enum.Enum):
    PENDING = "pending"
    CLAIMED = "claimed"
    COMPLETED = "completed"
    FAILED = "failed"
    DEAD = "dead"


class TriggerCategory(str, enum.Enum):
    POSITIVE = "positive"
    SUPPORTING = "supporting"
    NEGATIVE = "negative"
