# Trust Copilot Autopilot — Master Backlog

## Architecture

The system is three lanes with independent budgets:

| Lane | Purpose | Scale target |
|------|---------|--------------|
| **Discovery** | Crawl public sources, extract signals, fuse accounts, score, resolve buyers | Up to 1M candidate pages/day |
| **Qualification** | ICP fit, pain inference, urgency, value, contact decisions | Subset of discovery output |
| **Contact** | Policy-gated outreach, reply handling, intake, fulfillment, payment | Reputation-budgeted; never scales with discovery |

The **Sales Intelligence Engine (SIE)** covers the discovery-through-decisioning layer. It plugs into the autonomous outbound / intake / fulfillment system.

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
- Next.js, FastAPI, PostgreSQL, pgvector, Redis, MinIO

### Required (new)
- **Playwright** — JS-rendered public pages (careers, trust, team)
- **Trafilatura** — robust HTML-to-text extraction

### Optional (new)
- **LightGBM** — learned lead-ranking model (after rule-based scoring works)
- **MLflow** — model registry/versioning (if LightGBM is productionized)
- **ClickHouse** — raw discovery telemetry (only if PostgreSQL cannot keep up)

## Increments

| # | Name | Tickets | File |
|---|------|---------|------|
| 1 | Foundation & data model | 10 | [INCREMENT-1-FOUNDATION.md](INCREMENT-1-FOUNDATION.md) |
| 2 | Signal acquisition | 8 | [INCREMENT-2-SIGNAL-ACQUISITION.md](INCREMENT-2-SIGNAL-ACQUISITION.md) |
| 3 | Signal normalization & fusion | 6 | [INCREMENT-3-SIGNAL-FUSION.md](INCREMENT-3-SIGNAL-FUSION.md) |
| 4 | Pain, ICP & value reasoning | 6 | [INCREMENT-4-PAIN-ICP-VALUE.md](INCREMENT-4-PAIN-ICP-VALUE.md) |
| 5 | Buyer & contact reasoning | 6 | [INCREMENT-5-BUYER-CONTACT.md](INCREMENT-5-BUYER-CONTACT.md) |
| 6 | Message strategy & outreach | 12 | [INCREMENT-6-MESSAGE-STRATEGY-AND-OUTREACH.md](INCREMENT-6-MESSAGE-STRATEGY-AND-OUTREACH.md) |
| 7 | Proof, payment & onboarding | 7 | [INCREMENT-7-PROOF-PAYMENT.md](INCREMENT-7-PROOF-PAYMENT.md) |
| 8 | Learning & evaluation | 6 | [INCREMENT-8-LEARNING-EVAL.md](INCREMENT-8-LEARNING-EVAL.md) |
| 9 | Scale, ops & quality | 8 | [INCREMENT-9-SCALE-OPS.md](INCREMENT-9-SCALE-OPS.md) |
| | **Total** | **69** | |

---

## Full ticket index

### Increment 1 — Foundation & data model (10 tickets)
| Ticket | Title | P | Est | Depends on |
|--------|-------|---|-----|------------|
| ARC-001 | Split discovery lane from contact lane | P0 | 3 | — |
| PLAT-002 | Scaffold repo shape and shared contracts | P0 | 5 | ARC-001 |
| DATA-003 | Core schema and deal state machine | P0 | 8 | PLAT-002 |
| SIE-001 | Sales-intelligence data model | P0 | 3 | DATA-003 |
| SIE-002 | Normalized signal contract | P0 | 3 | SIE-001 |
| SIE-003 | Account feature snapshot tables | P0 | 3 | SIE-001, SIE-002 |
| OPS-004 | Audit log, idempotency keys, outbox pattern | P0 | 5 | DATA-003 |
| SIE-004 | Decision-trace schema and replay hooks | P0 | 5 | OPS-004, SIE-001, SIE-003 |
| SIE-005 | Event topics and worker contracts | P0 | 3 | SIE-002 |
| CFG-005 | Environment validation, secrets, feature flags | P1 | 3 | PLAT-002 |

