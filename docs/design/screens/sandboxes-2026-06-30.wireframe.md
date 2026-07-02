# Sandboxes — Wireframes (2026-06-30)

Routes covered:
- `/{workspace}/sandboxes` — list page
- `/{workspace}/sandboxes/new` — create flow (two steps on one page)

Shell: main dashboard shell. Sidebar group **Sandboxes**, item **Sandboxes** selected.
Finding 4 (sidebar hover-overlay on the create form) is an app-shell concern, not a wireframe concern. This wireframe assumes the shell fixes hover-expand to explicit-click-only during focused form pages — noted in Open questions.

Upstream: `.intermediate/discovery/sandboxes/notes.md`
Cross-links: `/{workspace}/sandboxes/volumes`, `/{workspace}/sandboxes/images`

---

## Design rationale — the three-step question

**Blaxel-side question first.** Alex does not create Sandboxes from the dashboard; she uses `SandboxInstance.createIfNotExists()` or `bl sandbox create` from her IaC and terminal. The console create flow is for Sam and for first-contact evaluation — not Alex's primary path. Given that, what is the right complexity budget for the create form?

Production has three steps: (1) Image gallery → (2) Resources config → (3) Confirm + Launch. The rationale for keeping all three alive:
- Step 1 (Image select) is a catalog-style choice that benefits from visual browse; it is not a field.
- Step 2 (Resources form) is 6–8 fields (Memory, TTL, Region, Volumes, Env vars) with a live Summary rail — meaningful state the user sets.
- Step 3 (Confirm + Launch) does two distinct jobs: lock the Sandbox name (which is immutable after creation) and hand the user the launch snippet or Create button.

**Decision: keep the three steps, restructure step 3.** The image-gallery → config split earns its step boundary (catalog browse vs. form input). The config → confirm split earns its boundary (mutable config vs. name-lock + launch). What the redesign changes:

1. Step 3 is restructured so the "Display name" and immutable "name" fields come first, clearly framed as the name-lock moment, with the immutability note prominent — not buried after the Launch section.
2. The Launch section on step 3 ships with a language-tab snippet (TS / Python / Go / cURL / CLI) plus a "Create from console" button — both equal peers. No modal or celebration after Create.
3. Footer button alignment fixed per original Finding 1 (right-aligned primary).
4. Volumes empty state fixed with dialog-from-CTA pattern (2-field dialog, per adversarial audit F2).
5. "Copy page" affordance added to the SDK path: standalone "Copy as Markdown" button + separate LLM ghost buttons (adversarial audit F7).

Container: **page** (`/{workspace}/sandboxes/new`). Three sequential steps each building on the last — `container-choice.md` multi-step row → page is the correct container. Stepper button layout follows `stepper-actions.md` split-anchor rule.

---

## 1. Sandboxes list page — `/{workspace}/sandboxes`

### 1.1 Page header

```
Sandboxes                                              [ + Create Sandbox ]
```

- `h1`: "Sandboxes"
- No subtitle — Sandboxes is a first-class named primitive, not a feature that needs explaining to Alex.
- CTA: `variant="primary"`, right edge of the header row. Navigates to `/{workspace}/sandboxes/new`.
- CTA presence: the "Create from console" path lands here; Alex's path is CLI/SDK. The button is not suppressed on empty state — it is the honest dashboard-path entry point.

### 1.2 Toolbar (above table)

```
[ Search name or ID… ]                   [ Active ▾ ] [ Standby ▾ ] [ Errored ▾ ] [ Region ▾ ]
LEFT ANCHOR                                                                         RIGHT ANCHOR
```

- Search: `max-w-xs`, placeholder "Search name or ID…" — searches on `metadata.name`, `metadata.displayName`, and `metadata.externalId`.
- Right anchor: state filter chips (Active / Standby / Errored as quick-select toggles, multi-select) + Region dropdown. Chips collapse to a "Filters" button at narrow viewports.
- No "Show terminated" toggle by default — the production "Show terminated" toggle addresses a specific forensics need. Terminated (DELETING / TERMINATED) state is accessible through an "Include terminated" chip at the right anchor, not a persistent toggle.

### 1.3 Aggregate strip

**Blaxel-side question.** On first paint, before any filter is applied, what does Alex need to see to make her next click? She needs to know the shape of the workspace population: how many Sandboxes are in each state, where they are distributed across regions, and which Images dominate — so she can decide whether to filter by state (incident scan), by region (infra spread), or by image (deploy audit). The aggregate strip delivers that shape as a scannable row of counts, each tile a one-click filter shortcut. No charts — counts earn every pixel; visual encoding does not.

**Tile composition and order**

The strip renders four tile groups in left-to-right read order matching Alex's incident scan sequence — population total → health signal → where → what image:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Total          State                              Region                Top Image                  │
│  ──────         ──────────────────────────────     ─────────────────     ──────────────────────────  │
│  248            ● 201 Active                       eu-fra-1   104        py3.12@9c1e…   87          │
│  Sandboxes      ◑  39 Standby                      us-pdx-1    81        node20@a4f2…   64          │
│                 ✕   8 Errored                      eu-lon-1    41        blaxel/base    41          │
│                                                    us-was-1    22        node18@3d7f…   32          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Tile 1 — Total**

- Label: count (formatted `12.4k` above 10 000, plain integer below) + word "Sandboxes"
- Not clickable — there is no filter to apply. The count is orientation, not a shortcut.
- Always present when the strip renders (i.e. when ≥ 1 sandbox exists).

