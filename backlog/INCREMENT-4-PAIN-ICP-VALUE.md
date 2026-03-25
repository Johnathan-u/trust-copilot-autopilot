# Increment 4 — Pain, ICP & value reasoning

**Goal:** Score every account on fit, urgency, monetization probability, and deal value so the system prioritizes like a thoughtful sales rep.

**Exit criteria:** Every account with fused signals gets ICP score, pain type, urgency score, value estimate, and micro-segment — all explainable with evidence references.

**Tickets:** 6  
**Replaces:** DISC-105

---

## SIE-301 — Build firmographic estimator

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 5 pts |
| **Depends on** | SIE-203 |
| **Status** | `backlog` |

### Why this exists

ICP scoring needs a minimum firmographic layer — company type, industry, size band, go-to-market motion — estimated from public evidence without paid enrichment.

### Scope

Estimate company type, likely industry, rough size band, and go-to-market motion from public evidence.

### Acceptance criteria

- [ ] Estimator outputs industry, size band, B2B/B2C likelihood, and enterprise-motion likelihood with confidence
- [ ] Tests cover edge cases

### Cursor brief

Create a firmographic estimator using deterministic website/job/post clues. Output normalized size_band, product_motion, target_customer_motion, and confidence scores. Keep the estimator explainable and evidence-backed.

---

## SIE-302 — Infer likely pain types

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-203, SIE-301 |
| **Status** | `backlog` |

### Why this exists

Generic "they might need compliance help" is not enough. The system needs to infer the specific pain: questionnaire overload, first enterprise review friction, evidence chaos, trust center pressure, or compliance process scaling.

### Scope

Infer specific trust/compliance pain types from fused signals and firmographics.

### Acceptance criteria

- [ ] At least 5 pain types are supported
- [ ] Each pain inference cites fused signals and firmographic evidence

### Cursor brief

Implement a pain inference service that maps fused signals + firmographics into one or more pain types with confidence and evidence references. Keep outputs bounded to a controlled enum.

---

## SIE-303 — Score ICP fit

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-301, SIE-302 |
| **Status** | `backlog` |

### Why this exists

The system needs to know whether the account is in-bounds for the product before spending any contact budget.

### Scope

Score whether the account is in-bounds based on company type, size, likely budget, motion, and expected sales-cycle fit.

### Acceptance criteria

- [ ] ICP score exists on snapshot
- [ ] Blocked and marginal accounts are distinguishable
- [ ] Thresholds are configurable

### Cursor brief

Implement deterministic ICP scoring with weighted factors for B2B SaaS fit, size band, enterprise motion, likely budget, and mismatch penalties. Return score, bucket, and matched rule breakdown.

---

## SIE-304 — Estimate urgency and monetization probability

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-302, SIE-303, SIE-205 |
| **Status** | `backlog` |

### Why this exists

Timing and fit are separate dimensions. High-fit/low-timing and low-fit/high-timing accounts need different treatment.

### Scope

Estimate how likely the account is to act now and how likely it is to convert if contacted. Keep separate from ICP.

### Acceptance criteria

- [ ] Urgency score and monetization probability are stored separately
- [ ] Tests cover high-fit/low-timing and low-fit/high-timing cases

### Cursor brief

Create an urgency and monetization scorer that combines pain type, why-now freshness, ICP fit, and negative signals. Output separate scores with explanation fields rather than a single opaque number.

---

## SIE-305 — Estimate deal tier and expected value

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-301, SIE-304 |
| **Status** | `backlog` |

### Why this exists

When capacity is limited, the system should prioritize accounts with higher expected value. This needs a value estimate, not just a fit score.

### Scope

Predict likely monthly plan fit and simple lifetime value bracket.

### Acceptance criteria

- [ ] Expected monthly value and value bucket are computed
- [ ] Prioritization can sort by expected_value × win_probability

### Cursor brief

Implement a value estimator using company size band, likely questionnaire volume proxy, and monetization probability. Return monthly_value_estimate, LTV_bucket, and explanation fields.

---

## SIE-306 — Add micro-segmentation

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Estimate** | 3 pts |
| **Depends on** | SIE-302, SIE-303, SIE-305 |
| **Status** | `backlog` |

### Why this exists

Segments like "early-SOC2 startup," "post-funding upmarket push," "trust-center launch," and "hiring-led compliance scale-up" drive message strategy. Without them, every message sounds the same.

### Scope

Segment leads into smaller buckets that drive message strategy downstream.

### Acceptance criteria

- [ ] Every contactable account lands in one primary segment
- [ ] Segment definition config exists
- [ ] Downstream services can query segment keys

### Cursor brief

Create a micro-segmentation service that maps account state to a controlled segment enum with segment reasons. Store primary_segment and alternates on the account feature snapshot.
