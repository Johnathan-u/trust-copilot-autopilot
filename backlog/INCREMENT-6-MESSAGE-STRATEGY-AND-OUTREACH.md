# Increment 6 — Message strategy & policy-safe outreach

**Goal:** Generate structured message strategies from intelligence, then compose, send, follow up, classify replies, and suppress contacts automatically without bypassing policy.

**Exit criteria:** Every outreach has a grounded strategy object; policy engine gates every send; suppression is immediate; kill switches work; replies are classified and actioned.

**Tickets:** 12

---

## SIE-501 — Generate structured message-strategy object

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-302, SIE-306, SIE-405 |
| **Status** | `backlog` |

### Why this exists

Before generating copy, generate a structured strategy: angle, proof hook, CTA, tone, objection to pre-handle, and supporting evidence. Copy generation is downstream of this object.

### Scope

Strategy object schema; every outreach candidate gets one; all fields grounded in account state.

### Acceptance criteria

- [ ] Strategy object schema exists
- [ ] Every outreach candidate gets one
- [ ] All fields are grounded in account state

### Cursor brief

Create a message strategy builder that outputs angle, pain framing, proof hook, CTA type, tone, and evidence IDs. Do not generate final email text in this ticket — only the strategy object.

---

## SIE-502 — Add objection prediction

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-501, SIE-406 |
| **Status** | `backlog` |

### Why this exists

Predicting the most likely immediate objection — skepticism about AI accuracy, already have a process, wrong person, bad timing — makes the strategy object feel like a sales rep.

### Scope

Predict top objection for each account and role so message strategy can include a pre-handle.

### Acceptance criteria

- [ ] Top predicted objection is stored
- [ ] Message strategy can include a pre-handle
- [ ] Tests cover major objection classes

### Cursor brief

Implement objection prediction using pain type, competitor state, role, segment, and memory. Output top_objection, alternates, and a short evidence-backed rationale.

---

## SIE-503 — Add CTA chooser

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-501, SIE-502 |
| **Status** | `backlog` |

### Why this exists

The CTA must match account maturity and buyer intent: upload questionnaire, request a proof sample, or receive more detail. Upload CTA should not be used blindly for all accounts.

### Scope

Choose the best next step for the account based on confidence, pain type, role, and objection prediction.

### Acceptance criteria

- [ ] CTA chooser returns a controlled enum and rationale
- [ ] Upload CTA is not used blindly for all accounts

### Cursor brief

Implement a CTA chooser service that picks among upload_questionnaire, send_proof_page, send_details, or no_cta. Base the choice on confidence, pain type, role, and objection prediction.

---

## SIE-504 — Add send-reason and no-send explanation bundle

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-405, SIE-501 |
| **Status** | `backlog` |

### Why this exists

A compact explanation bundle for every outreach decision — send or no-send — enables debugging, audits, and human inspection without log diving.

### Scope

Package all reasons behind each outreach decision into a compact explanation bundle.

### Acceptance criteria

- [ ] Explanation bundle exists for both send and no-send cases
- [ ] UI/API can render it
- [ ] Reason codes map back to concrete signals or rules

### Cursor brief

Create a serializable explanation bundle with top triggers, top negatives, buyer rationale, CTA rationale, and final send/no-send reasons. Ensure every item links to concrete evidence or rule IDs.

---

## POL-201 — Implement deterministic policy engine and sender-rule checks

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 8 pts |
| **Depends on** | DATA-003, SIE-303, SIE-401 |
| **Status** | `backlog` |

### Why this exists

Compliance and sender safety must be runtime logic, not prompts. The LLM can draft words; it cannot decide whether a send is allowed.

### Scope

Jurisdiction, recipient-type, trigger freshness, score threshold, sender readiness, unsubscribe/footer presence, suppression check, and mailbox health gates.

### Acceptance criteria

- [ ] A policy decision is stored before every send with allow/deny/snooze and explicit reasons
- [ ] Denied accounts cannot bypass policy through retries

### Cursor brief

Build a policy engine in `libs/policy` with typed rule objects and traceable decisions. Rules should cover approved countries, approved recipient types, minimum contact score, trigger staleness, suppression, mailbox health, footer availability, unsubscribe readiness, and buyer-confidence minimums. Output a machine-readable decision trace and human-readable explanation.

---

## POL-202 — Create suppression, allowlist, denylist, and do-not-contact services

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | POL-201 |
| **Status** | `backlog` |

### Why this exists

One unsubscribe or legal objection must stop all future contact across all lanes immediately.

### Scope

Global and scoped suppression entries by email, domain, company, campaign, and reason. Import/export utilities for manual lists.

### Acceptance criteria

- [ ] Unsubscribed or blocked entities are filtered before compose and before send
- [ ] Removing a suppression entry requires an explicit admin action and audit record

### Cursor brief

Add suppression tables keyed by email, domain, and account with reasons like `unsubscribe`, `legal_request`, `hard_bounce`, `manual_block`, and `wrong_person_do_not_retry`. Expose internal APIs for check, insert, and bulk import. Call suppression checks in both compose and send workers to catch races.

---

## MSG-203 — Build grounded message composer with hard output schema

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-501, POL-201 |
| **Status** | `backlog` |

### Why this exists