**Tile 2 — State breakdown**

Three rows: Active / Standby / Errored with counts and the same state dot/icon used in the table.

- Each row is individually clickable. Clicking "● 201 Active" sets the state filter to Active — same as clicking the Active chip in the toolbar. Clicking "✕ 8 Errored" sets state filter to Errored.
- Multi-select within the group: clicking Active then Errored filters to either Active or Errored (OR logic, same as toolbar chips).
- Clicking an already-active row toggles it off.
- Standby: rendered in the strip even when count is 0 (shows "◑ 0 Standby") — the zero is informative, not hidden.
- Terminated (DELETING / TERMINATED) is not in the strip — it mirrors the toolbar default (terminated rows hidden until "Include terminated" chip). If the chip is active, the strip gains a fourth row "Terminated N".

**Design note — strip vs toolbar chips.** The toolbar chips (Active / Standby / Errored) and the strip tiles are kept as separate controls that stay in sync rather than folding the chips away. Rationale: the toolbar chips are the canonical filter affordance reachable at every viewport and tab-keyboard flow; folding them away would break that pattern. The strip tiles are a redundant shortcut that removes scroll-to-toolbar friction on long lists. Both update the same filter state; either path reflects in the other.

**Tile 3 — Region split**

One row per active region (regions with 0 sandboxes omitted). Canonical region IDs (`eu-fra-1`, `us-pdx-1`, `eu-lon-1`, `us-was-1`, `auto`).

- Each row clickable → sets the Region dropdown to that region. Single-select within the group: clicking eu-fra-1 then us-pdx-1 switches to us-pdx-1 (not both). A region filter is a spatial scope; OR-across-regions is available in the toolbar dropdown for power users but the strip shortcut applies a single region for the common case.
- Clicking an already-active row clears the region filter.
- "auto" region rows are included if any sandboxes were created with auto-assignment and the resolved region is not yet known.

**Tile 4 — Top Image**

Top 4 Images by sandbox count (truncated — the full list is in the toolbar or a filter panel, not in the strip).

- Shows `name@sha8chars…` in `font-mono text-meta` with a count.
- Each row clickable → sets an Image filter on the table. Single-select: clicking a second image replaces the first.
- Clicking an already-active row clears the image filter.
- If the workspace has fewer than 4 distinct images, only that many rows render (no empty placeholder rows).
- Image SHA is truncated to 8 characters with `…` trailing, matching the table column.

**Layout**

```
┌────────────┬────────────────────────────────┬─────────────────────┬────────────────────────────┐
│  Total     │  State breakdown               │  Region split        │  Top Image                 │
│            │  ● Active      201             │  eu-fra-1   104      │  py3.12@9c1e…    87        │
│  248       │  ◑ Standby      39             │  us-pdx-1    81      │  node20@a4f2…    64        │
│  Sandboxes │  ✕ Errored       8             │  eu-lon-1    41      │  blaxel/base     41        │
│            │                                │  us-was-1    22      │  node18@3d7f…    32        │
└────────────┴────────────────────────────────┴─────────────────────┴────────────────────────────┘
```

- Horizontal strip spanning the full content width, positioned between the toolbar and the table. Vertical rhythm: `mt-3` below toolbar, `mb-3` above table header — tight enough to read as a single "list header" zone, separated enough to distinguish toolbar (filter controls) from strip (population summary) from table (rows).
- Four tile groups separated by a `border-r border-border` divider. No card border around the strip itself — the strip sits on the page background, not on a raised surface. This avoids the cards-as-default-container anti-pattern.
- Each tile group: group label in `text-caption text-muted-foreground` above the content rows; content rows in `text-body`. Count values right-aligned within each row.
- Active filter state: the tile row that corresponds to an active filter gains `font-medium` weight and a left-side indicator dot (reuses `bg-foreground` — a 2px wide vertical bar on the left of the row cell, not a decorative border-left stripe — this is a selection indicator, same pattern the toolbar chips use for active state). No new color token.
- No card elevation, no drop shadow, no background tint on the strip container. Same `bg-background` as the page.
- `packages/ui` primitives used: the tile groups are composed from existing layout primitives (flex, divider) — no new `AggregateStrip` or `StatTile` component is added to the design system. This is app-level composition per the engineering guidelines: the strip is sandboxes-list-only, not a generic dashboard primitive.

**Viewport behavior**

- Desktop (≥ 1024px): four-column strip as shown, full width.
- Tablet (768px–1023px): same four columns, column widths compress. Region and Top Image columns truncate to 3 rows each at narrower widths.
- Mobile (< 768px): strip collapses to a 2-row grid: [Total · State] top row, [Region · Image] bottom row. Both rows scroll horizontally if needed. The strip is visible but not the primary interaction surface on mobile — toolbar chips are preferred at this width.
- No horizontal scrolling at desktop/tablet — content compresses.

**Click → filter contract — full spec**

