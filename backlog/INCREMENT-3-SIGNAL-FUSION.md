# Increment 3 — Signal normalization & fusion

**Goal:** Turn raw crawl artifacts into typed signals, fuse them per account, and surface why-now timing.

**Exit criteria:** Atomic signal events are extracted with evidence spans; accounts have fused state snapshots with trigger weights, decay, and narrative summaries grounded only in cited evidence.

**Tickets:** 6  
**Replaces:** DISC-103, DISC-104

---

## SIE-201 — Extract atomic signal events from text

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-104, SIE-105, SIE-106, SIE-107 |
| **Status** | `backlog` |

### Why this exists

Raw text needs to become typed, citable signal events — SOC 2 announced, ISO 27001 mentioned, trust center launched, security role hiring, enterprise customer mention, procurement/security review mention.

### Scope

Turn chunks of text into atomic signals with evidence spans and confidence. Deterministic extractors first, LLM fallback for ambiguous cases.

### Acceptance criteria

- [ ] Extractor emits typed signals with evidence spans and confidence
- [ ] At least 12 signal types are supported
- [ ] False positive tests exist

### Cursor brief

Build deterministic extractors first, then allow an LLM-backed fallback for ambiguous cases. Each normalized signal must include signal_type, evidence_text, evidence_url, observed_at, and confidence.

---

## SIE-202 — Create trigger taxonomy and scoring rules

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-201 |
| **Status** | `backlog` |

### Why this exists

The system needs a versioned definition of which normalized signals count as positive triggers, supporting context, or negative signals, with baseline weights.

### Scope

Define signal-to-bucket mappings and baseline weights so the system can reason consistently before learned models exist.

### Acceptance criteria

- [ ] Taxonomy file exists
- [ ] Weights are versioned
- [ ] Every signal maps to positive/supporting/negative buckets
- [ ] Tests cover expected weights

### Cursor brief

Create a versioned trigger taxonomy in code or config. Map each signal type to category, base weight, decay half-life, and explanation text. Add tests for representative signal combinations.

---

## SIE-203 — Build account-level signal fusion worker

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-201, SIE-202, SIE-003 |
| **Status** | `backlog` |

### Why this exists

Individual signals are noise. The fusion worker combines all recent signals for one account into a coherent state: what happened, when, confidence, and whether the account likely has live trust-review pain.

### Scope

Combine all recent signals for one account into a coherent state. Handle conflicting signals, decay stale ones, and store supporting evidence IDs.

### Acceptance criteria

- [ ] Fusion worker outputs account feature snapshot
- [ ] Conflicting signals are handled
- [ ] Stale signals decay
- [ ] Supporting evidence IDs are stored

### Cursor brief

Implement an account fusion worker that reads recent normalized signals, applies taxonomy weights and decay, and writes a fused_state snapshot containing top triggers, negatives, freshness, and evidence references.

---

## SIE-204 — Generate account narrative summary

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-203 |
| **Status** | `backlog` |

### Why this exists

Every downstream agent — message composer, reply planner, fulfillment bridge — needs a compact memory object that explains what is happening at the company. This narrative replaces DISC-107's "research brief" with a stricter grounding contract.

### Scope

Produce a one-paragraph internal narrative grounded only in supplied facts. No hallucinated claims.

### Acceptance criteria

- [ ] Narrative only cites existing evidence
- [ ] No unsupported claims
- [ ] Summary is stored with referenced evidence IDs

### Cursor brief

Create a narrative generator that takes fused signals and composes a concise summary grounded only in supplied facts. Store the narrative plus cited evidence IDs and reject outputs that mention uncited claims.

---

## SIE-205 — Add temporal decay and why-now freshness scoring

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-202, SIE-203 |
| **Status** | `backlog` |

### Why this exists

Timing matters. A trust page added last week should matter more than one added last year. Every positive signal needs a half-life and every account needs a why-now score.

### Scope

Model timing explicitly with configurable decay functions and why-now scoring.

### Acceptance criteria

- [ ] Decay functions are implemented
- [ ] why_now_score exists on account snapshots
- [ ] Tests cover hot vs stale examples

### Cursor brief

Implement signal half-life decay utilities and compute why_now_score per account. Make decay configurable by signal type and add tests for fresh, warm, and stale trigger combinations.

---

## SIE-206 — Add negative-signal detector

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-201, SIE-202 |
| **Status** | `backlog` |

### Why this exists

Negative signals — competitor already in place, too small, too large, MSP mismatch, stale announcements — should reduce or block outreach. Without them, quality degrades silently.

### Scope

Detect signals that should reduce or block outreach quality. Store them so contact decisions can explain which negatives suppressed outreach.

### Acceptance criteria

- [ ] Negative signals are stored and affect fused state
- [ ] Contact decisions can explain which negatives suppressed outreach

### Cursor brief

Implement negative signal extraction and weighting. Support competitor-already-in-place hints, tiny company heuristics, enterprise-too-large heuristics, and stale/duplicate announcement detection with reason codes.
