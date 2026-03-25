# Increment 1 — Closed-loop foundation

**Goal:** Stand up the minimal autonomous runtime and state model.

**Exit criteria:** You can run the happy path end-to-end on a tiny safe lane: signal → qualified account → allowed send → reply → intake room → fulfillment → offer → paid.

**Tickets:** 5

---

## ARC-001 — Split discovery lane from contact lane

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | — |
| **Status** | `backlog` |

### Why this exists

This is the architectural correction that makes the rest of the system sane. Discovery can scale aggressively; contact must stay policy- and reputation-budgeted.

### Scope

Create separate queues, services, and budget controls for `discovery`, `qualification`, and `contact`. Add a `lane_budget` concept so discovery volume can reach very high throughput without automatically increasing outreach volume.

### Acceptance criteria

- [ ] There are separate queue names and workers per lane
- [ ] A qualified account cannot move into contact unless a budget check passes
- [ ] Dashboards show discovery throughput and contact throughput separately

### Cursor brief

Implement a lane model in the backend. Add Redis queue names for `discovery.raw`, `discovery.enriched`, `contact.ready`, and `contact.send`. Add a `lane_budgets` table in Postgres with fields for lane, scope, daily_limit, hourly_limit, used_today, used_this_hour, reset timestamps, and hard_pause. Wire a service that gates promotions between queues. Write tests for budget exhaustion, reset behavior, and idempotent retries.

---

## PLAT-002 — Scaffold repo shape and shared contracts

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | ARC-001 |
| **Status** | `backlog` |

### Why this exists

Cursor will move faster if the repo has a stable shape and typed contracts before feature work begins.

### Scope

Create a monorepo or clearly separated app layout for `web`, `api`, `workers`, `libs/contracts`, `libs/policy`, and `db`. Define shared DTOs and enums for accounts, contacts, triggers, policies, and workflow states.

### Acceptance criteria

- [ ] Repository boots locally with Docker
- [ ] Shared schemas are imported by API and workers
- [ ] Lint, format, and test commands run successfully

### Cursor brief

Create a repo layout with `apps/web` (Next.js), `apps/api` (FastAPI), `workers/*`, `libs/contracts`, `libs/policy`, `db/migrations`, and `infra`. Use typed schemas for Account, Contact, Signal, PolicyDecision, MessageDraft, ReplyClassification, IntakeRoom, Offer, and BillingEvent. Add a single `make dev` or equivalent command that starts Postgres, Redis, MinIO, API, workers, and web.

---

## DATA-003 — Create core schema and the deal state machine

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 8 pts |
| **Depends on** | PLAT-002 |
| **Status** | `backlog` |

### Why this exists

Without a strict state model, a fully autonomous system will double-send, lose context, and make unsafe transitions.

### Scope

Model accounts, contacts, signals, policies, message sequences, replies, intake rooms, jobs, offers, billing events, and workspace provisioning. Add a deterministic state transition layer.

### Acceptance criteria

- [ ] All major entities exist with migrations
- [ ] Transitions are enforced by code
- [ ] Impossible transitions fail loudly
- [ ] A full happy-path test passes from signal to paid

### Cursor brief

Add Postgres tables for `accounts`, `contacts`, `signals`, `account_scores`, `buyer_candidates`, `policy_decisions`, `campaigns`, `message_threads`, `messages`, `reply_events`, `intake_rooms`, `uploads`, `fulfillment_jobs`, `proof_packs`, `offers`, `checkout_sessions`, `subscriptions`, `workspace_provisions`, `suppression_entries`, and `audit_events`. Add a state enum: `raw_signal`, `candidate_account`, `qualified_account`, `contactable`, `contacted`, `replied`, `intake_open`, `uploaded`, `fulfilled`, `offer_sent`, `paid`, `activated`, `snoozed`, `suppressed`, `blocked`. Build a transition service with guards and tests.

---

## OPS-004 — Add audit log, idempotency keys, and outbox pattern

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | DATA-003 |
| **Status** | `backlog` |

### Why this exists

Autonomy fails in practice when retries are not idempotent. Every external side effect must be replay-safe.

### Scope

Implement append-only audit events, outbox rows for side effects, and idempotency keys on state transitions, sends, webhooks, and worker jobs.

### Acceptance criteria

- [ ] A replay of the same job does not create duplicate sends, duplicate rooms, duplicate charges, or duplicate provisioning
- [ ] Audit events are queryable per account

### Cursor brief

Add an `audit_events` append-only table and an `outbox_events` table. Wrap all external actions—send email, open intake room, create checkout, provision workspace—in a transaction that writes an outbox row. Add idempotency keys on workers and HTTP handlers. Build a generic worker utility that claims outbox rows with a lease and retries safely.

---

## CFG-005 — Implement environment validation, secret loading, and feature flags

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Estimate** | 3 pts |
| **Depends on** | PLAT-002 |
| **Status** | `backlog` |

### Why this exists

At this level of automation, a missing DNS key or webhook secret should fail at boot, not at runtime.

### Scope

Typed env loader, secret adapters, boot-time validation, and feature flags for source adapters, send lanes, and billing.

### Acceptance criteria

- [ ] App fails fast on invalid config
- [ ] Secrets are never logged
- [ ] Risky features can be turned off without deployment

### Cursor brief

Create a typed config layer. Validate required SMTP, IMAP, Redis, Postgres, MinIO, Stripe, and app secrets at startup. Add feature flags for `discovery_enabled`, `contact_enabled`, `billing_enabled`, `trust_copilot_enabled`, and per-source toggles. Add tests for startup failure on missing required values.
