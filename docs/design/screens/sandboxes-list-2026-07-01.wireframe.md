# Sandboxes list — Wireframe (2026-07-01)

Supersedes: `sandboxes-2026-06-30.wireframe.md` (list section only — create flow is unchanged).

Routes covered: `/{workspace}/sandboxes` — list page only.

Shell: main dashboard shell. Sidebar group **Sandboxes**, item **Sandboxes** selected.

Upstream: `.intermediate/discovery/sandboxes-list-audit/production-2026-07-01.png`, `.intermediate/discovery/blaxel-image-schema/notes.md`, `docs/product/sandbox-flow.md`, `docs/product/platform.md`.

Cross-links: `/{workspace}/sandboxes/[name]` (detail), `/{workspace}/sandboxes/volumes`, `/{workspace}/sandboxes/images`.

---

## Design rationale

### Blaxel-side question

Alex opens `/sandboxes` in Phase 4 (drive + observe) and Phase 5 (debug). Her question at the list is one of two:

- **Phase 4 — ambient check:** how many Sandboxes are active vs. standby, and is this population healthy? She confirms the warm pool is the right size and no rows are red.
- **Phase 5 — incident drill:** she has a Sandbox name or symptom from her own monitoring and needs to find and drill into the specific row in one click. `sandbox-flow.md` §B: "one click on an anomaly or on a specific sbx-id from an incident channel."

The list column set must answer both questions at the glance level. Any column that does not answer a Phase 4 or Phase 5 question is cut, regardless of API availability.

---

### Column decisions

**Columns kept from production (validated by Phase 4/5 questions):**

| Column | Phase it answers | Rationale |
|---|---|---|
| Name / ID | 4 + 5 | Primary identity. `metadata.displayName` (human) + `metadata.name` (slug, paste into CLI/SDK). `personality.md` Sacrificial choice #2: both visible, row carries both. |
| Status | 4 + 5 | Instant warm-pool health scan (Phase 4). First filter in incident triage (Phase 5). |
| Region | 4 + 5 | Volume attachment and Policy compliance require region. During an incident, region is a first-order correlation (is the problem region-scoped?). |
| Allocated RAM | 4 | Capacity decision column — which Sandboxes are over/under-provisioned. Alex uses this for cost + config review. `sandbox-flow.md` implication 5: list must serve capacity reads. |
| Peak RAM (24h) | 5 | Primary anomaly signal per `personality.md` Sacrificial choice #7 (failure surfaces outrank success). A row where peak usage is near allocated is the incident. Confirms the Sandbox is actually being used or is a resource hog. |
| Activity sparkline | 4 | Quick visual of whether a Sandbox is receiving traffic. Standby Sandboxes with no activity and a near-expiry TTL are candidates for deletion. One glance, no column math. |
| Created at | 4 | Default sort column (newest-first). Useful for identifying stale Sandboxes idle since creation — cross-ref with Activity. |

**Columns dropped from 2026-06-30 wireframe:**

- **Image** (was in 2026-06-30, not in production): Phase 4/5 question: Alex needs the Image when debugging an Image-level failure — but that read belongs on the detail page, not the list. At list-scale (30k+ rows), the identifier string adds noise without enabling a list-level decision. Decision: **dropped from list, present on detail page**. If Image were kept, it would use the canonical identifier string (`blaxel/nextjs:latest`) per image-schema notes — no fabricated SHA suffix.

- **Expires in** (was in 2026-06-30, not in production): Expiry countdown is useful per-Sandbox but not for fleet-level scanning. Most rows with no TTL set show `—`, creating a sparse column. When TTL IS set and expiry < 24h, the urgency is surfaced as an inline badge on the Name cell (see §1.3). Standalone column dropped; < 24h badge retained.

**Columns in production, not added to redesign:**

- **Labels** (production has the column, all rows show `—`): Zero current adoption. A FilterPopover chip is the right home when adoption grows — not a default column. Decision: **dropped as column, accessible as filter when data exists**.

**Columns considered and rejected:**

- **Provenance** (`sandbox-flow.md` §8 calls for "who spawned this"): Phase 5 triage value confirmed — but requires a cross-resource join not yet shipped in production. Deferred to detail page. Flagged in §Audit questions.

---

### State model reconciliation

**The mismatch in 2026-06-30:** that wireframe introduced a two-axis pill combining API `status` (deployment lifecycle: UPLOADING → DEPLOYING → DEPLOYED → FAILED → TERMINATED…) with runtime `state` (RUNNING / STANDBY). Production uses a single `Status` column showing `Deployed` as the label.

**Resolution: one-axis pill, platform.md runtime vocabulary, not API lifecycle vocabulary.**

