# Trust Copilot Autopilot

Autonomous closed-loop sales engine for Trust Copilot: discover accounts showing trust-review pain, qualify them, reach out with policy-safe outreach, deliver proof artifacts, and close without a human seller.

## Architecture

The system is split into three lanes with independent budgets:

| Lane | Purpose | Scale target |
|------|---------|--------------|
| **Discovery** | Crawl public sources, extract trust-review signals, canonicalize companies | Up to 1M candidate pages/day |
| **Qualification** | Dedupe, score ICP + trigger urgency, resolve buyers, generate briefs | Subset of discovery output |
| **Contact** | Policy-gated outreach, reply handling, intake, fulfillment, payment | Reputation-budgeted; never scales with discovery |

## Object model

| Stage | Object |
|-------|--------|
| 1 | **Candidate signal** — a public page or event implying trust-review pain |
| 2 | **Candidate account** — a company linked to signals |
| 3 | **Qualified account** — passed ICP + trigger scoring |
| 4 | **Contactable account** — passed jurisdiction, recipient type, buyer confidence, sender budget |
| 5 | **Opportunity** — replied, opened intake room, or uploaded files |
| 6 | **Customer** — paid and provisioned |

## State machine

```
raw_signal -> candidate_account -> qualified_account -> contactable -> contacted
-> replied -> intake_open -> uploaded -> fulfilled -> offer_sent -> paid -> activated
```

Terminal: `blocked`, `suppressed`, `snoozed`

## Repo layout

```
sales/
├── apps/
│   ├── web/              # Next.js — internal ops, intake rooms, proof pages
│   └── api/              # FastAPI — orchestration APIs and webhooks
├── workers/
│   ├── discovery/         # Signal crawling and extraction
│   ├── qualification/     # Scoring, buyer resolution, brief generation
│   ├── send/              # Outbound email orchestration
│   ├── inbox/             # Inbound mail processing and thread assembly
│   ├── fulfillment/       # Trust Copilot job runner and proof rendering
│   └── retention/         # Post-sale nudges and usage growth
├── libs/
│   ├── contracts/         # Typed DTOs and shared schemas
│   └── policy/            # Deterministic policy engine
├── db/
│   └── migrations/        # Postgres schema and state machine migrations
├── infra/                 # Docker, deploy configs, worker topology
└── backlog/               # Ticket backlog (34 tickets, 5 increments)
```

## Backlog

See [`backlog/README.md`](backlog/README.md) for the full ticket index, dependency graph, and build order.

**34 tickets across 5 increments (196 total points):**

1. **Increment 1 — Foundation** (5 tickets, 24 pts): Runtime, state model, audit, idempotency
2. **Increment 2 — Discovery** (7 tickets, 42 pts): Source adapters, fetcher, extraction, scoring, buyer resolution
3. **Increment 3 — Outreach** (8 tickets, 52 pts): Policy engine, suppression, composer, send, inbox, reply handling, kill switches
4. **Increment 4 — Proof & payment** (7 tickets, 39 pts): Intake rooms, fulfillment, proof packs, offers, Stripe, onboarding
5. **Increment 5 — Scale & quality** (7 tickets, 39 pts): Sharding, fingerprinting, evals, guardrails, dashboards, runbooks

## Build order

1. Finish Increment 1 completely
2. Build Increment 2 until you can generate high-confidence briefs
3. Build Increment 3 — keep send volumes tiny until policy and suppression are proven
4. Build Increment 4 so the system can close without demos
5. Only then build Increment 5 to scale discovery and quality

## Working with Cursor

1. Open **one ticket per branch**
2. Paste the **Cursor brief** section into Cursor
3. Implement only the scope in that ticket
4. Require tests and an idempotent happy path before merging
5. Do not let Cursor "also clean up unrelated code"

## What NOT to build in v1

- LinkedIn bots or scraping automation
- Multi-channel social blasting
- Bought lead lists
- Custom quote workflows
- Human approval inboxes for every message
- Fancy analytics before audit logging and kill switches
- "Growth hacks" that bypass policy checks
