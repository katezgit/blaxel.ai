# Wireframe — Plan & Quotas
**Path:** Account > Plan & Quotas
**Status:** Draft — 2026-06-19
**Scenario coverage:** A1 (10s headroom check), A2 (unlock feature, one action), S1 (stakeholder view, expand)

---

## Page anatomy — top-to-bottom

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TOPBAR (persistent — not part of this page spec)                           │
│  [...] [Tier 0]  [$10.00 ●]  [avatar]                                       │
│  Tier badge links here. Balance links to Billing.                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  REGION A — PAGE HEADER                                                     │
│                                                                             │
│  Plan & Quotas                                           [Tier 0]           │
│  ─────────────────────────────────────────────────                          │
│  Current usage and limits for this workspace.                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  REGION B — TIER SUMMARY STRIP  (above the fold — always visible)          │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ Sandboxes        │  │ Agents / MCPs /  │  │ Concurrent RAM   │          │
│  │ concurrent       │  │ Jobs             │  │ (Batch Jobs)     │          │
│  │                  │  │                  │  │                  │          │
│  │   0 / 10         │  │   1 / 5          │  │   0 / 4 GB       │          │
│  │   ████░░░░░░ 0%  │  │   ████████░░ 20% │  │   ████░░░░░░ 0%  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                             │
│  Three metric tiles. No card chrome — three adjacent stat blocks.           │
│  Progress bar color: neutral at <70%, warning at ≥70%, critical at ≥90%.   │
│  Values: current / limit, e.g. "0 / 10". No decimal padding.               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  REGION C — CURRENT QUOTA USAGE  (primary content; above fold on all        │
│             breakpoints when Regions A+B are ~120px combined)               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SANDBOXES                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Sandboxes (concurrent)       0 / 10   ████░░░░░░░░  0%            │   │
│  │  Sandboxes (total)            0 / 10   ████░░░░░░░░  0%            │   │
│  │  Sandbox max lifetime         7 days   ──────────── (tier ceiling) │   │
│  │  Memory (MiB) per instance   4,096 MiB ──────────── (tier ceiling) │   │
│  │                                                                     │   │
│  │  VOLUMES                                                            │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Volumes                      Not included                         │   │
│  │                               Tier 1 required — add payment        │   │
│  │                               method to unlock  [Add payment →]   │   │
│  │  Volume storage               Not included                         │   │
│  │                                                                     │   │
│  │  AGENT DRIVE                                                        │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Agent Drives                 Not included                         │   │
│  │                               Tier 1 required — add payment        │   │
│  │                               method to unlock  [Add payment →]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AGENTS HOSTING                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Agents                       1 / 5    ████████░░░░  20%           │   │
│  │  Private previews             Not included                         │   │
│  │                               Tier 1 required — add payment        │   │
│  │                               method to unlock  [Add payment →]   │   │
│  │  Revisions per deployment     Not included                         │   │
│  │                               Tier 1 required — add payment        │   │
│  │                               method to unlock  [Add payment →]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  MCP SERVERS HOSTING                                                │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  MCP Servers                  1 / 5    ████████░░░░  20%           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  BATCH JOBS                                                         │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Batch Jobs (concurrent)      1 / 5    ████████░░░░  20%           │   │
│  │  Concurrent RAM (Jobs)        0 / 4 GB ████░░░░░░░░  0%            │   │
│  │  Job timeout (max)            1 hour   ──────────── (tier ceiling) │   │
│  │  Cron triggers                Not included                         │   │
│  │                               Tier 1 required — add payment        │   │
│  │                               method to unlock  [Add payment →]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  MODEL APIS                                                         │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  (Model API rows: limits if applicable on Tier 0)                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  NETWORKING                                                         │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Custom domains               Not included                         │   │
│  │                               Tier 3 required — contact us for     │   │
│  │                               upgrade options  [Contact us →]      │   │
│  │  Logs retention               3 days   ──────────── (tier ceiling) │   │
│  │  Unlimited sandbox runtime    Not included (7d max on Tier 0)      │   │
│  │                               Tier 2 required — see Compare tiers  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SECURITY                                                           │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Policies                     Not included                         │   │
│  │                               Tier 1 required — add payment        │   │
│  │                               method to unlock  [Add payment →]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  WORKLOAD ADMIN                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Workspaces                   1 / 1    ████████████  100%  ⚠        │   │
│  │                               Tier 1 required — add payment        │   │
│  │                               method to create up to 5 workspaces  │   │
│  │                               [Add payment →]                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  REGION D — TIER COMPARISON (collapsed by default)                          │
│                                                                             │
│  [▶ Compare all tiers]                                                      │
│                                                                             │
│  ── collapsed state: control only, no table visible ──                      │
│                                                                             │
│  ── expanded state: ───────────────────────────────────────────────────  ── │
│                                                                             │
│  Compare all tiers                                        [▼ Collapse]      │
│  ─────────────────────────────────────────────────────────────────────      │
│                                                                             │
│  ┌──────┬──────────────────────┬──────────────────────┬──────────────┐     │
│  │ Tier │ Requirement          │ Key Quotas           │ Features     │     │
│  ├──────┼──────────────────────┼──────────────────────┼──────────────┤     │
│  │  0   │ None                 │ 10/10 Sandboxes,     │ Logs 3d,     │     │
│  │  ★   │ Current tier         │ 5 Agents/MCPs/Jobs,  │ 7d max       │     │
│  │      │                      │ 4 GB RAM max         │ sandbox      │     │
│  ├──────┼──────────────────────┼──────────────────────┼──────────────┤     │
│  │  1   │ Add payment method   │ 50/20 Sandboxes,     │ Volumes,     │     │
│  │      │ [Add payment →]      │ 20 Agents/MCPs/Jobs, │ Policies,    │     │
│  │      │                      │ 64 GB concurrent RAM │ Previews,    │     │
│  │      │                      │                      │ Cron, Revs,  │     │
│  │      │                      │                      │ Logs 14d     │     │
│  ├──────┼──────────────────────┼──────────────────────┼──────────────┤     │
│  │  2   │ 50+ credits top-up   │ 200/75 Sandboxes,    │ Unlimited    │     │
│  │      │ in past 3 months     │ 400 Volumes / 200 GB,│ sandbox      │     │
│  │      │                      │ 75 Agents/MCPs/Jobs, │ runtime,     │     │
│  │      │                      │ 128 GB concurrent RAM│ Logs 30d     │     │
│  ├──────┼──────────────────────┼──────────────────────┼──────────────┤     │
│  │  3   │ 200+ credits top-up  │ 800/200 Sandboxes,   │ Custom       │     │
│  │      │ in past 30 days      │ 6,000 Volumes / 3 TB │ domains      │     │
│  ├──────┼──────────────────────┼──────────────────────┼──────────────┤     │
│  │  4   │ 500+ credits / 30d   │ 2,000/400 Sandboxes, │              │     │
│  │      │                      │ 18,000 Vol / 9 TB,   │              │     │
│  │      │                      │ 512 GB concurrent RAM│              │     │
│  ├──────┼──────────────────────┼──────────────────────┼──────────────┤     │
│  │  5   │ 1,500+ credits / 30d │ 5,000/1,000 Sandboxes│              │     │
│  │      │                      │ 50,000 Vol / 24 TB   │              │     │
│  ├──────┼──────────────────────┼──────────────────────┼──────────────┤     │
│  │  6   │ 4,000+ credits / 30d │ 10,000/2,000 Sbx,    │              │     │
│  │      │                      │ 144,000 Vol / 70 TB  │              │     │
│  ├──────┼──────────────────────┼──────────────────────┼──────────────┤     │
│  │  7   │ Contact us           │ 25,000/4,000 Sbx,    │              │     │
│  │      │ [Contact us →]       │ 512,000 Vol / 250 TB │              │     │
│  ├──────┼──────────────────────┼──────────────────────┼──────────────┤     │
│  │  8   │ Contact us           │ 50,000/8,000 Sbx,    │              │     │
│  │      │                      │ 1,024,000 Vol / 500TB│              │     │
│  ├──────┼──────────────────────┼──────────────────────┼──────────────┤     │
│  │  9   │ Contact us           │ 100,000+/10,000+ Sbx,│              │     │
│  │      │                      │ 2,048,000+ Vol / 1 TB│              │     │
│  └──────┴──────────────────────┴──────────────────────┴──────────────┘     │
│                                                                             │
│  Current tier row (Tier 0) is highlighted with a distinct background.       │
│  Spike contact note: "About to launch and expect a temporary spike?         │
│  Contact us →" — inline, below the table, not a banner.                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Region-by-region specification

