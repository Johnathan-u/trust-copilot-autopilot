# Trust Copilot Autopilot — Ticket Backlog

## Object model

| Object | Definition |
|--------|------------|
| **Candidate signal** | A public page or event that may imply trust-review pain |
| **Candidate account** | A company linked to one or more candidate signals |
| **Qualified account** | An account that passed ICP + trigger scoring |
| **Contactable account** | A qualified account with allowed jurisdiction, recipient type, buyer confidence, and sender budget |
| **Opportunity** | An account that replied, opened an intake room, or uploaded files |
| **Customer** | An opportunity that paid and was provisioned |

## State machine

```
raw_signal -> candidate_account -> qualified_account -> contactable -> contacted
-> replied -> intake_open -> uploaded -> fulfilled -> offer_sent -> paid -> activated
```

Terminal states: `blocked`, `suppressed`, `snoozed`

## Increments

| # | Name | Tickets | Total pts | File |
|---|------|---------|-----------|------|
| 1 | Closed-loop foundation | 5 | 24 | [INCREMENT-1-FOUNDATION.md](INCREMENT-1-FOUNDATION.md) |
| 2 | Discovery & qualification intelligence | 7 | 42 | [INCREMENT-2-DISCOVERY.md](INCREMENT-2-DISCOVERY.md) |
| 3 | Policy-safe outreach runtime | 8 | 52 | [INCREMENT-3-OUTREACH.md](INCREMENT-3-OUTREACH.md) |
| 4 | Proof, payment, and onboarding loop | 7 | 39 | [INCREMENT-4-PROOF-PAYMENT.md](INCREMENT-4-PROOF-PAYMENT.md) |
| 5 | Discovery scale & quality hardening | 7 | 39 | [INCREMENT-5-SCALE.md](INCREMENT-5-SCALE.md) |
| | **Total** | **34** | **196** | |

## Ticket index

### Increment 1 — Foundation
| Ticket | Title | P | Pts | Depends on |
|--------|-------|---|-----|------------|
| ARC-001 | Split discovery lane from contact lane | P0 | 3 | — |
| PLAT-002 | Scaffold repo shape and shared contracts | P0 | 5 | ARC-001 |
| DATA-003 | Core schema and deal state machine | P0 | 8 | PLAT-002 |
| OPS-004 | Audit log, idempotency keys, outbox pattern | P0 | 5 | DATA-003 |
| CFG-005 | Environment validation, secrets, feature flags | P1 | 3 | PLAT-002 |

### Increment 2 — Discovery
| Ticket | Title | P | Pts | Depends on |
|--------|-------|---|-----|------------|
| DISC-101 | Source adapter framework and scheduler | P0 | 5 | ARC-001 |
| DISC-102 | Fetcher frontier with robots and rate limits | P0 | 8 | DISC-101 |
| DISC-103 | Signal extractor for trust-review pain | P0 | 8 | DISC-102 |
| DISC-104 | Canonicalize companies and dedupe accounts | P0 | 5 | DISC-103 |
| DISC-105 | ICP score and why-now score | P0 | 5 | DISC-104 |
| DISC-106 | Buyer resolver and email-confidence model | P0 | 8 | DISC-104 |
| DISC-107 | Internal research brief and proof angle | P1 | 3 | DISC-105, DISC-106 |

### Increment 3 — Outreach
| Ticket | Title | P | Pts | Depends on |
|--------|-------|---|-----|------------|
| POL-201 | Deterministic policy engine and sender-rule checks | P0 | 8 | DATA-003, DISC-105, DISC-106 |
| POL-202 | Suppression, allowlist, denylist, do-not-contact | P0 | 5 | POL-201 |
| MSG-203 | Grounded message composer with hard output schema | P0 | 5 | DISC-107, POL-201 |
| MAIL-204 | Mailbox orchestrator and send-budget allocator | P0 | 8 | ARC-001, POL-201 |
| MAIL-205 | Send worker with unsubscribe and bounce handling | P0 | 8 | MAIL-204, MSG-203, POL-202 |
| INBOX-206 | Ingest inbound mail and assemble account threads | P0 | 5 | MAIL-205 |
| REPLY-207 | Reply classifier and next-action planner | P0 | 8 | INBOX-206, DISC-107 |
| SAFE-208 | Kill switches, complaint thresholds, auto pauses | P0 | 5 | MAIL-205, REPLY-207 |