High-quality outreach comes from bounded generation over verified facts, not free-form persuasive writing. The composer consumes the strategy object from SIE-501.

### Scope

Schema-driven generation of first touch, follow-ups, reply variants, and objection responses. Every draft must cite exactly which trigger facts it used.

### Acceptance criteria

- [ ] Drafts fail validation if they reference unsupported facts, omit CTA, exceed length, or ignore policy-required footer/unsubscribe content

### Cursor brief

Build a composer that takes the message strategy object (SIE-501) and returns a strict object: subject, body_text, trigger_facts_used, pain_angle, CTA_type, and variant_type. Add validators for max length, single-trigger grounding, prohibited claims, and required footer blocks. Store drafts and validation failures for later analysis.

---

## MAIL-204 — Implement mailbox orchestrator and send-budget allocator

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 8 pts |
| **Depends on** | ARC-001, POL-201 |
| **Status** | `backlog` |

### Why this exists

At scale, the real system is a budget allocator: which mailbox can safely send what, when, and to whom.

### Scope

Mailbox pools, time-zone windows, per-mailbox caps, health scores, DNS/auth readiness checks, and allocation of eligible sends.

### Acceptance criteria

- [ ] Every outbound send is assigned to a mailbox by explicit policy
- [ ] Mailboxes can be paused independently and removed from allocation when unhealthy

### Cursor brief

Create `mailboxes`, `mailbox_health`, and `mailbox_budgets` tables. Build a scheduler that allocates sends by recipient timezone, mailbox health, daily/hourly caps, and domain-level campaign rules. Add preflight checks for SPF/DKIM/DMARC/TLS readiness flags supplied by config or health checks. Expose a dry-run mode that shows planned allocations without sending.

---

## MAIL-205 — Build send worker with unsubscribe and bounce handling

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 8 pts |
| **Depends on** | MAIL-204, MSG-203, POL-202 |
| **Status** | `backlog` |

### Why this exists

This is where the system can do damage if built sloppily. Sending must be traceable, reversible, and suppression-aware.

### Scope

SMTP/API send adapter, send logging, message IDs, unsubscribe header/body support, reply-to handling, bounce parsing, and complaint ingestion hooks.

### Acceptance criteria

- [ ] Each send stores provider IDs and raw payload hash
- [ ] Hard bounces and unsubscribes update suppression immediately
- [ ] A send cannot happen without a policy decision and budget token

### Cursor brief

Implement a send worker that consumes approved send tasks, renders text email, injects required footer content, and adds list-unsubscribe metadata where applicable. Persist provider message IDs, thread metadata, and delivery status. Build bounce and complaint processors that map back to the account/contact and insert suppression entries immediately.

---

## INBOX-206 — Ingest inbound mail and assemble account threads

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | MAIL-205 |
| **Status** | `backlog` |

### Why this exists

Reply handling becomes unintelligent fast if inbound messages are not stitched into coherent account-level threads.

### Scope

Mailbox polling or webhook ingestion, thread resolution, quoted-text stripping, attachment capture, and mapping to the correct account/contact.

### Acceptance criteria

- [ ] Inbound replies are attached to the right thread
- [ ] Duplicates are ignored
- [ ] Quoted previous content is normalized for classification

### Cursor brief

Build an inbox ingest worker that reads incoming mail, resolves threads using message IDs and references headers, strips signatures and quoted history, stores cleaned body text, and links attachments into object storage. Map every reply to account, contact, campaign, and message sequence state.

---

## REPLY-207 — Implement reply classifier and next-action planner

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 8 pts |
| **Depends on** | INBOX-206, SIE-204 |
| **Status** | `backlog` |

### Why this exists

The autonomous close depends more on reply handling than on first-touch copy. The classifier consumes the account narrative from SIE-204.

### Scope

Classify replies into interested, send details, referral, wrong person, not now, legal/privacy concern, unsubscribe, out of office, and already solved. Pick deterministic next actions.

### Acceptance criteria

- [ ] Classifier outputs a label, confidence, explanation, and next action
- [ ] Unsubscribe and legal/privacy concern override every other path and suppress immediately

### Cursor brief

Build a reply service that takes cleaned inbound text plus the account narrative (SIE-204) and returns `classification`, `confidence`, `reasoning_summary`, and `next_action`. Map actions to concrete steps like open intake room, send proof explainer, snooze 30 days, update buyer rank, or suppress forever. Add a rules layer so certain intents like unsubscribe and legal concern do not depend solely on the model.

---

## SAFE-208 — Add kill switches, complaint thresholds, and automatic pauses

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | MAIL-205, REPLY-207 |
| **Status** | `backlog` |

### Why this exists

A fully autonomous outbound engine needs automatic brakes before it needs better acceleration.

### Scope

Pause by mailbox, domain, campaign, jurisdiction, source adapter, or entire system. Trigger on bounce spikes, complaint signals, or policy failures.

### Acceptance criteria

- [ ] Threshold breaches pause new sends within minutes and emit audit events
- [ ] Recovery requires explicit operator action or a bounded auto-resume policy

### Cursor brief

Create a safety service that monitors bounce rate, complaint events, mailbox health, and policy-deny surges. Add scoped pause switches at system, lane, campaign, mailbox, and domain levels. Wire the send scheduler to refuse allocations whenever any applicable pause is active.