The list is a runtime view, not a deployment-pipeline view. Alex's Phase 4 question is "is this Sandbox active right now?" not "was it successfully deployed?" `platform.md` §Sandbox lifecycle states uses: `deploying` / `active` / `standby` / `deleted`. The pill follows this vocabulary.

**Why `Active` not `Deployed`:** `Deployed` is provisioning-pipeline vocabulary (DEPLOYED = build complete). `Active` is runtime vocabulary (RUNNING = receiving traffic). Changing the production label to `Active` requires operator confirmation — see §Audit questions #1.

**Canonical pill vocabulary (list level):**

| What's happening | Pill label | Token |
|---|---|---|
| Any in-progress provisioning (UPLOADING / BUILDING / DEPLOYING) | Deploying | `bg-state-info-subtle text-state-info` |
| DEPLOYED + runtime RUNNING | Active | `bg-state-success-subtle text-state-success` |
| DEPLOYED + runtime STANDBY | Standby | `bg-surface-secondary text-meta-foreground` |
| FAILED | Errored | `bg-state-error-subtle text-state-error` |
| DEACTIVATING | Deactivating | `bg-state-info-subtle text-state-info` |
| DEACTIVATED | Inactive | `bg-surface-secondary text-meta-foreground` |
| TERMINATED or DELETING | Terminated | `bg-surface-secondary text-meta-foreground` — shown only when Terminated chip is active |

**Standby is never "paused", "cold", "sleeping", or "idle".** `platform.md`: standby is a paid-feature steady state. Blurring it with "idle" removes the product wedge from its own UI.

---

### Chrome decisions

