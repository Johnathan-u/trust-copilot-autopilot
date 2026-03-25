# Increment 4 — Proof, payment, and onboarding loop

**Goal:** Turn positive replies into proof artifacts, payment, and activation without a human seller.

**Exit criteria:** A positive reply can become a paid customer and provisioned workspace end-to-end.

**Tickets:** 7

---

## INTAKE-301 — Build secure intake room with tokenized upload links

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 8 pts |
| **Depends on** | REPLY-207 |
| **Status** | `backlog` |

### Why this exists

This replaces the demo call. The intake room is the bridge from interest to proof.

### Scope

Tokenized room URLs, short trust note, upload widgets, optional NDA step, status timeline, and file retention policy.

### Acceptance criteria

- [ ] A positive reply can open an intake room automatically
- [ ] Files upload successfully to object storage and are linked to the correct account and room

### Cursor brief

Implement a Next.js intake room page backed by signed tokens rather than full user accounts. Show simple instructions, supported file types, upload progress, and status states. Persist uploads to MinIO and record file metadata, uploader context, content hash, and room linkage in Postgres.

---

## FUL-302 — Create Trust Copilot fulfillment bridge and job runner

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 8 pts |
| **Depends on** | INTAKE-301 |
| **Status** | `backlog` |

### Why this exists

The close happens when the system returns a real proof artifact, not when it books a meeting.

### Scope

When uploads arrive, create a fulfillment job, pass artifacts into Trust Copilot, poll status, capture outputs, and update account state.

### Acceptance criteria

- [ ] Upload completion triggers a job automatically
- [ ] Job state changes are persisted, retry-safe, and visible in the intake room and internal ops UI

### Cursor brief

Build a fulfillment worker that watches for upload completion, creates a `fulfillment_job`, invokes the Trust Copilot pipeline, stores run metadata, and writes back status updates. Handle retries with idempotency keys and support partial failure states like `awaiting_more_evidence` and `completed_with_gaps`.

---

## FUL-303 — Render proof pack, gap report, and proof-delivery email

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | FUL-302 |
| **Status** | `backlog` |

### Why this exists

The system needs a concrete, buyer-readable artifact that explains value without a human on a call.

### Scope

Generate a proof page and downloadable pack with answered percentage, citation coverage, evidence gaps, and next-step CTA.

### Acceptance criteria

- [ ] For each completed job, a proof artifact is created with stable URLs, access controls, and a matching delivery email
- [ ] Missing evidence is called out clearly

### Cursor brief

Build a proof renderer that takes fulfillment outputs and produces a structured artifact: summary metrics, answered questions, evidence citations, unresolved items, and suggested next steps. Add an email template for delivering the proof and linking back to the proof page and checkout.

---

## OFFER-304 — Implement fixed-price offer engine and conversion rules

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | FUL-303 |
| **Status** | `backlog` |

### Why this exists

Autonomy dies when every deal requires custom pricing or approval.

### Scope

Encode pilot and subscription offers, eligibility windows, credit rules, and expiration logic. No custom quotes in v1.

### Acceptance criteria

- [ ] The system can decide which fixed offer to present and why
- [ ] Offer selection is explainable and stored with the account

### Cursor brief

Create an offer engine with config-driven plans like `pilot_one_time` and `subscription_monthly`. Include fields for price, credit_to_subscription, expiry_days, and eligibility predicates. Persist the chosen offer and render it into the proof-delivery and follow-up messages.

---

## BILL-305 — Integrate Stripe checkout and webhook-driven state changes

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | OFFER-304, OPS-004 |
| **Status** | `backlog` |

### Why this exists

Payment is a state transition, not just a link. Webhook handling has to be replay-safe.

### Scope

Create checkout sessions, verify webhook signatures, map Stripe events into internal billing states, and trigger activation.

### Acceptance criteria

- [ ] A paid checkout updates the account to `paid`, creates a subscription record when relevant, and emits an activation task exactly once

### Cursor brief

Build Stripe checkout creation and webhook handlers with signature verification and idempotency. Store checkout session IDs, customer IDs, subscription IDs, invoice IDs, amount, currency, and billing status. Map Stripe events into internal domain events and enqueue provisioning only after verified payment success.

---

## ONBD-306 — Provision workspace and send onboarding automatically

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | BILL-305 |
| **Status** | `backlog` |

### Why this exists

A self-closing machine must also self-activate; otherwise you still become the bottleneck.

### Scope

Create workspace, invite primary user, attach prior uploads/proof artifacts, initialize defaults, and send first-run instructions.

### Acceptance criteria

- [ ] After a successful payment, the workspace is created exactly once
- [ ] The buyer gets an activation email
- [ ] Prior artifacts are visible in the new workspace

### Cursor brief

Implement a provisioning worker that creates a workspace, links the paid account and uploads, seeds default settings, and sends a transactional onboarding email with magic-link or invite flow. Make the worker idempotent and safe to replay from billing events.

---

## RET-307 — Build retention agent for more docs and recurring usage

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Estimate** | 5 pts |
| **Depends on** | ONBD-306 |
| **Status** | `backlog` |

### Why this exists

The autonomous sale is more valuable when it turns into ongoing questionnaire throughput.

### Scope

Prompt for missing evidence, expiring documents, reusable answers, and new questionnaire uploads. Keep it event-driven and lightweight.

### Acceptance criteria

- [ ] The system schedules nudges based on missing docs, stale evidence, and new uploads
- [ ] Messages are suppressible and respect product state

### Cursor brief

Create a retention worker that listens for events like workspace created, proof gaps found, document nearing expiry, and new questionnaire uploaded. Generate product-side nudges and email nudges with clear rules for cadence, suppression, and stop conditions.