### Increment 4 — Proof & payment
| Ticket | Title | P | Pts | Depends on |
|--------|-------|---|-----|------------|
| INTAKE-301 | Secure intake room with tokenized upload links | P0 | 8 | REPLY-207 |
| FUL-302 | Trust Copilot fulfillment bridge and job runner | P0 | 8 | INTAKE-301 |
| FUL-303 | Proof pack, gap report, proof-delivery email | P0 | 5 | FUL-302 |
| OFFER-304 | Fixed-price offer engine and conversion rules | P0 | 3 | FUL-303 |
| BILL-305 | Stripe checkout and webhook-driven state changes | P0 | 5 | OFFER-304, OPS-004 |
| ONBD-306 | Provision workspace and send onboarding | P0 | 5 | BILL-305 |
| RET-307 | Retention agent for docs and recurring usage | P1 | 5 | ONBD-306 |

### Increment 5 — Scale & quality
| Ticket | Title | P | Pts | Depends on |
|--------|-------|---|-----|------------|
| SCALE-401 | Shard discovery queue for 1M/day throughput | P0 | 8 | DISC-102 |
| SCALE-402 | Change detection and content fingerprinting | P0 | 5 | DISC-102 |
| SCALE-403 | Embeddings and account memory index | P1 | 5 | DISC-107 |
| EVAL-404 | Golden datasets and offline replay harness | P0 | 8 | DISC-103, MSG-203, REPLY-207 |
| EVAL-405 | Message guardrails and contradiction detection | P0 | 5 | MSG-203, EVAL-404 |
| OBS-406 | Deliverability, policy, and conversion dashboards | P1 | 5 | SAFE-208, BILL-305 |
| OPS-407 | Incident runbooks, replay tools, backfills | P1 | 3 | OPS-004, SCALE-401, OBS-406 |

## Dependency graph (simplified)

```
ARC-001 ──┬── PLAT-002 ──┬── DATA-003 ── OPS-004 ──────────────────────── BILL-305 ── ONBD-306 ── RET-307
           │               │                                                  ▲
           │               └── CFG-005                                        │
           │                                                                  │
           ├── DISC-101 ── DISC-102 ──┬── DISC-103 ── DISC-104 ──┬── DISC-105 ──┐       OFFER-304
           │                          │                           │              │           ▲
           │                          ├── SCALE-401               ├── DISC-106 ──┤       FUL-303
           │                          └── SCALE-402               │              │           ▲
           │                                                      │         DISC-107 ──── FUL-302
           │                                                      │              │           ▲
           │                          ┌───────────────────────────┘              │       INTAKE-301
           │                          ▼                                         │           ▲
           └── MAIL-204 ◄── POL-201 ◄─────────────────────────────┐            │       REPLY-207
                    │            │                                  │            │        ▲     │
                    │        POL-202                            MSG-203 ◄────────┘   INBOX-206  │
                    │            │                                  │                    ▲      │
                    └────────────┴──────── MAIL-205 ────────────────┘                    │      │
                                               │                                   MAIL-205    │
                                               └──────────── SAFE-208 ◄─────────────────┘─────┘
```

## Build order

1. Finish **Increment 1** completely
2. Build **Increment 2** until you can generate high-confidence briefs
3. Build **Increment 3** — keep send volumes tiny until policy and suppression are proven
4. Build **Increment 4** so the system can close without demos
5. Only then build **Increment 5** to scale discovery and quality

## What NOT to build in v1

- LinkedIn bots or LinkedIn scraping automation
- Multi-channel social blasting
- Bought lead lists
- Custom quote workflows
- Human approval inboxes for every message
- Fancy analytics before audit logging and kill switches
- "Growth hacks" that bypass policy checks

## How to use with Cursor

1. Open **one ticket per branch**
2. Paste the **Cursor brief** into Cursor
3. Make Cursor implement only the scope in that ticket
4. Require tests and an idempotent happy path before merging
5. Do not let Cursor "also clean up unrelated code"