### Increment 2 — Signal acquisition (8 tickets)
| Ticket | Title | P | Est | Depends on | Replaces |
|--------|-------|---|-----|------------|----------|
| SIE-101 | Source registry and crawl scheduler | P0 | 5 | SIE-001, SIE-005, ARC-001 | DISC-101 |
| SIE-102 | Robots-aware HTML fetcher | P0 | 3 | SIE-101 | DISC-102 |
| SIE-103 | Playwright renderer for JS-heavy pages | P0 | 5 | SIE-101 | — |
| SIE-104 | HTML-to-text extraction pipeline | P0 | 3 | SIE-102, SIE-103 | — |
| SIE-105 | Job-board adapters | P0 | 5 | SIE-101, SIE-104 | — |
| SIE-106 | RSS and news/press ingest adapters | P0 | 3 | SIE-101 | — |
| SIE-107 | Page-type classifier | P0 | 3 | SIE-104 | — |
| SIE-108 | Freshness, dedupe, and crawl-budget controls | P0 | 3 | SIE-101, SIE-102, SIE-106 | SCALE-402 |

### Increment 3 — Signal normalization & fusion (6 tickets)
| Ticket | Title | P | Est | Depends on | Replaces |
|--------|-------|---|-----|------------|----------|
| SIE-201 | Extract atomic signal events from text | P0 | 5 | SIE-104, SIE-105, SIE-106, SIE-107 | DISC-103 |
| SIE-202 | Trigger taxonomy and scoring rules | P0 | 3 | SIE-201 | — |
| SIE-203 | Account-level signal fusion worker | P0 | 5 | SIE-201, SIE-202, SIE-003 | DISC-104 |
| SIE-204 | Account narrative summary | P0 | 3 | SIE-203 | DISC-107 |
| SIE-205 | Temporal decay and why-now freshness scoring | P0 | 3 | SIE-202, SIE-203 | — |
| SIE-206 | Negative-signal detector | P0 | 3 | SIE-201, SIE-202 | — |

### Increment 4 — Pain, ICP & value reasoning (6 tickets)
| Ticket | Title | P | Est | Depends on | Replaces |
|--------|-------|---|-----|------------|----------|
| SIE-301 | Firmographic estimator | P0 | 5 | SIE-203 | — |
| SIE-302 | Infer likely pain types | P0 | 3 | SIE-203, SIE-301 | — |
| SIE-303 | Score ICP fit | P0 | 3 | SIE-301, SIE-302 | DISC-105 |
| SIE-304 | Estimate urgency and monetization probability | P0 | 3 | SIE-302, SIE-303, SIE-205 | — |
| SIE-305 | Estimate deal tier and expected value | P0 | 3 | SIE-301, SIE-304 | — |
| SIE-306 | Micro-segmentation | P0 | 3 | SIE-302, SIE-303, SIE-305 | — |

### Increment 5 — Buyer & contact reasoning (6 tickets)
| Ticket | Title | P | Est | Depends on | Replaces |
|--------|-------|---|-----|------------|----------|
| SIE-401 | Public-site buyer resolver | P0 | 5 | SIE-107, SIE-301 | DISC-106 |
| SIE-402 | Role-to-pain buyer psychology map | P0 | 3 | SIE-302, SIE-401 | — |
| SIE-403 | Contact confidence and fallback chain | P0 | 3 | SIE-401, SIE-402 | — |
| SIE-404 | Competitor presence detection | P0 | 3 | SIE-201, SIE-203 | — |
| SIE-405 | Contact decision engine | P0 | 5 | SIE-304, SIE-305, SIE-403, SIE-404 | — |
| SIE-406 | Account memory and re-contact logic | P0 | 3 | SIE-405 | — |

### Increment 6 — Message strategy & outreach (12 tickets)
| Ticket | Title | P | Est | Depends on |
|--------|-------|---|-----|------------|
| SIE-501 | Structured message-strategy object | P0 | 3 | SIE-302, SIE-306, SIE-405 |
| SIE-502 | Objection prediction | P0 | 3 | SIE-501, SIE-406 |
| SIE-503 | CTA chooser | P0 | 3 | SIE-501, SIE-502 |
| SIE-504 | Send-reason and no-send explanation bundle | P0 | 3 | SIE-405, SIE-501 |
| POL-201 | Deterministic policy engine and sender-rule checks | P0 | 8 | DATA-003, SIE-303, SIE-401 |
| POL-202 | Suppression, allowlist, denylist, do-not-contact | P0 | 5 | POL-201 |
| MSG-203 | Grounded message composer with hard output schema | P0 | 5 | SIE-501, POL-201 |
| MAIL-204 | Mailbox orchestrator and send-budget allocator | P0 | 8 | ARC-001, POL-201 |
| MAIL-205 | Send worker with unsubscribe and bounce handling | P0 | 8 | MAIL-204, MSG-203, POL-202 |
| INBOX-206 | Ingest inbound mail and assemble account threads | P0 | 5 | MAIL-205 |
| REPLY-207 | Reply classifier and next-action planner | P0 | 8 | INBOX-206, SIE-204 |
| SAFE-208 | Kill switches, complaint thresholds, auto pauses | P0 | 5 | MAIL-205, REPLY-207 |

