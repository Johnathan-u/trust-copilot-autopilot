# Increment 5 — Buyer & contact reasoning

**Goal:** Resolve who to contact, with what confidence, and whether to contact at all — before any message is composed.

**Exit criteria:** Every scored account has ranked buyer candidates with evidence, a fallback chain, competitor-aware positioning, a contact/no-contact decision with reason codes, and account memory for re-contact logic.

**Tickets:** 6  
**Replaces:** DISC-106, DISC-107

---

## SIE-401 — Build public-site buyer resolver

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-107, SIE-301 |
| **Status** | `backlog` |

### Why this exists

Autonomy breaks if the wrong person gets the email. The system needs ranked buyer candidates with evidence and confidence from public sources.

### Scope

Resolve likely buyers from company pages and structured clues. Prioritize founder, CTO, VP Engineering, Head of Security, and GRC/Compliance roles based on company stage and pain type.

### Acceptance criteria

- [ ] Resolver outputs candidate buyers with role, source evidence, confidence, and fallback order
- [ ] Site pages and metadata are both used

### Cursor brief

Implement a buyer resolver that scans team/about pages, leadership snippets, author bylines, and structured data for target roles. Return a ranked candidate list with evidence URLs and confidence.

---

## SIE-402 — Create role-to-pain buyer psychology map

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-302, SIE-401 |
| **Status** | `backlog` |

### Why this exists

"CTO" is the right buyer for some pains and the wrong buyer for others. This map makes the system act like a sales rep, not a simple role matcher.

### Scope

Encode which roles care about which pain types and why. Make this versioned and queryable.

### Acceptance criteria

- [ ] Role-to-pain map is versioned
- [ ] Resolver can explain why a certain role was chosen first
- [ ] Tests cover multiple pain-role scenarios

### Cursor brief

Create a versioned mapping from pain types and company stage to buyer priorities. The service should output primary_buyer_role, secondary_roles, and reasoning strings grounded in the map.

---

## SIE-403 — Add contact confidence and fallback chain

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-401, SIE-402 |
| **Status** | `backlog` |

### Why this exists

Even before email enrichment is perfect, the system needs to know who is first choice, second choice, and when to stop trying.

### Scope

Convert buyer hypotheses into a fallback contact strategy with ranked candidates and stop conditions.

### Acceptance criteria

- [ ] Candidate contacts include fallback rank, confidence, and stop conditions
- [ ] One account can expose an ordered contact plan

### Cursor brief

Implement a contact plan builder that turns buyer candidates into an ordered fallback chain. Include rank, confidence, role fit, and stop rules so only one coherent outreach plan exists per account.

---

## SIE-404 — Add competitor presence detection

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-201, SIE-203 |
| **Status** | `backlog` |

### Why this exists

Public signs that the account already uses competitors should not always block outreach, but must change positioning and sometimes priority.

### Scope

Detect public signs that the account already uses or references competitors or adjacent tools. Output effect on strategy.

### Acceptance criteria

- [ ] Competitor detection supports a curated list
- [ ] Outputs presence type and confidence
- [ ] Message strategy can read it

### Cursor brief

Create competitor detection rules over site content, docs, and public posts. Output competitor_name, evidence_url, confidence, and whether the effect is block, soften, or reposition.

---

## SIE-405 — Build contact decision engine

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-304, SIE-305, SIE-403, SIE-404 |
| **Status** | `backlog` |

### Why this exists

This is the actual sales decision: contact or not, who first, priority tier, and timing window. It combines all upstream intelligence into one deterministic call.

### Scope

Combine fit, urgency, value, negatives, and buyer confidence into a final contact/no-contact decision with reason codes and priority tier.

### Acceptance criteria

- [ ] Every account gets a contact_decision with reason codes
- [ ] No-contact cases are explainable
- [ ] Priority tiers are sortable

### Cursor brief

Implement the contact decision engine as deterministic logic first. Combine ICP fit, urgency, expected value, negative signals, competitor state, and buyer confidence. Persist final status, priority_tier, target_role, send_window_hint, and reason codes.

---

## SIE-406 — Add account memory and re-contact logic

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-405 |
| **Status** | `backlog` |

### Why this exists

The system must remember prior contact, replies, snoozes, objections, and significant new triggers so it behaves consistently over time.

### Scope

Remember prior outcomes and future re-contact conditions so the system does not feel robotic.

### Acceptance criteria

- [ ] Account memory supports snooze_until, last_outcome, objection tags, and reactivation triggers
- [ ] Contact decision reads memory before green-lighting outreach

### Cursor brief

Create an account memory service that stores prior outcomes and future re-contact conditions. Update contact decisions so memory can block, delay, or re-enable outreach when meaningful new triggers arrive.
