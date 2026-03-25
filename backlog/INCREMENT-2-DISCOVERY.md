# Increment 2 — Discovery and qualification intelligence

**Goal:** Create a high-quality signal graph and buyer resolution layer.

**Exit criteria:** The system can continuously discover, dedupe, score, and brief accounts from multiple public-source families.

**Tickets:** 7

---

## DISC-101 — Build source adapter framework and scheduler

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | ARC-001 |
| **Status** | `backlog` |

### Why this exists

You need a uniform way to ingest signals from search, company sites, job boards, news pages, and public forums.

### Scope

Define a plug-in contract for source adapters, run schedules, retries, and normalization into a common raw-signal format.

### Acceptance criteria

- [ ] At least three adapters can emit normalized raw signals into the same table/queue
- [ ] Each adapter has independent scheduling and health status

### Cursor brief

Create a source adapter interface with methods for `discover()`, `fetch()`, and `normalize()`. Implement initial adapters for search-result ingestion, company-site path discovery, and job-board pages. Normalize every raw event into fields like source, source_url, discovered_at, page_type, candidate_company_name, candidate_domain, raw_text, and extraction_hints.

---

## DISC-102 — Implement fetcher frontier with robots and per-domain rate limits

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 8 pts |
| **Depends on** | DISC-101 |
| **Status** | `backlog` |

### Why this exists

At 1M/day discovery scale, the bottleneck is not LLMs, it is respectful crawling, dedupe, and backpressure.

### Scope

URL frontier, per-domain politeness windows, robots.txt checks, conditional requests, caching, and content hashing.

### Acceptance criteria

- [ ] Fetcher respects robots policy
- [ ] Rate-limits per domain
- [ ] Dedupes repeated URLs
- [ ] Stores fetch artifacts with hash/version info

### Cursor brief

Build a fetcher worker with a Redis-backed frontier. Add per-domain concurrency and cooldown settings. Check robots rules before enqueueing fetches. Store response status, headers, final URL, canonical URL, fetched_at, content_hash, and parsed text blobs in object storage. Add support for ETag and Last-Modified so unchanged pages can be skipped.

---

## DISC-103 — Create signal extractor for trust-review pain

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 8 pts |
| **Depends on** | DISC-102 |
| **Status** | `backlog` |

### Why this exists

The moat is not generic scraping; it is extracting the specific triggers that imply questionnaire pain.

### Scope

Detect signals like SOC 2 or ISO announcements, trust-center launches, security hiring, enterprise expansion, and vendor-security mentions. Combine deterministic rules with LLM adjudication.

### Acceptance criteria

- [ ] Extractor emits structured signals with trigger_type, evidence span, confidence, freshness, and supporting URL
- [ ] Unsupported or weak triggers are discarded

### Cursor brief

Implement a rules-first extractor for known phrases and page patterns, then an LLM adjudicator that decides whether the page implies trust-review pain. Output `trigger_type`, `trigger_summary`, `evidence_quote`, `source_url`, `source_timestamp`, `freshness_days`, and `confidence`. Store the exact evidence span so later messaging can be grounded and cited.

---

## DISC-104 — Canonicalize companies and dedupe account records

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | DISC-103 |
| **Status** | `backlog` |

### Why this exists

A 1M/day discovery lane will repeatedly encounter the same company from many sources. Canonicalization is mandatory.

### Scope

Resolve domains, aliases, company names, product sites, and parent-child relationships into one account record with confidence and provenance.

### Acceptance criteria

- [ ] Duplicate source events collapse into one canonical account with linked aliases and evidence
- [ ] Conflicts are marked for quarantine, not merged blindly

### Cursor brief

Build an account resolver that uses domain as the primary key, with alias handling for product subdomains and marketing domains. Store alternate names, root domain, company URL, and merge confidence. Add a conflict queue when two existing accounts appear to match the same new entity but evidence disagrees.

---

## DISC-105 — Implement ICP score and why-now score

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | DISC-104 |
| **Status** | `backlog` |

### Why this exists

Quality is the only defense against spam complaints and low-intent outreach.

### Scope

Score company fit and trigger urgency separately, then combine them into a contact eligibility score. Include rule-based thresholds and explanation fields.

### Acceptance criteria

- [ ] Each account gets `icp_score`, `pain_score`, `freshness_score`, `contact_score`, and a natural-language explanation
- [ ] Only threshold-passing accounts move forward

### Cursor brief

Create a scoring service with clear components: company size estimate, SaaS likelihood, B2B likelihood, security maturity, trigger freshness, and commercial urgency. Persist each component score separately plus the final score and textual explanation. Add configuration-driven thresholds so policy can reject low-score accounts before buyer resolution.

---

## DISC-106 — Build buyer resolver and email-confidence model

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 8 pts |
| **Depends on** | DISC-104 |
| **Status** | `backlog` |

### Why this exists

Autonomy breaks if the wrong person gets the email. The system needs ranked buyer candidates with evidence and confidence.

### Scope

Extract likely buyers from team/about pages and public corporate pages. Rank founder, CTO, security lead, engineering leader, and compliance owner. Add email-pattern inference with confidence.

### Acceptance criteria

- [ ] Each account has ranked buyer candidates, rationale, confidence, and fallback order
- [ ] Low-confidence buyer resolution sends the account to snooze or review queues, not contact

### Cursor brief

Build a resolver that parses team pages and named-role snippets. Store candidates with `role`, `name`, `source_url`, `evidence_span`, `contact_rank`, and `confidence`. Add a pattern inference module for corporate email formats and mark whether the address is direct, inferred, generic, or unknown. Never advance accounts with unknown or unsafe recipient types.

---

## DISC-107 — Generate internal research brief and proof angle

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Estimate** | 3 pts |
| **Depends on** | DISC-105, DISC-106 |
| **Status** | `backlog` |

### Why this exists

Every message and reply needs a compact memory object so the system stays coherent across steps.

### Scope

Generate a one-page structured brief: what changed, why now, likely buyer, likely objection, proof angle, CTA, and do-not-say facts.

### Acceptance criteria

- [ ] A brief record is created for every contactable account and reused by the message composer and reply planner

### Cursor brief

Create a `research_briefs` table and a generator service that summarizes signal evidence, score explanation, likely buyer, likely objection, and recommended CTA. Include a `grounding_facts` section and a `forbidden_claims` section so downstream agents can only use verified facts.
