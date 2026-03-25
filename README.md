# Trust Copilot Autopilot

Autonomous closed-loop sales engine for Trust Copilot: discover accounts showing trust-review pain, qualify them, reach out with policy-safe outreach, deliver proof artifacts, and close without a human seller.

Integrates the **Sales Intelligence Engine (SIE)** — a multi-source discovery, signal fusion, pain inference, buyer reasoning, and contact decisioning layer designed for high-volume candidate processing with quality-first outreach.

## Architecture

The system is split into three lanes with independent budgets:

| Lane | Purpose | Scale target |
|------|---------|--------------|
| **Discovery** | Crawl public sources, extract signals, fuse accounts, score, resolve buyers | Up to 1M candidate pages/day |
| **Qualification** | ICP fit, pain inference, urgency, value, contact decisions | Subset of discovery output |
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

## Technology stack

### Core
- **Next.js** — internal ops UI, intake rooms, proof pages
- **FastAPI** — orchestration APIs and webhooks
- **PostgreSQL** — relational state, migrations, state machine
- **pgvector** — semantic similarity for account memory
- **Redis** — queues, caching, rate limiting
- **MinIO** — object storage for uploads and artifacts

### Required (new)
- **Playwright** — JS-rendered public pages (careers, trust, team)
- **Trafilatura** — robust HTML-to-text extraction before signal parsing

### Optional (new)
- **LightGBM** — learned lead-ranking model (after rule-based scoring works)
- **MLflow** — model registry/versioning (if LightGBM is productionized)
- **ClickHouse** — raw discovery telemetry (only if PostgreSQL cannot keep up)

## Repo layout

```
sales/
├── apps/
│   ├── web/              # Next.js — internal ops, intake rooms, proof pages
│   └── api/              # FastAPI — orchestration APIs and webhooks
├── workers/
│   ├── discovery/         # Source crawling, fetching, extraction, fusion
│   ├── qualification/     # Scoring, buyer resolution, contact decisions
│   ├── send/              # Outbound email orchestration
│   ├── inbox/             # Inbound mail processing and thread assembly
│   ├── fulfillment/       # Trust Copilot job runner and proof rendering
│   └── retention/         # Post-sale nudges and usage growth
├── libs/
│   ├── contracts/         # Typed DTOs, signal contracts, shared schemas
│   └── policy/            # Deterministic policy engine
├── db/
│   └── migrations/        # Postgres schema and state machine migrations
├── infra/                 # Docker, deploy configs, worker topology
└── backlog/               # Ticket backlog (69 tickets, 9 increments)
```

## Backlog

See [`backlog/README.md`](backlog/README.md) for the full ticket index, dependency graph, and build order.

**69 tickets across 9 increments:**

1. **Foundation & data model** (10 tickets): Runtime, state model, intelligence schema, audit, idempotency, event topics
2. **Signal acquisition** (8 tickets): Source registry, fetcher, Playwright, Trafilatura, job boards, RSS, page classifier, dedupe
3. **Signal normalization & fusion** (6 tickets): Atomic extraction, trigger taxonomy, account fusion, narrative, decay, negatives
4. **Pain, ICP & value reasoning** (6 tickets): Firmographics, pain types, ICP score, urgency, value, micro-segments
5. **Buyer & contact reasoning** (6 tickets): Buyer resolver, role-to-pain map, fallback chain, competitors, contact decisions, memory
6. **Message strategy & outreach** (12 tickets): Strategy objects, policy engine, composer, mailbox orchestrator, send, inbox, replies, kill switches
7. **Proof, payment & onboarding** (7 tickets): Intake rooms, fulfillment, proof packs, offers, Stripe, onboarding, retention
8. **Learning & evaluation** (6 tickets): Outcomes, labeling, ranking model, offline evals, shadow scoring, rollback
9. **Scale, ops & quality** (8 tickets): Source health, conflict detection, ClickHouse, throughput controls, embeddings, guardrails, dashboards, runbooks

## Build order

1. Finish Increment 1 completely
2. Build Increment 2 — crawl infrastructure
3. Build Increment 3 — signal fusion and account state
4. Build Increment 4 — scoring and value reasoning
5. Build Increment 5 — buyer resolution and contact decisions
6. Build Increment 6 — keep send volumes tiny until policy and suppression are proven
7. Build Increment 7 so the system can close without demos
8. Build Increment 8 — feedback loop and learned ranking
9. Only then build Increment 9 to scale discovery and quality

## Working with Cursor

1. Open **one ticket per branch**
2. Paste the **Cursor brief** section into Cursor
3. Implement only the scope in that ticket
4. Require tests and an idempotent happy path before merging
5. Do not let Cursor "also clean up unrelated code"

## Explicit non-goals

- No LinkedIn automation or platform-prohibited scraping
- No assumption that outbound email volume should scale to 1M/day
- The 1M/day target applies to **discovery candidate processing**, not email sends
- No bought lead lists or multi-channel social blasting
- No custom quote workflows in v1
- No fancy analytics before audit logging and kill switches
