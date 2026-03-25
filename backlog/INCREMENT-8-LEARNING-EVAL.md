# Increment 8 — Learning & evaluation

**Goal:** Close the feedback loop so the system learns from outcomes and can be measured, improved, and safely rolled back.

**Exit criteria:** Outcomes feed back into labeled datasets; offline evals run in CI; a learned ranker can be trained, shadow-scored, and rolled back without code changes.

**Tickets:** 6

---

## SIE-601 — Capture lead-quality outcomes

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-405, SIE-406 |
| **Status** | `backlog` |

### Why this exists

The system can only learn if it records whether its decisions were good: delivered, replied, uploaded, paid, unsubscribed, bounced, or ignored.

### Scope

Record outcomes that teach the system whether its decisions were good. Link outcomes back to account and decision versions.

### Acceptance criteria

- [ ] Outcome events are linked back to account and decision versions
- [ ] Snapshot tables can read aggregate conversion signals

### Cursor brief

Add outcome event ingestion that ties outreach and funnel results back to the originating contact decision version. Support reply, upload, payment, bounce, and unsubscribe events.

---

## SIE-602 — Build decision labeling pipeline

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-601, SIE-004 |
| **Status** | `backlog` |

### Why this exists

Supervised data for rankers should come from automated labeling of past decisions, not manual spreadsheet cleanup.

### Scope

Create labels that classify past decisions as good, neutral, bad, or unsafe. Ambiguous cases stay unlabeled.

### Acceptance criteria

- [ ] Labeling job runs automatically
- [ ] Labels are versioned
- [ ] Ambiguous cases stay unlabeled instead of forced

### Cursor brief

Implement a labeling pipeline that converts funnel outcomes plus risk events into lead-decision labels. Version the labels and keep borderline cases as uncertain for later review.

---

## SIE-603 — Train ranking model v1

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-602 |
| **New tech** | **LightGBM** (optional) |
| **Status** | `backlog` |

### Why this exists

After rule-based scoring is already working, a learned ranker can improve prioritization using historical features and labels. Deterministic rules stay as safety gates; the model only improves prioritization.

### Scope

Train a first learned ranker that predicts which accounts are most worth contacting. Deterministic rules remain safety gates.

### Acceptance criteria

- [ ] Training pipeline exists
- [ ] Model artifact is versioned
- [ ] Offline metrics are recorded
- [ ] Fallback to deterministic ranking remains available

### Cursor brief

Build a LightGBM training script over exported account features and labels. Predict contact_priority_score, store feature importances, and keep deterministic policy/risk gates outside the model.

---

## SIE-604 — Add offline evaluation suite

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-603 |
| **Status** | `backlog` |

### Why this exists

You cannot claim high intelligence without a repeatable way to measure extraction, scoring, messaging, and reply handling quality. This replaces EVAL-404 with evaluation scoped to the full intelligence pipeline.

### Scope

Evaluate rule-based and learned ranking on holdout data using precision@k, reply-rate lift, upload-rate lift, and unsafe-contact rate.

### Acceptance criteria

- [ ] Evaluation report runs from CLI
- [ ] Metrics are versioned by model/rule set
- [ ] Regression thresholds exist

### Cursor brief

Create an offline eval command that compares current and candidate rankers on historical labeled data. Report precision@k, reply lift, upload lift, payment lift proxy, and unsafe contact rate.

---

## SIE-605 — Add shadow scoring in production

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-603, SIE-604 |
| **Status** | `backlog` |

### Why this exists

Model changes must be validated against live traffic before affecting outreach. Shadow mode makes this safe.

### Scope

Run candidate scoring logic in shadow mode before it affects outreach. Compare against the live decision engine.

### Acceptance criteria

- [ ] Shadow scores are stored alongside live scores
- [ ] Diff reports exist
- [ ] No outbound behavior changes when shadow mode is enabled

### Cursor brief

Implement shadow scoring paths that compute candidate model outputs during live processing but never change contact decisions. Persist live vs shadow diffs for later analysis.

---

## SIE-606 — Add model rollback and safe fallback

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-605 |
| **New tech** | **MLflow** (optional) |
| **Status** | `backlog` |

### Why this exists

Instant rollback from a learned ranker to deterministic scoring must be one config flip, not a code incident.

### Scope

Support instant rollback. If MLflow is present, use it as registry; otherwise keep a simple local artifact/version registry.

### Acceptance criteria

- [ ] Feature flag or model version switch exists
- [ ] Rollback path is tested
- [ ] Deterministic mode remains healthy

### Cursor brief

Implement a model selection layer with config-driven version choice and rollback. If MLflow is present, use it as the registry; otherwise keep a simple local artifact/version registry.