### Increment 7 — Proof, payment & onboarding (7 tickets)
| Ticket | Title | P | Est | Depends on |
|--------|-------|---|-----|------------|
| INTAKE-301 | Secure intake room with tokenized upload links | P0 | 8 | REPLY-207 |
| FUL-302 | Trust Copilot fulfillment bridge and job runner | P0 | 8 | INTAKE-301 |
| FUL-303 | Proof pack, gap report, proof-delivery email | P0 | 5 | FUL-302 |
| OFFER-304 | Fixed-price offer engine and conversion rules | P0 | 3 | FUL-303 |
| BILL-305 | Stripe checkout and webhook-driven state changes | P0 | 5 | OFFER-304, OPS-004 |
| ONBD-306 | Provision workspace and send onboarding | P0 | 5 | BILL-305 |
| RET-307 | Retention agent for docs and recurring usage | P1 | 5 | ONBD-306 |

### Increment 8 — Learning & evaluation (6 tickets)
| Ticket | Title | P | Est | Depends on |
|--------|-------|---|-----|------------|
| SIE-601 | Capture lead-quality outcomes | P0 | 3 | SIE-405, SIE-406 |
| SIE-602 | Decision labeling pipeline | P0 | 3 | SIE-601, SIE-004 |
| SIE-603 | Train ranking model v1 (LightGBM) | P1 | 5 | SIE-602 |
| SIE-604 | Offline evaluation suite | P0 | 3 | SIE-603 |
| SIE-605 | Shadow scoring in production | P1 | 3 | SIE-603, SIE-604 |
| SIE-606 | Model rollback and safe fallback (MLflow opt.) | P1 | 3 | SIE-605 |

### Increment 9 — Scale, ops & quality (8 tickets)
| Ticket | Title | P | Est | Depends on |
|--------|-------|---|-----|------------|
| SIE-701 | Source health dashboard | P0 | 3 | SIE-101, SIE-108 |
| SIE-702 | Account conflict detector | P0 | 3 | SIE-405, SIE-406 |
| SIE-703 | Large-scale raw event store (ClickHouse opt.) | P1 | 5 | SIE-101, SIE-108, SIE-601 |
| SIE-704 | Discovery throughput controls for 1M/day | P0 | 5 | SIE-101, SIE-108, SIE-203, SIE-703 |
| SCALE-403 | Embeddings and account memory index | P1 | 5 | SIE-204 |
| EVAL-405 | Message guardrails and contradiction detection | P0 | 5 | MSG-203, SIE-604 |
| OBS-406 | Deliverability, policy, and conversion dashboards | P1 | 5 | SAFE-208, BILL-305 |
| OPS-407 | Incident runbooks, replay tools, backfills | P1 | 3 | OPS-004, SIE-704, OBS-406 |

---

## Replaced tickets

These tickets from the original backlog have been superseded by more granular SIE tickets:

| Old ticket | Replaced by |
|------------|-------------|
| DISC-101 (Source adapter framework) | SIE-101, SIE-105, SIE-106 |
| DISC-102 (Fetcher frontier) | SIE-102, SIE-103, SIE-108 |
| DISC-103 (Signal extractor) | SIE-201, SIE-202, SIE-206 |
| DISC-104 (Canonicalize companies) | SIE-203, SIE-204 |
| DISC-105 (ICP + why-now score) | SIE-303, SIE-304, SIE-305 |
| DISC-106 (Buyer resolver) | SIE-401, SIE-402, SIE-403 |
| DISC-107 (Research brief) | SIE-204, SIE-501 |
| SCALE-401 (Shard discovery queue) | SIE-704 |
| SCALE-402 (Change detection) | SIE-108 |
| EVAL-404 (Golden datasets) | SIE-604 |