**Quota chip.** Production shows `Sandbox · 16 remaining in Tier 0` above the toolbar. The 2026-06-30 wireframe omitted it entirely. Decision: **keep it**. Phase 4 capacity read: how many more Sandboxes can I spawn? Placed below the `<h1>`, above the toolbar, inline-left. Uses `text-meta-foreground` for the chip, `text-state-warning` for the count when < 20% of tier quota remaining. Non-clickable ambient info (confirm in §Audit questions #3 if navigation is desired). Follows `personality.md` Sacrificial choice #8.

**"Show terminated" toggle.** Production: standalone toggle top-right. 2026-06-30: "Include terminated" chip in toolbar. Decision: **move to toolbar as a right-anchor chip** labeled "Terminated". This unifies the control zone per `toolbar.md` — a standalone toggle outside the toolbar creates a second control zone. Default: off (Terminated rows hidden, matching production default behavior).

**Pagination footer.** Production confirms: Rows per page (default 10) · Page N of M · first/prev/next/last. `sandbox-flow.md` §5: non-negotiable at 30–50k sandbox scale. Footer always visible regardless of row count.

---

## 1. Page anatomy

### 1.1 Page header

```
Sandboxes                                              [ + Create Sandbox ]
Sandbox · 16 remaining in Tier 0
```

- `h1`: "Sandboxes"
- Quota chip: below h1, inline-left. `text-meta` weight. Count in `text-state-warning` when < 20% of tier quota remaining. Non-clickable ambient info.
- CTA: `variant="primary"`, right edge of header row. Navigates to `/{workspace}/sandboxes/new`. Present on empty state.
- No subtitle on the h1 row.

### 1.2 Toolbar

```
[ Search name or ID… ]            [ Status ▾ ] [ Region ▾ ] [ Terminated ]
LEFT ANCHOR                                                   RIGHT ANCHOR
```

- **Search** (left): `max-w-xs`, placeholder "Search name or ID…". Searches on `metadata.displayName` and `metadata.name`. Server-side, debounced.
- **Status chip** (right): multi-select FilterPopover for Active / Standby / Deploying / Errored / Inactive. Default: all except Terminated.
- **Region chip** (right): multi-select FilterPopover for `eu-fra-1`, `eu-lon-1`, `us-was-1`, `us-pdx-1`, `auto`.
- **Terminated chip** (right): single toggle-chip — activating it adds Terminated rows to the result set. Default: off.
- Sort lives on column headers, not in toolbar (`tables.md` §Sort). Default sort: Created at descending.

### 1.3 Table — populated state (Archetype B — Resource row)

Row click → `/{workspace}/sandboxes/[name]`. Whole-row click; identifier underline on hover.

Column order: identity → status → attributes → metrics → timestamp → action.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ☐  Name / ID           Status     Region    Alloc. RAM  Peak RAM (24h)  Created at       Activity  ···  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ☐  Vite React TS       ● Active   us-pdx-1  4096 MB     569 MB (13%)   2026-07-01 20:50  ▁▃▅▇▅    ···  │
│    vite-react-ts                                                                                         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ☐  prod-runner         ◌ Standby  eu-fra-1  2048 MB     1024 MB (50%)  2026-06-29 08:12  ▁▁▁▃▁    ···  │
│    prod-runner                                                                                           │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ☐  eval-batch ⚠ 2h     ○ Deploying eu-lon-1  8192 MB   —              2026-07-01 21:00   —         ···  │
│    eval-batch-01                                                                                         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ☐  ⚠ staging-agent     ✕ Errored  eu-lon-1  4096 MB     —              2026-06-30 14:44   —         ···  │
│    staging-agent                                                                                         │
│    Image pull failed — push Image or pick another.   [Retry]   [Open in CLI]                            │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Expiry badge on Name cell (not a column):** When a Sandbox has `expiresIn` < 24h, the Name cell shows an inline `⚠ Nh` badge in `text-state-warning` appended after the display name — e.g. `eval-batch ⚠ 2h`. When `expiresIn` ≥ 24h or no TTL is set, no badge. This eliminates the sparse "Expires in" column from 2026-06-30.

**Column specs:**

| Column | Width hint | Token / behavior |
|---|---|---|
| **Checkbox** | 32px | Multi-select. Bulk-action bar appears above table on selection (`tables.md` §Bulk-action bar). Bulk action: Delete. |
| **Name / ID** | flexible, min 200px | `metadata.displayName` in `text-body font-medium`. `metadata.name` stacked below in `font-mono text-meta text-meta-foreground`. Expiry badge `⚠ Nh` in `text-state-warning` appended to Name line when < 24h. Copy icon on `metadata.name` on hover. |
| **Status** | 120px | Single-axis pill per state model above. |
| **Region** | 96px | Canonical region ID: `eu-fra-1`, `us-pdx-1`, etc. `text-meta`. |
| **Alloc. RAM** | 96px | `text-meta font-mono`. Format: `4096 MB`. `—` when unavailable (Deploying / Errored before first boot). |
| **Peak RAM (24h)** | 140px | `text-meta font-mono`. Format: `569 MB (13%)` — absolute + percentage of allocated. `—` when Deploying or never active. Percentage ≥ 80% renders in `text-state-warning`. |
| **Created at** | 160px | `text-meta`. Format: `YYYY-MM-DD HH:mm` in workspace local time. Timezone label on column header. Sortable; default sort desc. |
| **Activity** | 80px | Sparkline of activity over last 24h. 8–12 SVG bars, `text-meta-foreground` fill. `—` for Deploying or zero-activity. Visual only. |
| **Action** | 40px | Per-row `···` kebab. Options: Restart, Open in CLI (`bl connect sandbox <name>`), Delete. No trailing `→` arrow. |

**Errored row treatment** (`personality.md` Sacrificial choice #7): Second line shows inline cause + `[Retry]` + `[Open in CLI]` as inline action buttons. Row height increases. No symmetric treatment on healthy rows.

---

### 1.4 Pagination footer

```
                          Rows per page [ 10 ▾ ]    Page 1 of 5,234    |◀  ◀  ▶  ▶|
```

- Always visible below the table (even when only 1 page — maintains layout stability).
- Rows per page: 10 / 25 / 50. Default 10.
- Right-anchored footer row.

---

### 1.5 Empty state (zero Sandboxes in workspace)

Table header row remains. Empty body per `tables.md` §5.1.

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ☐  Name / ID    Status    Region    Alloc. RAM   Peak RAM (24h)  Activity │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│              No Sandboxes in this workspace.                               │
│                                                                             │
│    $ bl sandbox create --name my-sandbox --image blaxel/base-image:latest  │
│    await SandboxInstance.createIfNotExists({ name: "my-sandbox",           │
│      image: "blaxel/base-image:latest" })                                  │
│                                                                             │
│                        Or   [ Create from console ]                        │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

- Code block: `font-mono bg-surface-secondary rounded` with copy icon. CLI line first, SDK line second.
- "Or Create from console" is `variant="ghost"` — dashboard path is explicitly secondary.
- No illustration. No "Welcome!" copy. No checklist.

### 1.6 No-results state

```
              No Sandboxes match these filters.
              Adjust your search or filters.    [ Clear filters ]
```

No icon. `[ Clear filters ]` resets toolbar to default state.

### 1.7 Loading state

Five skeleton rows. Column layout and row height match the populated table. Header band (search + filter chips) remains active. No full-table overlay or centered spinner.

### 1.8 Error state

```
   Failed to load Sandboxes.   [ Retry ]
```

Cause-first, one-verb recovery. `[Retry]` re-triggers the API call. No apology.

---

## 2. State matrix

| State | Surface |
|---|---|
| Populated (default) | §1.3 |
| Loading | §1.7 — skeleton rows, header active |
| API error | §1.8 — inline cause + Retry |
| Zero records | §1.5 — CLI block leads |
| Filter / search no-results | §1.6 — Clear filters |
| Pagination footer | Always visible; count shows `—` during load; hidden on zero-record state |

---

## 3. Vocabulary cross-check

| Label used | Forbidden synonym |
|---|---|
| Sandbox | Instance, container, environment |
| Standby | Idle, cold, paused, sleeping |
| Active | Running, warm, live |
| Deploying | Loading, starting, provisioning |
| Errored | Failed (reserved for Batch Job outcomes) |
| Terminated | Deleted |
| Allocated RAM / Alloc. RAM | Memory, Limit, Cap |
| Peak RAM (24h) | Peak memory, Peak usage |
| Region | Location, zone, datacenter |
| Created at | Created on, Date created |

---

## 4. Audit questions for operator review

1. **Status label: `Active` vs. `Deployed`.** Production shows `Deployed`. This wireframe proposes `Active` (runtime vocabulary from `platform.md`). Confirm the canonical label — changing it in the dashboard may require aligning with the API response field.

2. **Peak RAM window.** Column header reads "Peak RAM (24h)" matching production. Confirm the 24-hour window is correct, or whether per-session peak (since last `deploying → active` transition) is more useful for incident triage.

3. **Quota chip — clickable or ambient.** This wireframe renders the chip as non-clickable ambient info. Confirm: should it navigate to Account → Plan & billing → Overview to show Sandbox quota detail, or stay ambient?

4. **Provenance column (deferred).** `sandbox-flow.md` §8 specifies a "who spawned this" column (↑ Agent / ↑ Batch Job / hand-spawn). Deferred to detail page for now. Confirm: is list-level provenance needed for Phase 5 triage, or is one-click drill to detail sufficient?

5. **Expiry badge threshold.** This wireframe shows `⚠ Nh` on the Name cell only when `expiresIn` < 24h. Confirm the threshold, or whether any Sandbox with an active TTL should always show the countdown inline (e.g. `⚠ 6d 22h`).

6. **Bulk-action scope.** Checkbox + bulk Delete is the only bulk action here. Confirm: are Restart-all or other bulk verbs needed at list level?

---

## 5. Self-review

- [x] **Inheritance** — Archetype B per `tables.md` §1. Column order follows identity → status → attributes → metrics → timestamp → action per `tables.md` §2. Toolbar follows `toolbar.md` split-anchor rule. Pagination follows `sandbox-flow.md` §5.
- [x] **Tokens** — `bg-state-success-subtle`, `text-state-success`, `bg-state-error-subtle`, `text-state-error`, `bg-state-info-subtle`, `text-state-info`, `bg-surface-secondary`, `text-meta-foreground`, `text-state-warning`, `font-mono`, `text-meta`, `text-body`. No invented tokens.
- [x] **States** — Populated (§1.3), Loading (§1.7), Error (§1.8), Empty/zero-records (§1.5), No-results (§1.6). State matrix at §2.
- [x] **Vocabulary** — Canonical terms from `platform.md` throughout. Synonym banlist at §3.
- [x] **Anti-patterns** — No border-left state treatment. No hairline card separators as grouping (table uses standard row dividers). No illustration empty state. No welcome hero. No celebration copy. Errored row uses inline cause + action band, not a colored left stripe.
- [x] **Drift from 2026-06-30** — Image column dropped (detail concern, not list concern). Expires in column dropped (replaced by per-Name badge < 24h). Labels not added (zero production adoption). Created at, Allocated RAM, Peak RAM, Activity added (all Phase 4/5 justified, confirmed in production). State model simplified from two-axis compound pill to one-axis runtime pill. Quota chip added (production has it, 2026-06-30 omitted it). "Show terminated" toggle moved into toolbar as chip. Pagination footer added (non-negotiable per sandbox-flow.md §5).

---

## Sources

- `docs/product/personas.md` — Alex Phase 4 + Phase 5; wizard-creep anti-pattern
- `docs/product/alex-workflow.md` — Phase 4 (load-bearing UX, status streams); Phase 5 (one-click drill to trace)
- `docs/product/sandbox-flow.md` — §B observation path; §5 (50k-row scale, pagination required); §8 (provenance deferred)
- `docs/product/platform.md` — Sandbox lifecycle states; canonical region IDs; primitive vocabulary
- `docs/product/personality.md` — Sacrificial choices #2, #5, #7, #8; Interaction principles #5, #7; Voice/copy rules
- `.intermediate/discovery/sandboxes-list-audit/production-2026-07-01.png` — production column set, quota chip placement, Status label, pagination footer
- `.intermediate/discovery/blaxel-image-schema/notes.md` — Image column decision (identifier only; no fabricated SHA)
- `docs/design/guidelines/tables.md` — Archetype B, column order, empty state §5.1/§5.2
- `docs/design/guidelines/toolbar.md` — split-anchor rule
- `docs/design/anti-patterns/decoration.md` — no border-left, no hairline card separators
