# Increment 5 — Discovery scale and quality hardening

**Goal:** Scale discovery toward 1M/day candidate throughput while improving quality, observability, and recovery.

**Exit criteria:** Discovery can process very high volume, quality regressions are measurable, and operators can pause/replay safely.

**Tickets:** 7

---

## SCALE-401 — Shard discovery queue and URL frontier for 1M/day candidate throughput

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 8 pts |
| **Depends on** | DISC-102 |
| **Status** | `backlog` |

### Why this exists

The 1M/day goal belongs in discovery throughput, not raw outbound volume.

### Scope

Partition URL frontier and fetch workers by hash/domain shard, add lease-based claims, and support horizontal worker scaling.

### Acceptance criteria

- [ ] Load tests show the discovery lane can process the target number of candidate pages/events per day without queue starvation or duplicate fetch storms

### Cursor brief

Refactor the frontier to support sharding by root domain or URL hash. Add shard-aware workers, lease-based claims, dead-letter queues, and replay-safe fetch state. Produce a synthetic load test that simulates 1M candidate URLs or signal events per day.

---

## SCALE-402 — Add change detection and content fingerprinting

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | DISC-102 |
| **Status** | `backlog` |

### Why this exists

At scale, repeatedly processing unchanged pages is wasteful and lowers freshness quality.

### Scope

Hash pages, segment content blocks, detect meaningful changes, and only re-run extraction when the changed block overlaps trust-review trigger areas.

### Acceptance criteria

- [ ] Unchanged pages are skipped reliably
- [ ] Change logs show what changed and why reprocessing did or did not occur

### Cursor brief

Implement document-level and block-level fingerprints. Compare new fetches to prior versions and store structured diffs. Add a decision layer that re-enqueues extraction only when changes affect high-signal blocks like security pages, press releases, careers pages, or vendor-assurance content.

---

## SCALE-403 — Build embeddings and account memory index

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Estimate** | 5 pts |
| **Depends on** | DISC-107 |
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

## EVAL-404 — Create golden datasets and offline replay harness

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 8 pts |
| **Depends on** | DISC-103, MSG-203, REPLY-207 |
| **Status** | `backlog` |

### Why this exists

You cannot claim high intelligence without a repeatable way to measure extraction, scoring, messaging, and reply handling quality.

### Scope

Curate labeled examples for triggers, ICP fit, buyer resolution, policy decisions, draft quality, and reply classification. Add replayable evaluation jobs.

### Acceptance criteria

- [ ] A single command runs offline evaluations and produces metrics for precision, recall, false-positive rate, and unsafe-send rate
- [ ] Regressions fail CI

### Cursor brief

Build an `evals` package with golden JSONL fixtures and a replay runner. Include evaluation tasks for signal extraction, account scoring, buyer resolution, policy decisions, draft grounding, and reply classification. Output precision/recall plus domain-specific metrics like stale-trigger rate and unsupported-claim rate.

---

## EVAL-405 — Add message guardrails and contradiction detection

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | MSG-203, EVAL-404 |
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
| **Depends on** | OPS-004, SCALE-401, OBS-406 |
| **Status** | `backlog` |

### Why this exists

When something goes wrong, you need to stop, inspect, and replay safely without improvising in production.

### Scope

Runbooks for bounce spikes, complaint events, webhook failures, crawl floods, duplicate sends, and stuck fulfillment jobs. Add admin replay tools with scopes.

### Acceptance criteria

- [ ] Operators can pause, inspect, and replay bounded ranges of events or jobs without creating duplicate side effects

### Cursor brief

Create admin endpoints or internal tools for pausing queues, replaying failed jobs by type and date range, and rehydrating outbox events. Add markdown runbooks in the repo for the highest-risk incidents with exact recovery steps and verification checks.