---

## Dependency graph (simplified)

```
ARC-001 ─── PLAT-002 ─── DATA-003 ──┬── SIE-001 ──┬── SIE-002 ──┬── SIE-005
                │                    │              │             │
                CFG-005              │              └── SIE-003 ──┤
                                     │                            │
                                     OPS-004 ────────── SIE-004 ──┘
                                                           │
                                          ┌────────────────┘
          ┌───────────────────────────────┘
          │
  [SIGNAL ACQUISITION — Increment 2]
  SIE-101 ──┬── SIE-102 ──┐
             ├── SIE-103 ──┼── SIE-104 ──┬── SIE-105
             ├── SIE-106   │             ├── SIE-107
             └── SIE-108 ◄─┘             │
                                          │
  [SIGNAL FUSION — Increment 3]          │
  SIE-201 ◄──────────────────────────────┘
      │
      ├── SIE-202 ──┬── SIE-205
      ├── SIE-206   │
      └── SIE-203 ◄─┘
             │
             SIE-204 ──────────────────────────────────── REPLY-207
             │                                                │
  [PAIN/ICP — Increment 4]                                   │
  SIE-301 ◄─┘                                                │
      │                                                       │
      ├── SIE-302 ──┬── SIE-303 ──── SIE-304                │
      │             │                    │                    │
      │             └── SIE-306          SIE-305              │
      │                    │                │                  │
  [BUYER — Increment 5]   │                │                  │
  SIE-401 ── SIE-402      │                │                  │
      │                    │                │                  │
      SIE-403              │                │                  │
      │                    │                │                  │
      SIE-404              │                │                  │
      │                    │                │                  │
      SIE-405 ◄────────────┴────────────────┘                 │
      │                                                       │
      SIE-406                                                 │
      │                                                       │
  [MESSAGE STRATEGY — Increment 6]                            │
  SIE-501 ── SIE-502 ── SIE-503                              │
      │                                                       │
      SIE-504                                                 │
      │                                                       │
      POL-201 ── POL-202                                      │
      │              │                                        │
      MSG-203 ◄──────┤                                        │
      │              │                                        │
      MAIL-204 ──────┴── MAIL-205 ── INBOX-206 ── REPLY-207 ─┘
                              │              │
                              SAFE-208 ◄─────┘
                                  │
  [PROOF/PAYMENT — Increment 7]  │
  INTAKE-301 ── FUL-302 ── FUL-303 ── OFFER-304 ── BILL-305 ── ONBD-306 ── RET-307
                                                        │
  [LEARNING — Increment 8]                              │
  SIE-601 ── SIE-602 ── SIE-603 ── SIE-604 ── SIE-605 ── SIE-606
                                        │
  [SCALE/OPS — Increment 9]            │
  SIE-701   SIE-702   SIE-703 ── SIE-704
  SCALE-403   EVAL-405 ◄───────────────┘
  OBS-406 ── OPS-407
```

---

## Build order

1. **Increment 1** — Foundation & data model (complete fully)
2. **Increment 2** — Signal acquisition (crawl infrastructure)
3. **Increment 3** — Signal fusion (typed signals and account state)
4. **Increment 4** — Pain, ICP & value reasoning (scoring layer)
5. **Increment 5** — Buyer & contact reasoning (contact decisions)
6. **Increment 6** — Message strategy & outreach (keep send volumes tiny until policy and suppression are proven)
7. **Increment 7** — Proof, payment & onboarding (close without demos)
8. **Increment 8** — Learning & evaluation (feedback loop and learned ranking)
9. **Increment 9** — Scale, ops & quality (only now scale discovery toward 1M/day)

## Explicit non-goals

- No LinkedIn automation
- No platform-prohibited scraping behavior
- No assumption that outbound email volume should scale to 1M/day
- The 1M/day target applies to **discovery candidate processing**, not email sends
- No bought lead lists
- No custom quote workflows
- No human approval inboxes for every message

## How to use with Cursor

1. Open **one ticket per branch**
2. Paste the **Cursor brief** section into Cursor
3. Make Cursor implement only the scope in that ticket
4. Require tests and an idempotent happy path before merging
5. Do not let Cursor "also clean up unrelated code"
