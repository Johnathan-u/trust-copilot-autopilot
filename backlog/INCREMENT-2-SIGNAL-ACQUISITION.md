# Increment 2 — Signal acquisition

**Goal:** Build the multi-source crawl infrastructure that feeds the entire intelligence layer.

**Exit criteria:** At least three source families (company sites, job boards, RSS/news) emit normalized raw signals into a shared pipeline with robots compliance, rate limits, JS rendering, and content extraction.

**Tickets:** 8  
**Replaces:** DISC-101, DISC-102

---

## SIE-101 — Build source registry and crawl scheduler

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-001, SIE-005, ARC-001 |
| **Status** | `backlog` |

### Why this exists

You need a uniform way to ingest signals from search, company sites, job boards, news pages, and public forums. A registry makes sources visible and a scheduler makes them reliable.

### Scope

Create a registry of public source types and scheduling rules: company site, trust page, security page, careers page, blog, press page, job boards, and RSS/news feeds. Scheduler should support recrawl intervals and per-source budgets.

### Acceptance criteria

- [ ] Registry table exists
- [ ] Scheduler emits crawl jobs with priority and freshness metadata
- [ ] Tests cover backoff and recrawl logic

### Cursor brief

Implement a source_registry table and a scheduler worker that emits crawl jobs based on priority, freshness, and source health. Include first_seen_at, last_crawled_at, next_crawl_at, active flag, and per-source rate budget.

---

## SIE-102 — Add robots-aware HTML fetcher

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-101 |
| **Status** | `backlog` |

### Why this exists

The default static crawler must be respectful: robots compliance, canonical URLs, redirect handling, conditional requests, content hashing, and retry/backoff.

### Scope

Build the default crawler for static pages with full HTTP compliance.

### Acceptance criteria

- [ ] Fetcher handles 200/301/304/429 cleanly
- [ ] Canonical URL is stored
- [ ] Duplicate fetches are avoided with ETag/hash checks

### Cursor brief

Create an async fetch worker using httpx. Respect robots.txt and crawl-delay where practical, follow redirects safely, store response metadata, and avoid refetching unchanged pages using ETag/Last-Modified/hash.

---

## SIE-103 — Add Playwright renderer for JS-heavy pages

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-101 |
| **New tech** | **Playwright** (required) |
| **Status** | `backlog` |

### Why this exists

Some targets render trust pages, team pages, or careers content client-side. Static fetch returns empty shells for these.

### Scope

Add a secondary fetch path using Playwright only when static fetch is insufficient. Pool browser contexts for efficiency.

### Acceptance criteria

- [ ] Renderer fallback works for known JS-heavy pages
- [ ] Browser contexts are pooled
- [ ] Rendered HTML is stored with provenance that it came from Playwright

### Cursor brief

Add a Playwright-based renderer worker behind a feature flag. Only invoke it when static fetch lacks meaningful text or page type requires JS. Pool browsers, set sane timeouts, and persist rendered HTML plus render_reason.

---

## SIE-104 — Add HTML-to-text extraction pipeline

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-102, SIE-103 |
| **New tech** | **Trafilatura** (required) |
| **Status** | `backlog` |

### Why this exists

Downstream signal extraction needs clean text blocks with headings, links, and section boundaries — not raw HTML markup.

### Scope

Normalize fetched HTML into clean text blocks with section titles and source spans so later signals can cite evidence.

### Acceptance criteria

- [ ] Text extraction is deterministic
- [ ] Boilerplate is reduced
- [ ] Extracted chunks preserve section titles and source spans

### Cursor brief

Integrate Trafilatura for readable text extraction. Keep fallback extraction for edge cases. Persist chunks with section_title, chunk_index, source_url, and character offsets so later signals can cite evidence.

---

## SIE-105 — Add job-board adapters

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-101, SIE-104 |
| **Status** | `backlog` |

### Why this exists

Hiring signals — especially security, compliance, and GRC roles — are strong indicators of trust-review pain. Hosted job boards expose this data publicly.

### Scope

Ingest openings from common hosted job boards such as Greenhouse, Lever, and Ashby. Normalize role title, department, location, and opening URL.

### Acceptance criteria

- [ ] At least 3 hosted job board adapters work
- [ ] Openings are deduped by canonical job ID
- [ ] Security/compliance roles are identifiable downstream

### Cursor brief

Build separate adapters for Greenhouse, Lever, and Ashby public endpoints/pages. Normalize jobs into a shared schema and publish raw signals with job_title, department, seniority hints, and canonical URL.

---

## SIE-106 — Add RSS and news/press ingest adapters

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-101 |
| **Status** | `backlog` |

### Why this exists

Company press feeds, blog RSS feeds, and public news references indicate milestones like moving upmarket, certifications, or new customer wins.

### Scope

Ingest company press feeds, blog RSS feeds, and public news references that can indicate triggers.

### Acceptance criteria

- [ ] RSS parser works
- [ ] Items are deduped by GUID/URL/title hash
- [ ] Press/news items flow into raw_signal storage

### Cursor brief

Create RSS/feed ingest adapters and a normalization layer for press/news posts. Store feed metadata, detect duplicates, and emit raw signals with publish date, title, summary, and URL.

---

## SIE-107 — Build page-type classifier

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-104 |
| **Status** | `backlog` |

### Why this exists

Targeted extraction rules need to know what kind of page they're looking at: trust, security, careers, team, pricing, blog, press, docs, or generic.

### Scope

Classify fetched pages into page types so downstream logic can apply targeted extraction rules.

### Acceptance criteria

- [ ] Classifier assigns page_type with confidence
- [ ] Routing rules exist for at least 8 page types
- [ ] Tests cover common URL and content patterns

### Cursor brief

Implement a deterministic first-pass page classifier using URL patterns, titles, headings, and keyword rules. Return page_type, confidence, and matched_rule_ids so extraction workers can branch cleanly.

---

## SIE-108 — Add freshness, dedupe, and crawl-budget controls

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-101, SIE-102, SIE-106 |
| **Status** | `backlog` |

### Why this exists

Prevent waste by deduping content, skipping stale pages, and applying per-domain and per-source crawl budgets. Critical once discovery scale increases.

### Scope

Dedupe content, skip stale pages, and apply per-domain and per-source crawl budgets. Emit metrics for skip reasons.

### Acceptance criteria

- [ ] Duplicate pages are suppressed
- [ ] Stale pages are downgraded
- [ ] Domain budgets are enforced
- [ ] Metrics exist for skipped vs fetched pages

### Cursor brief

Add dedupe by canonical URL + content hash, freshness scoring by observed dates, and per-domain budget enforcement. Emit counters for fetched, skipped-stale, skipped-duplicate, skipped-budget, and retried.