| User action | Effect on toolbar | Effect on table |
|---|---|---|
| Click Active row (strip) | Active chip activates in toolbar | Table filters to Active state |
| Click Standby row (strip) | Standby chip activates in toolbar | Table filters to Standby state |
| Click Active + Errored rows (strip) | Both chips active | Table shows Active OR Errored |
| Click active row again (strip) | Chip deactivates | Filter cleared for that state |
| Click eu-fra-1 row (strip) | Region dropdown shows "eu-fra-1" | Table filters to eu-fra-1 |
| Click different region row (strip) | Region dropdown updates | Table switches to new region |
| Click active region row (strip) | Region dropdown resets to "All" | Region filter cleared |
| Click Image row (strip) | Image filter applied (toolbar state) | Table filters to that image |
| Click "Clear filters" (toolbar) | All chips reset | Strip selected states reset |
| Change toolbar chip directly | Strip row for that state reflects active style | Table filters |
| Change Region dropdown directly | Strip row for that region reflects active style | Table filters |

Both strip and toolbar are views onto the same filter state — they never get out of sync.

**States**

| State | Strip behavior |
|---|---|
| **Default (≥ 1 sandbox)** | Strip renders with computed tile counts from fixture/API data. All four tile groups visible. |
| **Loading** | Strip renders skeleton tiles: four equal-width skeleton blocks, height matching tile group, using the existing skeleton pattern (`animate-pulse bg-muted`). No counts visible. Table skeleton below renders simultaneously — they share a single loading state. |
| **Empty workspace (0 sandboxes)** | Strip is hidden entirely. The page renders the toolbar + existing `EmptyState` in the table region (§1.6 below). Zero-count tiles would be noise, not signal. |
| **Filter narrows to 0 rows** | Strip stays visible with the unfiltered counts (total, state breakdown, region, image are all workspace-level aggregates — they do not recompute when a filter is active). The no-results band renders inside the table region (§1.7). This is intentional: the strip stays as context for what exists vs. what the filter is hiding. |
| **Error fetching sandbox list** | Strip hides. The existing error band handles the page-level failure (§1.9). Showing a strip with stale or zero counts while the table errors would be misleading. |

**Data source note.** The API contract has cursor pagination (`meta.hasMore`, `meta.nextCursor`, `meta.total`) — a real production client cannot compute breakdowns from a single page. For the demo, aggregates are computed client-side from the full mocked fixture set (50–100 sandboxes spread across states, regions, and images). The component is authored so the data source could later swap to a dedicated aggregate fetch without changing the strip's rendering API. See Open questions §6 item 7 (aggregate endpoint).

---

### 1.4 Table — populated state (Archetype B — Resource row)

Row click → navigates to `/{workspace}/sandboxes/[name]` (Sandbox detail — out of scope for this wireframe, cross-link only).
Whole-row click, identifier underline on hover (per `tables.md` §1 Archetype B).

Column order follows `tables.md` §2 (identity → status → attributes → metrics → timestamp → action):

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  Name / ID            State          Region         Image          Expires in    [action] │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  prod-runner          ● Active        eu-fra-1      py3.12@9c1e…   —              ···    │
│  sbx-7f3a9c1e                                                                            │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  eval-batch           ◑ Standby       us-pdx-1      blaxel/base    6d 23h         ···    │
│  sbx-2b4d8e3f                                                                            │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  ⚠ staging-agent      ✕ Errored       eu-lon-1      node20@a4f2…   —              ···    │
│  sbx-c1e7a209         Image pull failed — push Image or pick another.  [Retry]          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**Column specs:**

| Column | Token / notes |
|---|---|
| **Name / ID** | `metadata.displayName` in `text-body font-medium`. `metadata.name` (the immutable slug) stacked below in `font-mono text-meta text-meta-foreground`. Identifier underline on row hover signals click. |
| **State** | Two-axis pill — deployment `status` × runtime `state`. See State model §1.5 below. Color = domain state only, per `personality.md` Interaction principles #4. |
| **Region** | `text-meta`, canonical region IDs (`eu-fra-1`, `us-pdx-1`, `eu-lon-1`, `us-was-1`, `auto`). |
| **Image** | SHA prefix `name@sha8chars…` in `font-mono text-meta`. Copy affordance on hover. |
| **Expires in** | `font-mono text-meta`. `expiresIn` countdown when a TTL is set; `—` (em dash) when no TTL. Updates without refresh. Turning red (`text-state-warning`) when < 24h. Never reads "Never" or "Forever". |
| **Action** | Per-row `···` kebab. Options: Restart, Open in CLI (`bl connect sandbox <name>`), Delete. No trailing `→` arrow. |

