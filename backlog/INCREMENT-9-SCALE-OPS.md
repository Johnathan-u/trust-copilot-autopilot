# Increment 9 — Scale, ops & quality hardening

**Goal:** Scale discovery toward 1M/day candidate throughput, add operator dashboards, guardrails, and incident recovery tools.

**Exit criteria:** Discovery processes high volume reliably; quality regressions are measurable in CI; operators can pause, inspect, and replay safely; dashboards show lane health and conversion funnels.

**Tickets:** 8

---

## SIE-701 — Build source health dashboard

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-101, SIE-108 |
| **Status** | `backlog` |

### Why this exists

At high discovery scale, source quality decay silently kills lead quality if left invisible. Operators need per-source health metrics.

### Scope

Show which sources are healthy, stale, noisy, blocked, or failing.

### Acceptance criteria

- [ ] Dashboard/API shows fetch success rate, parse success rate, duplicate rate, and fresh-signal yield per source

### Cursor brief

Create an internal API and simple UI for source health metrics. Focus on fetch success, parse success, duplicate ratio, fresh-signal yield, and last good crawl timestamp.

---

## SIE-702 — Add account conflict detector

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-405, SIE-406 |
| **Status** | `backlog` |

### Why this exists

The system must not generate competing outreach narratives for the same company or contact multiple roles with conflicting messages.

### Scope

Prevent competing narratives and conflicting outreach per account.

### Acceptance criteria

- [ ] Only one active contact narrative exists per account at a time
- [ ] Conflicts are logged and suppressed automatically

### Cursor brief

Implement an account conflict detector that checks for multiple active strategies, multiple target roles, or contradictory narratives. Block duplicate/conflicting plans and emit reason codes.

---

## SIE-703 — Add large-scale raw event store option

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-101, SIE-108, SIE-601 |
| **New tech** | **ClickHouse** (optional — only when raw event volume outgrows PostgreSQL) |
| **Status** | `backlog` |

### Why this exists

Discovery at very high scale may produce too many raw fetch and signal events for PostgreSQL alone. An analytics store decouples telemetry from canonical state.

### Scope

Add an optional analytics/event store for high-volume append-only telemetry while keeping canonical account state in PostgreSQL.

### Acceptance criteria

- [ ] Raw events can be mirrored into ClickHouse
- [ ] Canonical decisions stay in Postgres
- [ ] Feature parity is documented for when to enable this path

### Cursor brief

Add an optional ClickHouse sink for high-volume raw crawl and outcome events. Keep Postgres as the source of truth for account state and decisions. Gate this path behind config so local/dev can ignore it.

---

## SIE-704 — Add discovery throughput controls for 1M/day candidate processing

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-101, SIE-108, SIE-203, SIE-703 |
| **Status** | `backlog` |

### Why this exists

The 1M/day target applies to discovery candidate processing, not email sends. The system needs backpressure, budgets, and visibility at this scale.

### Scope

System-level controls for high discovery throughput: source budgets, domain concurrency caps, account reprocessing limits, and queue-level backpressure.

### Acceptance criteria

- [ ] Backpressure exists
- [ ] Queues cannot explode unchecked
- [ ] Discovery throughput metrics and per-stage latency are visible

### Cursor brief

Implement throughput governors across schedulers and workers. Add per-source budgets, per-domain concurrency caps, queue depth alarms, and max reprocess counts. Clarify in docs that this is discovery scale, not outreach scale.

---

## SCALE-403 — Build embeddings and account memory index

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-204 |
| **Status** | `backlog` |

### Why this exists

High-quality follow-up requires long-lived memory of what was seen, sent, replied, and delivered.

### Scope

Store signal snippets, briefs, replies, and proof summaries in pgvector for retrieval by account and campaign context.

### Acceptance criteria

- [ ] Message composer and reply planner can retrieve the most relevant grounded facts from memory within a bounded token budget

### Cursor brief

Create vectorized memory tables for signal evidence, research briefs, cleaned replies, and proof summaries. Add retrieval APIs that return top-k grounded snippets by account and use case. Keep this memory read-only for generation; policy decisions should continue to rely on deterministic fields.

---

## EVAL-405 — Add message guardrails and contradiction detection

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | MSG-203, SIE-604 |
| **Status** | `backlog` |

### Why this exists

The fastest way to destroy trust is to email a company with a false claim, stale trigger, or conflicting follow-up.

### Scope

Pre-send checks for unsupported claims, stale evidence, duplicate domains, conflicting sequences, and contradiction against prior thread context.

### Acceptance criteria

- [ ] Drafts that fail grounding or conflict checks are blocked before send and recorded as validation failures

### Cursor brief

Implement pre-send validators that compare every draft against grounding facts, prior thread messages, account state, and recent sends to the same domain. Block messages that reference facts not present in evidence, use stale triggers beyond threshold, or conflict with prior outreach context.

---

## OBS-406 — Build deliverability, policy, and conversion dashboards

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Estimate** | 5 pts |
| **Depends on** | SAFE-208, BILL-305 |
| **Status** | `backlog` |

### Why this exists

A fully autonomous system still needs operator visibility into whether it is working or quietly damaging itself.

### Scope

Internal dashboards for discovery throughput, qualification rate, policy-deny rate, sends, replies, proof deliveries, conversions, bounce rate, and complaint signals.

### Acceptance criteria

- [ ] Ops can see lane health, failure hotspots, and conversion funnels by source, mailbox, and trigger type

### Cursor brief

Create internal dashboards in the web app for each lane. Include time-series charts and tabular breakdowns for discovery counts, dedupe rate, qualified rate, contact rate, reply rate, intake rate, proof delivery rate, paid rate, and safety indicators like bounces and suppressions.

---

## OPS-407 — Write incident runbooks, replay tools, and controlled backfills

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Estimate** | 3 pts |
| **Depends on** | OPS-004, SIE-704, OBS-406 |
| **Status** | `backlog` |

### Why this exists

When something goes wrong, you need to stop, inspect, and replay safely without improvising in production.

### Scope

Runbooks for bounce spikes, complaint events, webhook failures, crawl floods, duplicate sends, and stuck fulfillment jobs. Add admin replay tools with scopes.

### Acceptance criteria

- [ ] Operators can pause, inspect, and replay bounded ranges of events or jobs without creating duplicate side effects

### Cursor brief

Create admin endpoints or internal tools for pausing queues, replaying failed jobs by type and date range, and rehydrating outbox events. Add markdown runbooks in the repo for the highest-risk incidents with exact recovery steps and verification checks.
