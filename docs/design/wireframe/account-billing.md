# Billing — Text Wireframe

**Page:** Account › Billing  
**Route:** `/account/billing`  
**Phase:** Wireframes  
**Date:** 2026-06-19  
**Source scenarios:** A3 (monthly spend), A4 (add payment), A5 (earn credits), A6 (billing forensic), S1 (stakeholder), S5 (balance alert config)

---

## Layout context

Rendered inside the Account app-shell: left sidebar with Account group navigation (`Plan & Quotas` / `Billing` [active] / `Addons` / `Account admin` / `Login policy`), topbar carrying the persistent Tier chip and live credit balance chip (both upstream chrome — not specified here). Page content fills the main content area to the right of the sidebar.

---

## Page header

```
┌─────────────────────────────────────────────────────────────┐
│  Billing                                                    │
│  Credit balance, spend history, and top-up configuration   │
│  for this account.                                          │
└─────────────────────────────────────────────────────────────┘
```

**Copy rationale:** Names both state and config concerns up front so the two-section structure is expected before the user starts scrolling. "Account" anchors the tenancy level (account-scoped credits, not workspace-scoped).

---

---

## SECTION A — State: Credit balance & spend history

```
╔═════════════════════════════════════════════════════════════╗
║  A  CREDIT BALANCE & SPEND HISTORY                         ║
╚═════════════════════════════════════════════════════════════╝
```

**Boundary treatment:** Section A opens immediately below the page header with no card or container — it is the default reading context. The section label `A  CREDIT BALANCE & SPEND HISTORY` renders as a subdued uppercase track label (small, muted foreground, letter-spaced) — structural orientation, not a heading competing with tile content. All content within Section A is read-only; no editable inputs appear here.

The visual cut between Section A and Section B is a full-width horizontal rule with a `B  TOP-UP & ALERTS CONFIGURATION` label on the right margin — same track label treatment, paired with a background shift on Section B (slightly recessed surface token, e.g. `bg-muted` or `bg-surface-2`) so the page reads "here is what happened / here is where you configure behavior" without an explicit annotation.

---

### A1 — Balance tile

*Scenario trace: A3 (balance at a glance), A5 (earn-credits entry point)*

```
┌──────────────────────────────────────────────────────────────┐
│  Credit balance                                              │
│                                                              │
│  $10.00                                                      │
│                                                              │
│  Auto top-up: OFF  [→ Configure in Top-up & alerts below]   │
│                                                              │
│  Earn free credits — 6 tasks available →                     │
└──────────────────────────────────────────────────────────────┘
```

**Anatomy:**