**Errored row treatment (personality.md Interaction principles #5):**
- Errored rows render with an expanded second line below the ID: inline cause + one-verb recovery action (`[Retry]` or `[Open in CLI]`).
- Row height increases to accommodate the inline band — errored rows are visually larger than healthy rows.
- No symmetric treatment: healthy rows have no decoration, no checkmark.
- State pill uses `bg-state-error-subtle` + `text-state-error`.

**No "time left before termination" label** — the Sandbox is not "terminating" when the countdown runs; it is deleted when it reaches zero. Column header reads "Expires in" per `platform.md` terminology.

### 1.5 State model — two-axis rendering

From `docs.blaxel.ai/api-reference` and `docs.blaxel.ai/Sandboxes/Overview`:

- Axis 1 — deployment **status**: UPLOADING → BUILDING → DEPLOYING → DEPLOYED → FAILED / TERMINATED / DELETING / DEACTIVATING / DEACTIVATED / BUILT
- Axis 2 — runtime **state**: RUNNING · STANDBY

Rendered as a single composite pill. Priority: error and in-progress deployment states take precedence; once DEPLOYED, runtime state drives display.

| API values | Pill label | Token |
|---|---|---|
| status=DEPLOYING (any pre-DEPLOYED) | Deploying | `bg-state-info-subtle text-state-info` |
| status=BUILT | Deploying | `bg-state-info-subtle text-state-info` — BUILT is a transient pre-DEPLOYING checkpoint; rendered as in-progress, not complete. If BUILT never persists to the list view, this row is a no-op in practice. |
| status=DEPLOYED, state=RUNNING | Active | `bg-state-success-subtle text-state-success` |
| status=DEPLOYED, state=STANDBY | Standby | `bg-surface-secondary text-meta-foreground` |
| status=FAILED | Errored | `bg-state-error-subtle text-state-error` |
| status=TERMINATED or DELETING | Terminated | `bg-surface-secondary text-meta-foreground` — dimmed, not removed |
| status=DEACTIVATING | Deactivating | `bg-state-info-subtle text-state-info` — in-progress transition, same token as Deploying |
| status=DEACTIVATED | Inactive | `bg-surface-secondary text-meta-foreground` |

**Standby is never "cold", "paused", or "sleeping".** Standby ≠ Deleted. Terminated rows stay in the list only when the "Include terminated" chip is active.

### 1.6 Empty state (zero Sandboxes in workspace)

Follows `personality.md` Sacrificial choice #5 (CLI/SDK is a peer surface) and the "CLI-first empty state" pattern.

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  Name / ID            State          Region         Image          Expires in    [action] │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                           │
│                         No Sandboxes in this workspace.                                  │
│                                                                                           │
│              $ bl sandbox create --name my-sandbox --image blaxel/base-image             │
│                                                                                           │
│                         Or   [ Create from console ]                                     │
│                                                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

- Title: "No Sandboxes in this workspace." — declarative, no illustration.
- CLI block: `font-mono bg-surface-secondary` code block with copy icon. Leads with the `bl` command; SDK equivalent below it on a second line: `await SandboxInstance.createIfNotExists({ name: "my-sandbox", image: "blaxel/base-image" })`.
- "Or Create from console" renders as a secondary/ghost button below the code block — the dashboard path is explicitly secondary here. `personality.md` Sacrificial choice #5 honors this ordering.
- No illustration. No "Welcome to Sandboxes!" copy. No "Get started" checklist.
- Icon: omitted per `personality.md` — a utility icon is not used here because the CLI command block serves as the visual focal point. This is an intentional deviation from `tables.md` §5.1 icon guidance.
- Full-width `<tr><td colSpan={n}>` with `py-12`, per `tables.md` §5.1.
- Aggregate strip hidden on this state (0 sandboxes → strip hides per §1.3 States).

### 1.7 No-results state (filter returns nothing)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  Name / ID            State          Region         Image          Expires in    [action] │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                           │
│                         No Sandboxes match these filters.                                │
│                         Adjust your filters or search term.                              │
│                         [ Clear filters ]                                                 │
│                                                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

No icon block. `Clear filters` resets the toolbar state (and clears any strip tile selections). Per `tables.md` §5.2.
Aggregate strip remains visible above the table with the unfiltered workspace-level counts — see §1.3 States.

### 1.8 Loading state

Skeleton rows in place of data — 5 rows, matching table row height and column layout. Aggregate strip renders skeleton tiles simultaneously (see §1.3 States — Loading). Header band stays visible and interactive (search + filter chips remain active). No centered spinner; no full-table overlay. Per `tables.md` §4.

### 1.9 Error state (API failure)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  Name / ID            State          Region         Image          Expires in    [action] │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                           │
│  Failed to load Sandboxes. [ Retry ]                                                     │
│                                                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

- Copy: cause-first ("Failed to load Sandboxes."), one-verb recovery ("Retry").
- No "Something went wrong" language. No apology. No illustration.
- `[Retry]` re-triggers the API call inline.
- Aggregate strip hides on error (see §1.3 States — Error fetching).

---

## 2. Create Sandbox — `/{workspace}/sandboxes/new`

Three-step page flow. Step progress indicator at top: `Step 1 of 3 · Step 2 of 3 · Step 3 of 3` — a simple text label, not a visual stepper rail. Avoids decorative chrome; Alex doesn't need a wizard wizard.

Page layout: two-column (left form content, right Summary rail) — present in steps 2 and 3. Step 1 (image gallery) is full-width with a category filter rail.

Footer: split-anchor per `stepper-actions.md` §2. Primary action right-aligned. Finding 1 resolved.

---

### Step 1 — Select Image (`/{workspace}/sandboxes/new?step=image`)

**Page header:**
```
Create Sandbox                                                          Step 1 of 3
Select an Image
```

- Subtitle: "Select an Image" — not "Choose a template" or "Pick a base". Canonical vocabulary.
- No step-rail with circles and lines — text label is sufficient.

**Layout: full-width**

```
[ Search Images… ]                   All · Runtimes · Databases · Tools · Custom

┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Python  │ │ Node 20 │ │ Expo    │ │ ...     │
│ 3.12    │ │         │ │         │ │         │
│ blaxel/ │ │ blaxel/ │ │ blaxel/ │ │         │
│ python… │ │ node-20 │ │ expo    │ │         │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

- Search input left, category rail right — per `toolbar.md` split-anchor rule.
- Image tiles: image name + version + publisher + short description. Selected tile gets a foreground + weight treatment and a check indicator. No border-left accent (decoration anti-pattern). No colored left stripe.
- Category rail: "All / Runtimes / Databases / Tools / Custom" — chip group, not a sidebar accordion.
- Custom Images section below the platform Images, separated by a section heading ("Custom Images"), not a card border.

**Footer:**
```
[ Cancel ]                                               [ Continue → ]
 LEFT (ghost)                                              RIGHT (primary)
```

Wait — per `stepper-actions.md` §2: step 0 has no Prev, Cancel on the right cluster. Correcting:

```
                                            [ Cancel ]  [ Continue → ]
                                               RIGHT CLUSTER (ghost + primary)
```

Cancel: silent dismiss regardless of selection state — step 1 is low-stakes (single choice, trivially reproducible). No discard-confirm dialog. Navigates back to `/{workspace}/sandboxes`.
Continue: disabled until an Image is selected.

---

### Step 2 — Configure Resources (`/{workspace}/sandboxes/new?step=resources`)

**Page header:**
```
Create Sandbox                                                          Step 2 of 3
Configure resources
```

**Layout: two-column (left form, right Summary rail)**

```
┌─────────────────────────────────────────┐  ┌───────────────────────────┐
│  Image                                  │  │  Summary                  │
│  [python-3.12 ✎]                        │  │                           │
│  ──────────────────────────────────     │  │  Image                    │
│  Memory                                 │  │  python-3.12@9c1e…        │
│  [ 2048 MiB        ▾ ]                  │  │                           │
│                                         │  │  Memory                   │
│  TTL                                    │  │  2048 MiB                 │
│  [ No expiry       ▾ ]                  │  │                           │
│  ↳ Tier 0 max: 7 days · Tier 1: 30d    │  │  TTL                      │
│                                         │  │  No expiry                │
│  Region                                 │  │                           │
│  [ Auto (closest)  ▾ ]                  │  │  Region                   │
│                                         │  │  auto                     │
│  Volumes                                │  │                           │
│  [ Attach a volume ▾ ]                  │  └───────────────────────────┘
│    → [empty state: see §2.1]            │
│                                         │
│  Environment variables                  │
│  ┌──────────────┬──────────────┬───┐   │
│  │ Name         │ Value        │ ✕ │   │
│  └──────────────┴──────────────┴───┘   │
│  [ + Add variable ]                     │
└─────────────────────────────────────────┘
```

**Image row:** shows the selected Image (`python-3.12` chip) with a pencil icon `✎` that returns the user to step 1 (the gallery). This is the edit-affordance noted in `create-config-image-edit-affordance.png`. Clicking `✎` goes back to step 1 without losing step-2 field values (preserved in form state).

**Memory:** dropdown with platform-defined tiers (2048 MiB / 4096 MiB / 8192 MiB / 16384 MiB). Image template seeds the default (Typescript App: 2048 MiB, Expo: 4096 MiB). The dropdown label shows the selected value + MiB unit. No free-text input.

**TTL dropdown options:**
- No expiry (default — "If these parameters are absent, sandboxes will not be deleted")
- 1 day
- 7 days (Tier 0 cap — gated with inline note)
- 30 days (Tier 1 required — inline tier gate at the option, not a blocking modal)

The tier-gate note sits inline below the TTL dropdown: `Tier 0 max: 7 days · Upgrade to Tier 1 for 30 days`. This follows `personality.md` Sacrificial choice #8 (free-tier surfaces visible, paid surfaces inline-gated).

**Region dropdown:** `Auto (closest) / eu-fra-1 / eu-lon-1 / us-was-1 / us-pdx-1`. Auto is the default. Canonical region IDs shown alongside human labels.

**Volumes:** See §2.1 for the empty state fix (Finding 2).

**Environment variables:** Inline row pattern (Name + Value + delete-icon). `+ Add variable` link below the rows. No separate page; no modal. Matches the existing env-vars pattern in production.

**Summary rail:** live-updating read-only column. Updates as the user changes fields. No Save button in the rail; this is a preview-only panel.

#### 2.1 Volumes — empty state fix (Finding 2)

**Current production behavior (broken):** clicking "Attach a volume" opens a dropdown with a search box + "No results found." when no Volumes exist. Dead control.

**Redesigned behavior:**

**Pattern chosen: dialog from the empty-state CTA.** Rationale: a form rendered inside a dropdown/popover has hostile dismiss behavior — Esc or outside-click destroys the user's work with no warning. The "inline in form body" inspiration from the notes came from the env-vars row, which is inline in the form body itself, not inside a popover. A small dialog (2 fields, per `container-choice.md` §1 dialog scope) avoids the dismiss problem while keeping the user in the create flow.

When no Volumes exist in the workspace:

```
  Volumes
  ┌────────────────────────────────────────────────────┐
  │  No Volumes in this workspace.                     │
  │  [ + Create Volume ]                               │
  └────────────────────────────────────────────────────┘
```

- "No Volumes in this workspace." — declarative. No illustration.
- `+ Create Volume` opens a small dialog with two fields: Volume name + Region. On confirm, the dialog closes and the new Volume appears already selected in the Volumes attachment — the user never leaves the create flow.
- The search input from production is suppressed when the empty state renders — search on zero items is a dead control.

When Volumes exist in the workspace:

```
  Volumes
  [ Search or select a Volume ▾ ]
    ○  vol-prod-data  (eu-fra-1)
    ○  vol-eval-store  (us-pdx-1)
  [ + Create a new Volume ]
```

- Dropdown with a search input (only rendered when ≥ 1 Volume exists — dead control eliminated).
- `+ Create a new Volume` at the bottom of the dropdown list opens the same 2-field dialog as the empty state.
- Volumes are region-filtered by default to match the selected Region in the form — a Volume in a different region shows a warning indicator, not a hard block, because the user may change the Region field after attaching.

**Footer (step 2):**
```
[ ← Prev ]                                          [ Cancel ]  [ Next → ]
  LEFT (ghost)                                         RIGHT CLUSTER (ghost + primary)
```

Prev: goes back to step 1, preserves step-2 field values. Silent — no discard confirm (Prev never fires a warning, per `stepper-actions.md` §4).
Cancel: checks dirty + high-stakes gate. Step 2 is dirty + high-stakes (multi-field config, consequential to deploy) → fires a discard-confirm dialog before dismissing. Two-condition gate per `form-actions.md` §7.
Next: validates required fields (Memory selected, Region selected) and navigates to step 3.

---

### Step 3 — Confirm + Launch (`/{workspace}/sandboxes/new?step=confirm`)

**Page header:**
```
Create Sandbox                                                          Step 3 of 3
Confirm and launch
```

**Layout: two-column (left form, right Summary rail — same rail as step 2)**

```
┌─────────────────────────────────────────┐  ┌───────────────────────────┐
│  Summary (read-only, with edit links)   │  │  Summary                  │
│  ┌──────────────────────────────────┐   │  │                           │
│  │ Image   python-3.12@9c1e…  [✎]  │   │  │  Image                    │
│  │ Memory  2048 MiB            [✎]  │   │  │  python-3.12@9c1e…        │
│  └──────────────────────────────────┘   │  │                           │
│                                         │  │  Memory                   │
│  Name your Sandbox                      │  │  2048 MiB                 │
│  ──────────────────────────────────     │  │                           │
│  Display name (optional)                │  │  TTL                      │
│  [ ________________________________ ]   │  │  No expiry                │
│  Shown in the dashboard.                │  │                           │
│                                         │  │  Region                   │
│  Sandbox name (required)                │  │  auto                     │
│  [ my-sandbox                      ]    │  │                           │
│  ⚠ Cannot be changed after creation.   │  └───────────────────────────┘
│    Lowercase letters, numbers, hyphens.  │
│    Max 49 characters.                   │
│                                         │
│  Launch                                 │
│  ──────────────────────────────────     │
│  [ TypeScript ] [ Python ] [ Go ]       │
│  [ cURL ]       [ CLI ]                 │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ import { SandboxInstance }       │   │
│  │   from "@blaxel/core";           │   │
│  │ const sb = await                 │   │
│  │   SandboxInstance               │   │
│  │   .createIfNotExists({          │   │
│  │     name: "my-sandbox",         │   │
│  │     image: "blaxel/python-3.12",│   │
│  │     memory: 2048,               │   │
│  │     region: "auto",             │   │
│  │   });                            │   │
│  └──────────────────────────────────┘   │
│  [ Copy snippet ]                       │
│                                         │
│  Or deploy from the console:            │
│  [ Create Sandbox ]                     │
└─────────────────────────────────────────┘
```

**Name section — ordering rationale.** The name fields come before the Launch section deliberately. The Sandbox name is immutable after creation — the user must commit to it before getting the launch snippet (which embeds the name in the code block). Reversing this order (launch snippet first) would embed a name the user hasn't confirmed yet. The `⚠ Cannot be changed after creation.` note uses `text-state-warning` token on the icon only, not on the whole label — it is a fact, not an error.

**Summary (read-only) at top of step 3:** Shows Image and Memory with `✎` edit-pencil icons. Clicking `✎` on Image returns to step 1; clicking `✎` on Memory returns to step 2. The user can correct any config from this screen without losing the name they already typed (the form preserves state across back-navigation). Form state (display name + sandbox name) is preserved across all back-navigation paths, including when the user navigates back to step 1 via the Image `✎` edit-pencil and then advances forward through step 2 to step 3 again.

**Display name vs. Sandbox name:**
- Display name: `metadata.displayName` — optional, up to 63 chars, spaces allowed. Shown in the dashboard.
- Sandbox name: `metadata.name` — required, immutable, lowercase-alphanumeric + hyphens, max 49 chars. Used in SDK/CLI and in the URL.
- The name field auto-populates from the display name (slugified) but is editable before creation.
- After creation, neither field appears editable in the dashboard (the name is locked; display name edit is a separate rename action on the detail page).

**Launch section:**
- Language tabs: TypeScript / Python / Go / cURL / CLI.
- Code block: auto-filled with the selected Image, Memory, Region, and Sandbox name from the form. Updates live as the user edits the name field.
- `[Copy snippet]` button: copies the code block content to clipboard. Single click, no modal.
- "Or deploy from the console" label + `[Create Sandbox]` primary button. Both are present and visually equal — neither is hidden. Alex will use the snippet; an explorer will use the button.
- After `[Create Sandbox]`: API is called, on success the user is navigated to the new Sandbox's detail page at `/{workspace}/sandboxes/{name}`. No confetti. No "Your Sandbox has been deployed!" hero modal. Navigation is the confirmation. Per `personality.md` Counterexample — "The celebration deploy."

**Footer (step 3):**
```
[ ← Prev ]                                          [ Cancel ]  [ Create Sandbox ]
  LEFT (ghost)                                         RIGHT CLUSTER (ghost + primary)
```

"Create Sandbox" is the terminal verb — not "Continue", not "Finish". Context-matched per `stepper-actions.md` §3 last-step rule.
Cancel: same two-condition gate as step 2 — dirty + high-stakes → discard confirm.
Prev: silent, returns to step 2, preserves step-3 field values.

**Loading state during Create Sandbox:** `[Create Sandbox]` button goes into a loading state (spinner inside the button, label reads "Creating…"). The rest of the form is not covered by an overlay. The user can still see the snippet and the summary rail while waiting.

**Error state (API failure on create):**

```
  ┌───────────────────────────────────────────────────────────┐
  │ ✕ Failed to create Sandbox — name "my-sandbox" already    │
  │   exists in this workspace. Choose a different name.      │
  └───────────────────────────────────────────────────────────┘
```

- Inline error below the Sandbox name field (if name conflict) or above the footer (if generic API error).
- Copy: cause + primitive noun + next move. No "Oops". No apology.
- Per `personality.md` Voice & copy error voice rules.

---

## 3. SDK / CLI path — `/{workspace}/sandboxes/new?path=sdk`

`/{workspace}/sandboxes/new` defaults directly to step 1 (Image gallery). There is no path-choice landing screen. Rationale: Alex (the primary console user) is in the terminal — she never sees this flow. The two-tile gate added friction for Sam and first-contact users who already clicked "Create Sandbox" and expected to enter the flow immediately. The label "Deploy from console" also conflicted with "Create from console" used elsewhere in the spec.

The SDK / CLI path is surfaced as a secondary text link in the step 1 page header:

```
Create Sandbox                                                          Step 1 of 3
Select an Image
                                               Use SDK / CLI instead →
```

- "Use SDK / CLI instead →" is a plain text link (`text-meta-foreground`, no button chrome) placed below the subtitle, right-aligned. Clicking it navigates to the SDK guide view (`/{workspace}/sandboxes/new?path=sdk`).
- The link is present on step 1 only — steps 2 and 3 are config territory, not entry-path territory.
- No path-choice landing screen. No two-tile entry state.

### 3.1 SDK guide view

A stepped instruction page (not a wizard — no form fields, no stepper footer). The existing production stepped guide (Install CLI → Login → Install SDK → Create sandbox → Run code → Create preview) is reproduced here with the following changes:

**"Copy page" affordance (operator suggestion — Finding note in notes.md):**

```
Install CLI          [ Open in ChatGPT ] [ Open in Claude ] [ Copy as Markdown ] [ Cancel ]
──────────────────────────────────────
```

- Top-right of the guide, paired with the existing Cancel button.
- `[ Copy as Markdown ]`: standalone primary button (no dropdown caret). Copies the entire page (all steps, all code blocks, in markdown format) to clipboard. Single click, no modal.
- `[ Open in ChatGPT ]` / `[ Open in Claude ]`: separate ghost buttons, visually adjacent to "Copy as Markdown" but categorically distinct — these are navigation actions (open in another app), not copy variants. Grouping them under a shared dropdown caret would imply they are copy variants, which they are not.
- **LLM deep-link placeholder:** if legal/brand review of the ChatGPT and Claude deep-link URL schemes is not complete at wireframe approval, omit the two ghost buttons and reserve the slot adjacent to "Copy as Markdown" for them. The standalone "Copy as Markdown" button is always present regardless.
- Placement rationale: top-right is where power-user utility actions live, adjacent to Cancel which is the exit affordance. Keeps the step content area uncluttered.
- No icon-only treatment — all labels are visible because these are non-obvious actions and Alex needs to know what each does.

**Step layout (unchanged from production):** left-side step list with numbered steps, right-side code block with language/tab variants (Mac brew vs cURL, TypeScript vs Python, API/MCP/Manual terminal). Each step's code block has a per-block copy icon.

**No "Create from console" CTA on the SDK guide.** The two paths separated at the entry screen; switching mid-guide requires the user to Cancel and re-enter. This avoids an ambiguous dual-CTA state on the guide page.

---

## 4. States covered per surface

| Surface | Default | Empty | Loading | Error |
|---|---|---|---|---|
| Sandboxes list (populated) | §1.4 | — | §1.8 | §1.9 |
| Sandboxes list (zero records) | — | §1.6 | §1.8 | §1.9 |
| Sandboxes list (filter no-results) | — | §1.7 | §1.8 | §1.9 |
| Aggregate strip (populated) | §1.3 | — (hidden) | §1.3 States | §1.3 States |
| Create step 1 (Image gallery) | §2 step 1 | (no images = empty gallery grid + SDK fallback note) | (skeleton tiles) | Inline "Failed to load Images. Retry." |
| Create step 2 (Resources) | §2 step 2 | (Volumes empty → §2.1) | — | Inline per-field validation errors |
| Create step 2 — Volumes picker | (items present) | §2.1 | — | Inline |
| Create step 3 (Confirm) | §2 step 3 | — | Button loading state | §2 step 3 error block |
| SDK guide | §3.1 | — | — | "Failed to load guide. Retry." |

---

## 5. Self-review

- [x] **Inheritance** — list page follows `tables.md` Archetype B + column-order rule; stepper follows `stepper-actions.md` split-anchor and per-step composition; container choice follows `container-choice.md` multi-step → page. Aggregate strip inherits from `foundations/empty-state.md` (hide vs. render rule for zero-record case) and `card-usage.md` (strip is NOT a card container — no `<Card>` wrapper).
- [x] **Tokens** — references only role-semantic tokens (`bg-state-error-subtle`, `text-state-error`, `bg-state-info-subtle`, `text-meta-foreground`, `bg-surface-secondary`, `font-mono`, `text-caption`, `text-muted-foreground`, `bg-muted`, `animate-pulse`, `border-border`). No invented tokens; no hardcoded hues. Strip active-row selection indicator reuses `bg-foreground` — no new color.
- [x] **States** — all four required states (default, empty, loading, error) covered per surface in §4. Strip has its own five-state matrix (§1.3 States) covering default / loading / empty workspace / filter-to-zero / error. Empty has two variants (zero-records vs. no-results) distinguished per `tables.md` §5. Step 3 covers a loading sub-state (button loading during create) and an error sub-state (API error inline).
- [x] **Vocabulary** — "Sandbox" (not instance/container), "Volume" (not disk/drive), "Image" (not template), "API key" (lowercase k), "Standby" (not paused/sleeping/cold), "Expires in" (not "Time before termination"), "Batch Job" not used here (out of scope), "Region" with canonical IDs (`eu-fra-1`, etc.). Banlist cross-checked against `platform.md` §Terminology. No "provenance" tile or filter — provenance is not a documented product surface.
- [x] **Anti-patterns** — no border-left state treatment; no hairline card separators as default grouping (strip dividers are column dividers inside a flat container, not card borders); no illustration empty states; no "Welcome to Sandboxes!" hero; no celebration on deploy; no "cute error" copy; no "Show terminated" toggle as a feature-of-note. Strip uses a 2px `bg-foreground` selection bar (structural indicator, shape-disambiguated from decoration) rather than a color-hued border-left. Sidebar hover-overlay (Finding 4) explicitly noted as app-shell territory and not designed here — assumption stated.
- [x] **Drift** — (Original) Finding 1 (button alignment) addressed by `stepper-actions.md` compliance. Finding 2 (Volumes dead empty state) addressed by dialog-from-CTA pattern (F2 adversarial audit). Finding 3 (three-step flow) kept; step 3 restructured with name-before-launch ordering. Finding 4 deferred to app-shell. "Copy page" (operator suggestion) addressed with standalone "Copy as Markdown" button + separate LLM ghost buttons (F7 adversarial audit). (Adversarial audit) F1: full-round-trip state-preservation contract made explicit. F3: path-choice landing screen dropped; `/new` defaults to step 1 with secondary "Use SDK / CLI instead →" link. F4: step 1 Cancel rule corrected to silent-always (low-stakes). F5: DEACTIVATING and BUILT rows added to state table. F6: empty-state icon omission made explicit with deviation rationale. F7: "Copy as Markdown" split from LLM navigation buttons. (This revision) §1.3 aggregate strip added; §1.4–§1.9 renumbered; §4 states table updated; §6 open question 7 added.

---

## 6. Open questions for operator

1. **Sidebar hover-overlay fix scope.** Finding 4 is deferred to app-shell. Confirm that the app-shell redesign is in scope for the current sprint, and that the fix (explicit-click-only sidebar expand on focused/form pages) is the chosen approach vs. a deadband timer or layout push.

2. **Volume create dialog — minimum fields.** The wireframe proposes a 2-field dialog (name + region). Confirm the minimum fields required to create a Volume — if more are required (e.g. size, storage type), the dialog grows accordingly.

3. **Tier gating on TTL options.** The wireframe shows "7 days (Tier 0 cap)" and "30 days (Tier 1 required)" as inline notes on the TTL dropdown options. Confirm: are 1-day, 7-day, and 30-day the correct tier-gated buckets for the current plan structure?

4. **Terminated Sandboxes in the list.** The wireframe defaults to hiding TERMINATED / DELETING Sandboxes and exposing them via an "Include terminated" chip in the toolbar. Confirm this is the right default, or whether terminated Sandboxes should be visible by default (production shows a "Show terminated" toggle that is off by default — this matches).

5. **Image gallery empty state.** If a workspace has no custom Images and the platform Images fail to load, what is the correct recovery path — show only platform Images, show an error with retry, or fall back to a "use the CLI" message?

6. **LLM deep-links on SDK guide.** The wireframe reserves a slot for "Open in ChatGPT" / "Open in Claude" ghost buttons adjacent to "Copy as Markdown". Confirm: (a) which LLMs to include, (b) whether the deep-link URL scheme is stable enough to ship, (c) whether legal/brand review is needed before linking to third-party LLM products.

7. **Aggregate strip — backend endpoint decision.** The demo computes aggregate counts client-side from the full mocked fixture (no pagination problem in mock). Production has cursor pagination (`meta.hasMore`, `meta.nextCursor`, `meta.total`) — a single page cannot yield accurate breakdowns by state / region / image across the full workspace. Production will need one of: (a) a dedicated `GET /sandboxes/aggregate` endpoint returning counts by state / region / image, or (b) the aggregate counts embedded in the list call's `meta` object alongside `total`. The strip component is authored to accept an `AggregateData` prop that could be populated by either approach; the data-source swap does not require a component change. Decision needed before the aggregate strip ships to production.