### Region A — Page header

**Content:**
- Page title: `Plan & Quotas` (H1)
- Page description: `Current usage and limits for this workspace.` (body/muted)
- Tier badge: `Tier 0` — same label as topbar badge. Right-aligned in the header row.

**Hierarchy intent:** H1 + single-line description. No icon, no hero illustration. The tier badge is a static label — same data as the topbar chip, present here because this IS the canonical plan surface. Does not repeat the clickable-chip mechanic; it is a plaintext badge showing current tier.

**Tier 0 vs Tier 1+ state:** Badge label changes. Description stays constant.

**Scenario trace:** Orients A1 (confirms they're on the right surface) and S1 (stakeholder can screenshot the tier context from header).

**Anti-pattern check:** No "NEW" badge (wizard-creep, steady-state surface). No welcome copy. No "what is a tier?" tooltip.

---

### Region B — Tier summary strip

**Content:** Three inline stat blocks, no card chrome:
1. `Sandboxes (concurrent)` — `0 / 10` + progress bar
2. `Agents / MCP Servers / Batch Jobs` — `1 / 5` + progress bar (shared limit across these three primitive types per current product)
3. `Concurrent RAM (Batch Jobs)` — `0 / 4 GB` + progress bar

**Hierarchy intent:** Metric label (small, muted), value (large, mono), progress bar (full-width within the block), percentage (small, trailing). Three-column grid with no dividing border — whitespace separation only.

**Progress bar color encoding:**
- `< 70%` — neutral (no urgency)
- `≥ 70%` — warning state
- `≥ 90%` — critical state
This is the same encoding rule as the rest of the dashboard per `personality.md` §Interaction principle #4 (color carries state).

**Copy:** Values render as `current / limit` with no decimal padding (`0 / 10`, not `0.0 / 10.0`). Unit where needed: `4 GB`.

**Tier 0 vs Tier 1+ state:** Numbers and limits change per tier. Layout and encoding are constant.

**Scenario trace:** A1 — the 10-second headroom question is answered in this strip without scrolling. Alex's eye-trace lands on the three workload-killing quotas at first viewport entry, before Region C detail, before Region D comparison. This strip is the A1 answer surface.

---

### Region C — Current quota usage

**Content:** Quota rows grouped by primitive family. Groups in order:
1. Sandboxes (concurrent, total, max lifetime, memory per instance)
2. Volumes (Not included on Tier 0)
3. Agent Drive (Not included on Tier 0)
4. Agents Hosting (Agent count, private previews, revisions)
5. MCP Servers Hosting (MCP Server count)
6. Batch Jobs (concurrent, concurrent RAM, timeout, cron triggers)
7. Model APIs (any Model API limits)
8. Networking (Custom domains, logs retention, unlimited sandbox runtime)
9. Security (Policies)
10. Workload Admin (Workspaces)

**Row anatomy (utilized quota):**
```
Quota name              [current] / [limit]   [████████░░░░]  [XX%]
```

**Row anatomy (tier ceiling / static limit):**
```
Quota name              [value]               ─────────────   (tier ceiling)
```
Tier ceilings are static values (max memory per instance, max lifetime) — no progress bar. Label reads `(tier ceiling)` in muted text so Alex doesn't confuse a static specification with a current-usage count.

**Row anatomy (gated — "Not included"):**
```
Quota name              Not included
                        Tier [N] required — add payment method to unlock
                        [Add payment →]
```
Or for Tier 3+ gated features:
```
Custom domains          Not included
                        Tier 3 required — contact us for upgrade options
                        [Contact us →]
```

**Inline gate CTA copy (Tier 1 gate):** `Tier 1 required — add payment method to unlock` + `[Add payment →]`
One Stripe redirect. No modal. No banner. Adjacent to the blocked row.

**Group section headers:** Section label in small-caps or muted uppercase — same visual treatment as other section headers in the dashboard shell. Not H2; these are table-section dividers, not page sections.

**At-capacity warning (Workspaces 1/1):** Progress bar renders at 100% in critical color. Row also carries a `⚠` inline indicator. Inline gate copy beneath: `Tier 1 required — add payment method to create up to 5 workspaces  [Add payment →]`.

**Tier 0 vs Tier 1+ state:** "Not included" rows with gate CTAs are Tier 0 only. On Tier 1+, these rows show actual usage with progress bars. Gate CTAs disappear; the row becomes a standard utilized-quota row.

**Scenario trace:**
- A1 — Region C is the full detail supporting the summary in Region B. Scrolling here gives Alex the complete picture.
- A2 — Alex finds Volumes, sees "Not included" + `[Add payment →]` CTA adjacent. One action. No tier comparison table navigation required.
- S1 — Sam reads Region C to confirm current headroom numbers before expanding Region D for the tier ladder.

**Anti-pattern check:** No upgrade banner at the top of the section. Gate CTAs are row-adjacent, not a floating sidebar element or top-of-page hero. (personality.md §Sacrificial choice #8: "inline-gated at point of use".)

---

### Region D — Tier comparison (collapsed by default)

**Content:** Collapsed: a single expand control. Expanded: a 10-row comparison table.

**Collapsed control:**
```
[▶  Compare all tiers]
```
Label names the job (`Compare`) not a marketing action (`See what you're missing`, `Upgrade your plan`). Chevron or arrow prefix. No badge, no color accent, no urgency framing.

**Expanded table columns:**
- Tier (number + ★ on current tier row)
- Requirement (unlock condition — text + CTA where applicable)
- Key Quotas (Sandboxes, Volumes, Agents/MCPs/Jobs, concurrent RAM)
- Features (feature flags: Volumes, Policies, Custom domains, Unlimited sandbox runtime, log retention days, etc.)

**Current tier row treatment:** Current tier (Tier 0) row is visually distinguished — background tint or left border accent — so the user anchors immediately on their own position in the table. Row is pinned to the top of the table when scrolled within the expanded section.

**Expand/collapse control placement:** Same-line as group label. Does not scroll with the table when expanded — stays at the section header so the user can collapse from any scroll position within the expanded table.

**"Contact us" note:** Below the table, one line: `About to launch and expect a temporary spike? Contact us →`. Not a banner, not a callout card. Inline trailing note at same text size as table body.

**Tier 0 vs Tier 1+ state:** Table is identical. Current tier row highlight shifts with the user's tier.

**Scenario trace:**
- A1 — Alex never expands this (A1 is answered by Regions B+C). This region is not in Alex's A1 path.
- A2 — Alex may glance here to understand tier-vs-feature mapping, but the row-adjacent gate CTA in Region C already surfaces the answer. This is supplementary context for A2.
- S1 — Sam expands this for the full tier ladder. Expand + screenshot = 2 actions total. Sam can also copy-paste the table data.

**Anti-pattern check:** Collapsed by default so the 10-row marketing table never obscures current usage (the core IA inversion fix). The control reads as a comparison tool (`Compare all tiers`), not as a marketing upsell entry point.

---

## Tier 0 Day-1 default content contract

On Day 1 (Tier 0, zero spend, single workspace):

- Region B strip: `0 / 10` Sandboxes concurrent, `0 / 5` Agents/MCPs/Jobs, `0 / 4 GB` concurrent RAM. All progress bars at 0%, neutral color.
- Region C: Volumes, Agent Drive, Policies, Custom domains, Private previews, Cron triggers, Revisions all render as "Not included" with gate CTAs.
- Region C: Workspaces row shows `1 / 1 — 100%` with critical progress bar and gate copy.
- Region D: collapsed. No table visible on Day 1 default render.

---

## Tier 1+ delta

When a payment method is added and Tier 1 is active:

- Region A: badge updates to `Tier 1`.
- Region B: strip values update to Tier 1 limits (e.g. `0 / 20` concurrent Sandboxes, `0 / 20` Agents/MCPs/Jobs, `0 / 64 GB` RAM).
- Region C: all Tier-1-gated rows (Volumes, Agent Drive, Policies, Private previews, Cron triggers, Revisions, Workspaces ≤5) drop the "Not included" state and gate CTA. They become standard utilized-quota rows showing `0 / [tier-1-limit]` with progress bars.
- Region C: Custom domains remain "Not included" (Tier 3 gate). Unlimited sandbox runtime remains "Not included" (Tier 2 gate). These gate CTAs update to reference the higher required tier.
- Region D: unchanged layout; current tier row highlight moves to Tier 1 row.

---

## Interaction notes (non-motion)

**Progress bar tooltip:** On hover over a progress bar, tooltip shows: `[current] of [limit] — [XX%] used`. No additional context. Values are pasteable.

**Inline gate CTA `[Add payment →]`:** Navigates to the Stripe-hosted payment setup page (same behavior as current `Payment method` sidebar item). No modal interception. Tooltip or href-preview shows `billing/payment-method` destination hint.

**Expand/collapse (Region D):** Toggle inline. No page navigation, no scroll jump. Table renders in place below the expand control. `[▶ Compare all tiers]` → `[▼ Collapse]` label swap on expand.

**Search (not present):** The current live product has a search field on this page. This wireframe omits it. The current product's search finds rows within the quota list — with grouping and visual hierarchy in Region C, the search adds complexity without reducing cognitive load for the actual jobs. Flag for operator: if the quota list grows substantially beyond current length, search may be warranted.

---

## Vocabulary self-check (platform.md verbatim)

| Label in wireframe | Canonical term | Source |
|---|---|---|
| Sandboxes | Sandbox | platform.md §Primitives |
| Volumes | Volume | platform.md §Primitives |
| Agent Drive | Agent Drive | platform.md §Primitives |
| Agents Hosting | Agent | platform.md §Primitives |
| MCP Servers Hosting | MCP Server | platform.md §Primitives |
| Batch Jobs | Batch Job | platform.md §Primitives |
| Policies | Policy | platform.md §Primitives |
| Custom domains | Custom domains | platform.md §Primitives |
| Workspaces | Workspace | platform.md §Tenancy |
| Model APIs | Model API | platform.md §Primitives — locked 2026-06-19 |

Note: Group header is "Model APIs" — canonical per platform.md § Primitives. Operator locked this 2026-06-19; the live product's "Model Gateway" label is deprecated in the redesign.

---

## Scenario verification gate

| Scenario | Test | Result |
|---|---|---|
| **A1 — 10s headroom** | Open page cold. Is current usage visible before any tier comparison content? | PASS — Region B (summary strip) + top of Region C appear in first viewport. Region D is collapsed and below fold. Alex's eye-trace: page header → tier summary strip → quota groups. Zero scrolling required to see headroom. |
| **A2 — unlock Volumes** | Find Volumes row. See gate + CTA. One action to unlock. | PASS — Volumes row in Region C "Volumes" group: "Not included / Tier 1 required — add payment method to unlock / [Add payment →]". One click navigates to Stripe. No comparison table expansion required. |
| **S1 — stakeholder view** | 3 actions to full tier context: (1) see current tier in header, (2) see current usage in Region C, (3) expand Region D to see tier ladder. | PASS — Region A (tier label), Region C (current quotas), Region D expand (full ladder). 3 actions, 1 page, no navigation. |

---

## Self-review

- [x] **Inheritance** — structure derives directly from `ia-proposal.md` §1.1 prescribed layout order (current tier summary → current usage → tier comparison collapsed → contextual upgrade CTAs). No deviation.
- [x] **Tokens** — no token values specified (wireframe only). Token references deferred to design-token phase.
- [x] **States** — default (Tier 0 Day-1), at-capacity (Workspaces 1/1), gated (Not included rows), utilized (progress bars), Tier 1+ (delta documented). Loading and error states are out of scope for this wireframe pass — flag for screen-spec phase: page should handle quota API timeout gracefully (show last-known values with staleness indicator).
- [x] **Vocabulary** — all quota group labels and row names use canonical platform.md primitive names verbatim. "Model APIs" section header locked per operator 2026-06-19 (replaces live-product "Model Gateway").
- [x] **Drift** — no deviation from upstream IA proposal. The "search omitted" decision is documented inline with operator flag.

PASS — all scenario verification gates pass. No blocked items. Vocabulary lock applied (Model APIs).