- **Balance amount** — `$10.00` rendered as a large numeric value (not a "hero card" with tier branding — balance only, no repeated Tier badge). The topbar chip already carries the live balance; this tile is the canonical in-page reference and carries more precision + context.
- **Auto top-up chip** — read-only inline chip labeled `Auto top-up: OFF` (or `Auto top-up: ON — tops up at $5 threshold`). The chip is not a toggle. It carries a subtle link affordance `→ Configure in Top-up & alerts below` that scrolls to Section B / B1. This closes the state/config boundary: the chip shows state, the link points to the config location. (Interaction principle #3 — status streams: the chip value reflects live account state without polling; Section B toggle is the mutating surface.)
- **Earn-credits link** — single line: `Earn free credits — 6 tasks available →`. "6" is the count of uncompleted earn-credits tasks drawn from the same data as the chrome modal (task count updates as tasks complete). Clicking opens the earn-credits chrome modal — it does not navigate or expand inline (modal is the right container per ia-proposal.md; embedding the task list here would create wizard-creep energy on a state+config surface). Link renders as standard in-line link, not a button or banner.

**Day-1 Tier 0 state (default):** Balance `$10.00` (sign-up promo). Auto top-up chip: `OFF`. Earn-credits: `6 tasks available`.  
**Post-payment-method state:** Balance reflects actual value. Auto top-up chip reflects configured threshold if enabled.  
**Loading state:** Balance shows skeleton text (single line), chip skeleton, earn-credits link skeleton — three lines, no spinner.  
**Error state:** `Credit balance unavailable — refresh to retry` inline in the tile slot, no amount rendered.

---

### A2 — Wallet composition

*Scenario trace: A3 (what makes up my balance?)*

```
┌──────────────────────────────────────────────────────────────┐
│  Wallet composition                                          │
│                                                              │
│  Wallet composition  Added on       Usage         Amount   Expiration    │
│  ───────────────────────────────────────────────────────────  │
│  🎁 Sign-up promo   Jun 17, 2026   ████░░ 0/10   $10.00   May 2027     │
│                                                              │
│  [Day-1: 1 row. Grows as top-ups and promos are added.]     │
└──────────────────────────────────────────────────────────────┘
```

**Anatomy:**

- **Columns (verbatim from current Credits page, which works):**  
  `Wallet composition` / `Added on` / `Usage` / `Amount` / `Expiration`
- **Usage column** renders an inline progress bar + fractional label (`0/10 available`) consistent with the quota progress bar pattern used on Plan & Quotas. Color encodes consumption state (green = headroom, amber = low, red = near-empty) per interaction principle #4.
- **Amount column** shows the dollar value of credits in that wallet entry.
- **Expiration column** shows the calendar date or "Never" for non-expiring entries.
- Each row type has a leading icon/label: 🎁 promo, ↑ top-up, 🛒 purchase — sources drawn from credit history `Type` values.

**Day-1 state:** 1 row — Sign-up promo / Jun 17, 2026 / 0/10 / $10.00 / May 2027.  
**Empty state (post-expiry, $0 balance):** `No active credits. Top up in the configuration section below, or earn free credits above.` — one line, no illustration.  
**Loading state:** 3 skeleton rows.  
**Error state:** `Wallet composition unavailable — refresh to retry.` Inline, replaces table.

---

### A3 — Month-to-date spend

*Scenario trace: A3 (total MTD spend), A6 (forensic: unexpected usage)*

```
┌──────────────────────────────────────────────────────────────┐
│  Month-to-date spend                                Jun 2026 │
│                                                              │
│  $0.00 total this month                                      │
│                                                              │
│  [▼ Expand breakdown]                                        │
└──────────────────────────────────────────────────────────────┘
```

**Collapsed default state:** Shows the MTD total as a single numeric line (`$0.00 total this month`). The period label (`Jun 2026`) anchors the summary to the current billing month. No chart visible by default — the expand is the entry into forensic mode. "Expand breakdown" uses a chevron affordance (`▼ Expand breakdown` / `▲ Collapse breakdown`).

---

**Expanded breakdown state** (locked operator decision — chart lives inline here, no standalone Billing explorer page):

```
┌──────────────────────────────────────────────────────────────┐
│  Month-to-date spend                                Jun 2026 │
│                                                              │
│  $0.00 total this month                                      │
│                                                              │
│  [▲ Collapse breakdown]                                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  FILTERS                                             │   │
│  │  [🌐 All workspaces ▼]  [△ All resource types ▼]    │   │
│  │  [Select a type first ▼]  (disabled until type set)  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Showing cost across all workspaces for all resource types   │
│  broken down by resource type.                               │
│                                                              │
│  [USAGE]  [COST ●]              ← tab strip                 │
│                                                              │
│  Break down by: [Resource type ▼]  [📅 This month ▼]        │
│  [🕒 Day ▼]  [▥ Stacked bar ▼]                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [Chart area — stacked bar, no data]                   │ │
│  │                                                        │ │
│  │  No billing data for Jun 2026.                         │ │
│  │  Usage will appear here once a Workspace resource      │ │
│  │  (Sandbox, Agent, Batch Job, MCP Server, Volume,       │ │
│  │  Custom Domain) generates a billable event.            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  TOTAL EXPENSE  $0.00                                        │
└──────────────────────────────────────────────────────────────┘
```

**Filter controls (verbatim from current Billing explorer — all controls preserved):**
- **Workspace filter** — `All workspaces ▼` dropdown. Content: search "Enter workspace name" / "All workspaces ✓" / per-workspace rows by slug.
- **Resource type filter** — `All resource types ▼`. Options: All resource types / Sandboxes / Agents / Batch Jobs / MCP Hosting / Volumes / Custom Domains. (Canonical vocabulary from `platform.md` — "MCP Hosting" matches the current product label; "MCP Servers" is the hosting primitive name, reviewer may align.)
- **Resource picker** — `Select a type first ▼` — disabled until resource type is chosen; then allows filtering to a specific named resource. Search requires 3+ characters (inherited limitation from current product — flag as a forensic UX sharpness for A6; does not change in this wireframe but noted).
- **Tab strip** — `USAGE` / `COST`. Default: `COST`.
- **Chart controls** — `Break down by: Resource type ▼` / `📅 This month ▼` (period) / `🕒 Day ▼` (granularity) / `▥ Stacked bar ▼` (chart type).

**Day-1 empty chart state:** "No billing data for Jun 2026. Usage will appear here once a Workspace resource (Sandbox, Agent, Batch Job, MCP Server, Volume, Custom Domain) generates a billable event." — names the resource types so Alex knows what triggers data. No illustration.  
**Populated state:** Chart renders; TOTAL EXPENSE shows the month total.  
**Loading (expand transition):** Inline skeleton behind filter controls while chart data fetches — no spinner, no navigation.  
**Error state:** `Billing data unavailable for this period — refresh to retry.` Inline in chart area slot.

---

### A4 — Credit history

*Scenario trace: A3 (reconciliation: what credits moved?)*

```
┌──────────────────────────────────────────────────────────────┐
│  Credit history                                              │
│                                                              │
│  Date           Type       Description                Amount │
│  ─────────────────────────────────────────────────────────── │
│  Jun 17, 2026   Promo      Welcome credits for           +10 │
│                            new account                       │
│                                                              │
│  [Day-1: 1 row. Grows with top-ups, usage charges, promos.] │
└──────────────────────────────────────────────────────────────┘
```

**Columns (verbatim from current Credits page):** `Date` / `Type` / `Description` / `Amount`.  
**Amount column** renders signed values: `+10` (credit added, green), `-2.50` (usage charge, red/muted). Color encodes direction per interaction principle #4.  
**Type values** (from current product): Promo / Top-up / Purchase / Usage. Exact values inherited — do not rename.  
**Pagination / load-more:** If history exceeds ~10 rows, a `Load more` inline trigger appends additional rows (no full pagination nav — this is a supporting surface, not a primary data exploration tool).

**Day-1 state:** 1 row — Jun 17, 2026 / Promo / Welcome credits for new account / +10.  
**Empty state (new account, promo already showing in wallet):** This state should not occur in practice given the sign-up promo always creates a history row. If it somehow has no history: `No credit history yet.` — one line.  
**Loading state:** 3 skeleton rows.  
**Error state:** `Credit history unavailable — refresh to retry.`

---

### A5 — Invoices

*Scenario trace: A3 (monthly reconciliation), S1 (stakeholder billing view)*

```
┌──────────────────────────────────────────────────────────────┐
│  Invoices                                                    │
│                                                              │
│  Date           Status      Amount    Invoice               │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  No invoices yet.                                            │
│  Invoices are generated at the end of each billing period   │
│  once charges exceed your credit balance.                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Columns (verbatim from current Invoices page):** `Date` / `Status` / `Amount` / `Invoice`.  
**Invoice column** renders a `↓ Download` link per row (PDF). Status values: Paid / Open / Draft — color-encoded per interaction principle #4 (Paid = muted/default; Open = amber; Draft = muted).

**Day-1 empty state copy:** `No invoices yet. Invoices are generated at the end of each billing period once charges exceed your credit balance.` — honest about the trigger condition; no illustration, no CTA.  
**Populated state:** Table rows, most-recent first.  
**Loading state:** 3 skeleton rows.  
**Error state:** `Invoices unavailable — refresh to retry.`

---

---

## SECTION B — Config: Top-up & alerts configuration

```
╔══════════════════════════════════════════════════════════════╗
║  B  TOP-UP & ALERTS CONFIGURATION                           ║
╚══════════════════════════════════════════════════════════════╝
```

**Boundary treatment:** A full-width horizontal divider rule above this section label marks the explicit boundary. The section body sits on a subtly recessed background surface (`bg-muted` or equivalent muted token) to signal "this is where you change behavior." The section label uses the same track-label treatment as Section A — orientation, not a content heading. All regions in Section B carry editable controls. The form-actions pattern applies: Save controls per subsection are always visible and enabled; they are not shown in this wireframe at field level (handled by the form-actions design guideline — no Cancel unless the field is dirty).

---

### B1 — Auto top-up

*Scenario trace: A4 (top-up configuration), S5 (implicit — Sam may configure this too)*

```
┌──────────────────────────────────────────────────────────────┐
│  Auto top-up                                                 │
│                                                              │
│  Automatically top up when your balance drops below a        │
│  threshold.                                                  │
│                                                              │
│  [Toggle: OFF]                                               │
│                                                              │
│  Top up when balance drops below:   [ $_____ ]              │
│  Amount to top up:                  [ $_____ ]              │
│                                                              │
│  ⓘ  Top-ups are charged to your default payment method.     │
│     [Add payment method →]  (shown if no payment method)    │
│                                                              │
│  [Save]                                                      │
└──────────────────────────────────────────────────────────────┘
```

**Anatomy:**
- **Toggle** — `OFF` / `ON` (binary). When OFF, the threshold and amount fields are visible but disabled (greyed out) — Alex can see the config shape without committing payment. This resolves the current product's friction of hiding the threshold fields behind the payment method gate (audit.md § 7: "Alex can't see what the config looks like before committing a payment method").
- **Threshold field** — `Top up when balance drops below: $___` — numeric input, dollar-denominated.
- **Amount field** — `Amount to top up: $___` — numeric input.
- **Payment method note** — inline informational copy if payment method is not on file: `Top-ups are charged to your default payment method.` + `Add payment method →` link (scrolls to B4 / Payment method). If payment method is on file, the note reads: `Top-ups are charged to Visa ending 4242.` — shows current state, no link needed.

**Tier-gated state (no payment method, Tier 0):** Toggle is visible and toggleable (the user can *see* what they'd configure). Clicking Save with no payment method shows inline validation: `Payment method required to enable auto top-up. Add a payment method below.` — does not redirect, does not block the form.  
**Enabled state:** Toggle ON, fields editable, values persisted. Auto top-up chip in Section A / A1 updates to reflect the configured threshold (e.g. `Auto top-up: ON — tops up at $5`).

---

### B2 — Monthly top-up

*Scenario trace: A4 (scheduled top-up option)*

```
┌──────────────────────────────────────────────────────────────┐
│  Monthly top-up                                              │
│                                                              │
│  Schedule a fixed credit top-up every month.                │
│                                                              │
│  [Toggle: OFF]                                               │
│                                                              │
│  Amount to top up each month:  [ $_____ ]                   │
│                                                              │
│  ⓘ  Top-ups are charged to your default payment method      │
│     on the first of each month.                             │
│                                                              │
│  [Save]                                                      │
└──────────────────────────────────────────────────────────────┘
```

**Anatomy:**
- **Toggle** — `OFF` / `ON`. When OFF, amount field visible but disabled (same pattern as B1).
- **Amount field** — `Amount to top up each month: $___`.
- **Schedule note** — `Top-ups are charged to your default payment method on the first of each month.` Anchors the billing cadence.

**Relationship to B1:** Auto top-up and Monthly top-up are independent toggles. They can both be on simultaneously (auto triggers on balance drop; monthly triggers on calendar). No mutual-exclusion; no coupling affordance needed.

---

### B3 — Balance alerts

*Scenario trace: S5 (configure balance alert — primary); A6 (indirect: being alerted to unexpected spend)*

```
┌──────────────────────────────────────────────────────────────┐
│  Balance alerts                                              │
│                                                              │
│  Receive an email notification when your credit balance      │
│  drops below these thresholds.                               │
│                                                              │
│  Sent to the account Owner + all account Admins.            │
│  Not configurable per-user — this is an account-level       │
│  operational alert, not a personal subscription.            │
│  To manage your personal email subscriptions, go to         │
│  Profile → Notifications.                                    │
│                                                              │
│  ⚠  Alert configuration is coming soon. You will currently  │
│     receive automatic alerts at these thresholds:           │
│                                                              │
│  [●] Alert at    5 credits                                  │
│  [●] Alert at   10 credits                                  │
│  [●] Alert at   20 credits                                  │
│  [●] Alert at   50 credits                                  │
│  [●] Alert at  100 credits                                  │
│  [●] Alert at  500 credits                                  │
│  [●] Alert at 1,000 credits                                 │
│                                                              │
│  (Toggles are read-only until configuration ships.)         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Anatomy:**

**Recipient routing copy (locked constraint — must appear verbatim or nearly verbatim):**
```
Sent to the account Owner + all account Admins. Not configurable
per-user — this is an account-level operational alert, not a
personal subscription. To manage your personal email
subscriptions, go to Profile → Notifications.
```

**Rationale for surfacing this explicitly:** The audit (§9) noted that balance alerts are currently shown without explaining who receives them or distinguishing them from per-user Profile → Notifications. This copy surfaces both facts on first read, so Sam (S5) understands the routing before relying on it, and so Alex doesn't confuse "configure alerts" with "manage my own email preferences."

**Coming-soon state (current product parity):** The `⚠ Alert configuration is coming soon` info bar matches the current product's honesty about the feature state, moved here from the Credits page. Toggle rows rendered with `[●]` visual (filled, non-interactive) to show current fixed thresholds. Inline note: `Toggles are read-only until configuration ships.`

**Future-shipped state (when feature ships):** Replace the info bar + read-only note with:
- `[+ Add threshold]` CTA to add a custom credit threshold.
- Per-row toggle to enable/disable each threshold individually.
- A "Save" action per row or a Save for the full list (form-actions guideline applies).
- The existing fixed thresholds become user-editable starting points.

---

### B4 — Payment method

*Scenario trace: A4 (add/update payment method — the primary unlock action)*

```
┌──────────────────────────────────────────────────────────────┐
│  Payment method                                              │
│                                                              │
│  [No payment method on file]                                 │
│  Adding a payment method unlocks Tier 1 — enabling          │
│  Volumes, Policies, Custom Domains, Cron triggers, and       │
│  Revisions.                                                  │
│                                                              │
│  [Update payment method →]   (redirects to Stripe)          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**State variants:**

**No payment method (Day-1 Tier 0 default):**
```
  Payment method
  ─────────────
  No payment method on file.
  Adding a payment method unlocks Tier 1 — enabling
  Volumes, Policies, Custom Domains, Cron triggers,
  and Revisions.

  [Update payment method →]   (redirects to Stripe)
```
The Tier 1 unlock copy is specific and actionable, resolving the current product's gap (audit.md § 4: "none of these CTAs explain what tier unlocking means"). It lists the concrete primitives Alex cares about — not abstract "more features."

**Payment method on file:**
```
  Payment method
  ─────────────
  Visa ending 4242

  [Update payment method →]   (redirects to Stripe)
```
Current state is visible before the redirect (resolves audit.md § 4: "user can't check whether a payment method is on file without going to Stripe"). The CTA now says "Update" (not "Add") — copy adapts to state.

**Loading state:** `Payment method` label visible; value shows skeleton text while status fetches.  
**Error state:** `Payment method status unavailable — refresh to retry.` One line.

**Stripe redirect behavior:** Clicking `Update payment method →` opens Stripe's hosted payment page. On return (success or cancel), the page reloads Section B / B4 with the new state reflected. No in-product payment form — Stripe is the editing surface.

---

---

## Empty state — Day-1 Tier 0 full-page summary

Assembled read-through of every region for a fresh account (the `$10` sign-up promo state, no invoices, no MTD spend, no payment method):

```
Billing
Credit balance, spend history, and top-up configuration for this account.

── A  CREDIT BALANCE & SPEND HISTORY ────────────────────────────────────

  Credit balance
  $10.00
  Auto top-up: OFF  → Configure in Top-up & alerts below
  Earn free credits — 6 tasks available →

  Wallet composition
  🎁 Sign-up promo  Jun 17, 2026  ████░ 0/10  $10.00  May 2027

  Month-to-date spend                           Jun 2026
  $0.00 total this month
  [▼ Expand breakdown]

  Credit history
  Jun 17, 2026  Promo  Welcome credits for new account  +10

  Invoices
  No invoices yet. Invoices are generated at the end of each billing
  period once charges exceed your credit balance.

─────────────────────────────────────── B  TOP-UP & ALERTS CONFIGURATION ─

  Auto top-up
  Automatically top up when your balance drops below a threshold.
  [Toggle: OFF]
  Top up when balance drops below:  [        ]   (disabled)
  Amount to top up:                 [        ]   (disabled)
  ⓘ Top-ups are charged to your default payment method.
     Add payment method →
  [Save]

  Monthly top-up
  Schedule a fixed credit top-up every month.
  [Toggle: OFF]
  Amount to top up each month:  [        ]   (disabled)
  ⓘ Top-ups are charged to your default payment method on the first
     of each month.
  [Save]

  Balance alerts
  Receive an email notification when your credit balance drops below
  these thresholds.
  Sent to the account Owner + all account Admins. Not configurable
  per-user — this is an account-level operational alert, not a personal
  subscription. To manage your personal email subscriptions, go to
  Profile → Notifications.
  ⚠ Alert configuration is coming soon. You will currently receive
    automatic alerts at these thresholds:
  [●] Alert at    5 credits
  [●] Alert at   10 credits
  [●] Alert at   20 credits
  [●] Alert at   50 credits
  [●] Alert at  100 credits
  [●] Alert at  500 credits
  [●] Alert at 1,000 credits
  (Toggles are read-only until configuration ships.)

  Payment method
  No payment method on file.
  Adding a payment method unlocks Tier 1 — enabling Volumes,
  Policies, Custom Domains, Cron triggers, and Revisions.
  [Update payment method →]
```

---

## Scenario verification gate

| Scenario | Wireframe answer | Region |
|---|---|---|
| **A3 (2 min: what did I spend this month?)** | Section A balance tile ($10.00) + MTD spend summary ($0.00) are both above the fold without scrolling. Expand breakdown gives the full chart inline. All on one page. | A1, A3 |
| **A4 (one action: add a payment method)** | Section B / B4 Payment method row shows current state + `Update payment method →` CTA in a single action. Stripe redirect is one click. | B4 |
| **A5 (one click: earn free credits)** | Section A / A1 balance tile carries `Earn free credits — 6 tasks available →` — one click opens the chrome modal. | A1 |
| **A6 (forensic: unexpected usage?)** | Section A / A3 MTD breakdown — expand → resource type filter → workspace filter. Full chart with per-resource-type breakdown. A6 path: expand → filter resource type → filter workspace → read chart. | A3 (expanded) |
| **S1 (stakeholder: billing overview)** | Section A surfaces balance, wallet composition, MTD spend, credit history, and invoices — all in one scroll without navigating multiple pages. | A1–A5 |
| **S5 (one action: configure balance alert)** | Section B / B3 Balance alerts — scoped as config, explicitly separated from state by the section boundary. Current state: fixed thresholds displayed read-only until feature ships. | B3 |

---

## Verification gate self-check

1. **State before config, reading top-to-bottom** — Section A (all read-only state) is the first and dominant scroll region. Section B (all editable config) starts only after the explicit horizontal divider + section label. PASS.
2. **Balance appears exactly once** — `$10.00` appears only in Section A / A1 balance tile. It is not repeated in a hero card on B4, not in the MTD tile, not in the wallet table. The topbar credit chip is outside this page's scope (chrome, not page content). PASS.
3. **Every region has a one-line scenario trace** — each subsection (A1–A5, B1–B4) carries an explicit `Scenario trace:` annotation. PASS.
4. **Day-1 Tier 0 empty states explicitly drawn** — full-page Day-1 assembly in "Empty state — Day-1 Tier 0 full-page summary" above covers: balance $10.00 promo, single wallet row, $0.00 MTD, single credit history row, empty invoices, all Section B toggles OFF with fields disabled, no payment method on file. PASS.

---

## Decisions for operator review

1. **Balance alerts — coming-soon read-only state:** The wireframe preserves the current product's read-only toggle display for the balance alerts thresholds with an honest "coming soon" info bar. No functional change is implied. When the feature ships, the "future-shipped state" spec in B3 is the intended design. Operator to confirm this is the right holding pattern vs. hiding the section entirely until ship.

2. **MTD resource picker 3-character minimum (A6 forensic sharpness):** The current Billing explorer requires 3+ characters in the resource picker and "exact name" lookup. This is a forensic UX sharpness for A6 (Alex looking for unexpected usage by a resource she can't name exactly). The wireframe notes it but does not change it — this is a product/data-layer decision, not a layout decision. Flagging for operator awareness.

3. **Section B background treatment:** The wireframe specifies a `bg-muted` surface shift for Section B. The exact token (whether this is a color-band, a slightly elevated card, or a recessed inset) depends on the design-token layer. The constraint is: the reader must perceive a distinct "I am now in a different contract (configuring vs. reading)" without an explicit annotation. Token assignment deferred to design-token phase.
