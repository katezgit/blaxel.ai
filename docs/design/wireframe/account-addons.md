# Wireframe — Account / Add-ons

Surface: Account settings → Add-ons
Persona: Sam (primary on this page), Alex (incidental — never acts here)
Scenario satisfied: S4 (HIPAA compliance evaluation, one-time, 5 min)
Phase: wireframe (pre-spec)
Status: DRAFT — tier requirements per add-on are PLACEHOLDERS (see flagged items)

---

## Layout context

Sits inside the Account settings shell. Left sidebar shows the Account group:
Plan & Quotas / Billing / **Add-ons** (active) / Account admin / Login policy.
No topbar changes for this page; tier chip + balance chip in topbar remain persistent per IA proposal § Tier/balance in chrome.

---

## Page structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Account group sidebar]  │  [Page content]                     │
│                           │                                     │
│  Plan & Quotas            │  Add-ons                            │
│  Billing                  │  Paid capabilities you can attach   │
│  › Add-ons  (active)      │  to your account, billed separately │
│  Account admin            │  from credit usage.                 │
│  Login policy             │                                     │
│                           │  ─────────────────────────────────  │
│                           │                                     │
│                           │  [Card: Premium support]            │
│                           │                                     │
│                           │  [Card: Dedicated support]          │
│                           │                                     │
│                           │  [Card: HIPAA compliance]           │
│                           │                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Page header

```
Add-ons
Paid capabilities you can attach to your account, billed separately from credit usage.
```

**Copy rationale**: "Add-ons" (hyphenated) is the conventional form; the page title is not stylized. The subtitle makes explicit that these are account-level (not workspace-level) and billed outside the credit balance — the two gaps identified in audit § 6.

---

## Card anatomy (applies to all three cards)

Each card renders as a horizontal row, not a visual card panel. Using a divider-separated row list, not a boxed card container — per card-usage guideline: add-ons are not discrete actionable objects with peer identity that the user browses simultaneously; they are a short list of account capabilities. A list with section dividers is the correct container. (Exception note: the current live page uses cards; this wireframe moves to a structured list.)

> **Designer note**: if the operator prefers to retain the visual card container (for visual weight on a page that would otherwise be very sparse), that is an acceptable operator call — the content contract below applies identically either way.

Each row contains, in order:

```
[Icon]  [Add-on name]                           [$price/mo]   [CTA button]
        [1-line description]
        [Tier requirement line]
        [Billing model line]
```

**Field specs:**

- **Icon**: existing icon from current live page (unchanged)
- **Add-on name**: verbatim from current live page
- **Price**: `$XXX/mo` — right-aligned, same row as name
- **CTA button**: right-aligned, same row as price — primary action (see per-card spec below)
- **1-line description**: see per-card spec below
- **Tier requirement**: `Available on all tiers` OR `Requires Tier N+` — PLACEHOLDER, see flagged items
- **Billing model**: `Billed monthly to your account, separate from credit balance.` — identical on all three cards

---

## Card 1: Premium support

```
[icon]  Premium support                              $500/mo   [Add to account]
        Priority support for teams that need faster responses.
        Available on all tiers  ← PLACEHOLDER
        Billed monthly to your account, separate from credit balance.
```

**CTA**: `Add to account` — assumes direct purchase without sales involvement. Flag for operator confirmation (see flagged items).

---

## Card 2: Dedicated support

```
[icon]  Dedicated support                          $1,000/mo   [Add to account]
        A dedicated support contact for production teams with advanced needs.
        Available on all tiers  ← PLACEHOLDER
        Billed monthly to your account, separate from credit balance.
```

**CTA**: `Add to account` — same assumption as Premium support. Flag for operator confirmation.

**Description note**: minor copy expansion from current ("Dedicated support for production teams with advanced needs" → "A dedicated support contact for production teams with advanced needs") to clarify what "dedicated" means (a named contact, not just priority routing). Operator may keep original.

---

## Card 3: HIPAA compliance

```
[icon]  HIPAA compliance                             $500/mo   [Contact sales]
        Run eligible workloads with HIPAA compliance support.
        BAA-eligible. Contact sales to confirm scope of covered services.
        Requires Tier N+  ← PLACEHOLDER
        Billed monthly to your account, separate from credit balance.
```

**CTA**: `Contact sales` — HIPAA compliance almost certainly requires a Business Associate Agreement (BAA), which is a sales/legal handoff, not a self-serve purchase. Self-serve `Add to account` would be a compliance risk and an incorrect product flow. Flag for operator confirmation.

**Description expanded**: The current one-liner ("Run eligible workloads with HIPAA compliance support") does not tell Sam (S4) what "compliance support" actually means. Sam needs to know whether a BAA is included, what workload types are covered, and who to contact. Proposed expansion:

```
Run eligible workloads with HIPAA compliance support.
BAA-eligible. Contact sales to confirm scope of covered services.
```

Two lines: the first preserves the current description verbatim; the second adds the BAA signal and routes Sam to the right next step. Sam's S4 question ("what does it include, what does it cost, how do I turn it on") is now answerable from the card without leaving the page.

**Pricing note**: The personas.md source cites $250/mo for HIPAA compliance (sourced from blaxel.ai/pricing). The current live product shows $500/mo on the Addons page. This is a discrepancy the operator should resolve before screen-spec. Wireframe uses $500/mo (current live page value) as the ground truth; flag for operator confirmation.

---

## States

### Default (no add-ons active)

All three cards show as above. CTA is `Add to account` or `Contact sales` per card.

### Active add-on state

When an add-on is active on the account, the card row reflects it:

```
[icon]  Premium support                              $500/mo   [Active ✓]
        Priority support for teams that need faster responses.
        Available on all tiers
        Billed monthly to your account, separate from credit balance.
        Active since [date]  ← additional line when active
```

- CTA changes to a static `Active` indicator (not a button) or a `Manage` / `Cancel` secondary action. Exact pattern TBD at screen-spec phase.
- "Active since [date]" appends below the billing model line.

### Loading state

Page renders the header immediately. Cards render as skeleton rows (same height as content rows) while add-on status loads. Three rows of skeleton content.

### Error state

If add-on status fails to load:

```
Add-ons
Paid capabilities you can attach to your account, billed separately from credit usage.

Could not load add-on status. The catalog is shown below; your current add-on state may not be reflected.
[Retry]

[Cards render with CTAs disabled, greyed — price and description still visible]
```

Tone per personality.md (Disciplined): cause stated, action offered. No apologetic copy.

### Empty state

Not applicable — the add-on catalog is static. There is no state where the list is empty.

---

## Tone and copy notes

- **Factual, not promotional.** No "Unlock the full power of…", no "Enterprise-grade…" superlatives. The descriptions state what the add-on does; Sam reads them as a spec, not a sales deck. Personality.md (Disciplined): "Serious enough that Sam's auditor reads it unedited."
- **Account-level clarity explicit.** The subtitle and the billing model line both say "account" — reinforcing that these are not workspace-level settings. Addresses the account/workspace ambiguity flagged across multiple audit sections.
- **No tier-gating on this page.** Add-ons are available to purchase regardless of tier (subject to per-add-on tier requirements on the card itself). There is no locked/blurred state for the page. Per hard constraints: no tier gate on the Add-ons page itself.

---

## i18n bug

**Production defect — not designed around.** The current live page displays raw i18n keys (`app.core.account.AddonsPage.title`, `app.core.account.AddonsPage.card.renews_monthly`) instead of localized strings. This wireframe assumes all strings render correctly. The defect is an engineering fix — the translation key for the page title maps to "Add-ons" and the renewal key maps to "Renews monthly" (or is replaced by the explicit billing model line in this redesign). Flag for engineer to fix in the implementation ticket.

---

## Verification gate self-check

- [x] **S4 satisfied**: Sam lands on HIPAA card → sees tier requirement (placeholder, but explicit), billing model (explicit one line), scope (description + BAA line), and CTA (`Contact sales`). 10-second read answers her question.
- [x] **Tier + billing model on every card**: all three cards include both lines.
- [x] **Tone**: factual throughout. No promotional language. Descriptions are spec-lines, not marketing copy.
- [x] **i18n bug**: flagged separately, not designed around.
- [x] **Vocabulary**: "Account" used throughout (not "org", "tenant", "organization"). "Add-ons" hyphenated per constraint.
- [x] **Inheritance**: page sits in Account settings shell per IA proposal § 1.3 and sidebar structure summary. No structural changes to shell.
- [x] **States**: default, active, loading, error covered. Empty N/A.
- [x] **Drift**: list-row layout replaces card panel — rationale stated. Operator may override.

---

## Operator status (2026-06-19)

**Resolved:**
- **HIPAA price**: $500/mo confirmed as current (matches live UI; personas.md $250/mo figure is stale). Wireframe stays at $500/mo. ✓
- **Tier requirement per add-on**: **deferred** by operator. Placeholder line stays in each card; the actual tier mapping will be filled at screen-spec or implementation phase. Do not block on this. ✓

**Still flagged (low-priority, resolve before or during screen-spec):**

1. HIPAA CTA: wireframe assumes `Contact sales` (BAA requirement). Confirm.
2. Premium / Dedicated support CTAs: wireframe assumes `Add to account` (self-serve). Confirm.
3. "Active since [date]" field availability — confirm API exposes activation timestamp.
4. Dedicated support description copy expansion ("A dedicated support contact for…") — operator may revert to original.
