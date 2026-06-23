# Policies — Text Wireframe

**Page:** Security › Policies  
**Route:** `/:workspaceSlugOrId/policies`  
**Phase:** Wireframes  
**Date:** 2026-06-22  
**Source scenarios:** Scenario 2 (Sam audit), Scenario 5 (Alex cleanup), Scenario 6 (Sam CLI verify); index page serves the entry point for all six policy detail scenarios.

---

## Layout context

Rendered inside the workspace shell (see `docs/design/wireframe/app-shell.md` §2): topbar with workspace switcher + identity cluster, left sidebar with Security group active, `Policies` item highlighted. Main content fills the right pane.

---

## States overview

This wireframe covers five distinct page states in order:

1. **Tier-1 locked** — workspace has no payment method; Policies surface is visible but gated
2. **Unlocked — empty** — tier unlocked, no policies created yet
3. **Populated** — one or more policies exist; multi-row table with mixed types and resourceTypes
4. **Loading** — data fetch in flight
5. **Error** — data fetch failed

---

---

## STATE 1 — Tier-1 locked (no payment method)

*Scenario trace: personality.md § "Free-tier surfaces visible, paid surfaces inline-gated" — the feature must be visible with its tier requirement at the point of use, never hidden entirely.*

*Field binding: tier gate is not a Policy API field — it is a workspace entitlement field surfaced by the account/plan API. The gate renders because `spec.type` policy creation requires Tier 1 (`platform.md` § Payment method → "Adding a payment method unlocks Tier 1 — enabling Volumes, Policies, Custom Domains, Cron triggers, and Revisions"). Footnote A.*

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Policies                                                                    │
│  Define where and how your AI workloads run. Policies control the            │
│  location, hardware flavor, and token usage of Agents, MCP Servers,          │
│  and Model APIs deployed in this workspace.                                  │
└──────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐  ┌────────────────────────┐
│  CAPABILITIES                                     │  │  UNLOCK POLICIES       │
│                                                   │  │                        │
│  ┌───────────────────────────────────────────┐   │  │  Policies require       │
│  │  Location policies                        │   │  │  Tier 1.               │
│  │  Control which data centers your          │   │  │                        │
│  │  workloads can be deployed to —           │   │  │  Add a payment method   │
│  │  by continent or country.                 │   │  │  to unlock.            │
│  └───────────────────────────────────────────┘   │  │                        │
│                                                   │  │  [Add payment method →]│
│  ┌───────────────────────────────────────────┐   │  │                        │
│  │  Token usage policies                     │   │  │  (links to             │
│  │  Control the maximum number of tokens     │   │  │  account-billing.md    │
│  │  consumed by Agents or Model APIs over    │   │  │  § B4 Payment method)  │
│  │  a period of time.                        │   │  │                        │
│  └───────────────────────────────────────────┘   │  └────────────────────────┘
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │  Multi-policy combinations                │   │
│  │  Combine policies for AND / OR logic:     │   │
│  │  same type = UNION (OR), different        │   │
│  │  types = INTERSECTION (AND).              │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
└───────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  RESOURCES                                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ┌────────────────────────────┐  ┌────────────────────────────┐            │
│  │  Documentation             │  │  API Reference             │            │
│  │  Model governance and      │  │  Manage policies via the   │            │
│  │  policy authoring guide →  │  │  REST API or `bl` CLI →    │            │
│  └────────────────────────────┘  └────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

- **Page header** — title + subtitle describe the surface without marketing phrasing. Subtitle names the three `spec.type` behaviors and the three workload kinds from `spec.resourceTypes[]` (`model | function | agent` in API terms; rendered as `Agents, MCP Servers, and Model APIs`).
- **Capabilities band (left)** — three feature cards: Location policies, Token usage policies, Multi-policy combinations. These replicate the production framing but name the `spec.type` values directly. `flavor` is intentionally omitted from this feature list — see Footnote B (flavor production-deferred). The UNION/INTERSECTION combination semantics are surfaced inline in the third card so any workspace-tier user reading the gate page understands the model before unlocking.
- **Right rail — "Unlock Policies"** — matches production's paywall framing. CTA `Add payment method →` links to `docs/design/wireframe/account-billing.md` § B4 Payment method. No orange or alarming color — disciplined tone. The feature is visible; the gate is inline.
- **Resources sub-section** — two callout cards matching production: Documentation / API Reference. These are always visible regardless of tier.
- **Create Policy button is absent** — the `+ Create Policy` action is not shown in the Tier-1-locked state. Showing a disabled button teaches nothing; the right rail is the action.

**Footnote A — Tier gate field binding.** The tier gate is not from the Policy API schema. It comes from the workspace entitlement model (account plan API, not enumerated in the Policy API). Design treats it as a precondition state; the list API either returns a permission error or the client-side entitlement check prevents loading. Screens phase resolves the exact API call and error code.

**Footnote B — `flavor` type, production-deferred.** The `spec.type` enum includes `location | flavor | maxToken`. Production's create-policy dropdown today exposes only `Location` and `Token usage`. The docs confirm flavor targets CPU types (x86 documented; GPU not in current docs). This wireframe **includes `flavor` in the create flow and detail page** (see policy-detail.md) with a footnote, so the design is schema-complete. The production UI may gate or postpone it — screens phase confirms whether to render it with a "coming soon" label or expose it fully. See Footnote D for create-flow handling.

---

---

## STATE 2 — Unlocked — empty (no policies)

*Scenario trace: personality.md § "CLI parity is visible, not hidden" — empty state leads with the `bl` command, not a Create button.*

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Policies                                           [+ Create Policy]        │
│  Define where and how your AI workloads run.                                 │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  No Policies in this workspace.                                              │
│                                                                              │
│  bl apply -f policy.yaml                                                     │
│                                                                              │
│  or [+ Create Policy] to author one in the dashboard.                        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

- **`+ Create Policy` button** — present in the page header row; also referenced inline in the empty state as a secondary affordance. Opens the create-policy inline panel (see § Create-policy flow below).
- **Empty state copy** — leads with the `bl apply -f policy.yaml` CLI command, no illustration, no "get started" paragraph. The CLI command is the primary affordance; the dashboard button is secondary. This matches personality.md sacrificial choice #5.
- **No feature list** — once unlocked, the capabilities marketing language disappears. The user knows what Policies are; the surface shows state (currently none).

---

---

## STATE 3 — Populated (multi-row table)

*Scenario trace: Scenario 2 (Sam audit — filtered view), Scenario 5 (Alex cleanup — filtered by zero usage), Scenario 6 (Sam CLI verify — fresh create appears in list).*

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Policies                                           [+ Create Policy]        │
│  Define where and how your AI workloads run.                                 │
└──────────────────────────────────────────────────────────────────────────────┘

 FILTERS  [Type: All ▼]  [Targets: All ▼]  [Sort: Updated ▼]  [🔍 Search…]

──────────────────────────────────────────────────────────────────────────────
 Name                     Type        Targets              Usage    Updated
──────────────────────────────────────────────────────────────────────────────
 eu-only-prod             location    Agents · Sandboxes   3 · 1    Jun 21
 pol-7a3f
 ─────────────────────────────────────────────────────────────────────────────
 token-cap-gpt4           maxToken    Model APIs           0        Jun 18
 pol-2c1e
 ─────────────────────────────────────────────────────────────────────────────
 gpu-flavor-staging        flavor     Agents               2        Jun 15
 pol-9b4d                            [coming soon]
──────────────────────────────────────────────────────────────────────────────

 3 policies · Combination rule: UNION within type (OR) · INTERSECTION across types (AND)
```

**Column anatomy:**

- **Name** — two-line: `metadata.displayName` (row 1, standard weight) + `metadata.name` truncated to 12 chars (row 2, monospace, muted). The canonical ID is pasteable from the row per personality.md sacrificial choice #2. Clicking the name row navigates to the policy detail page (`/policies/{name}`).
- **Type** — `spec.type` value rendered as a human label: `location` | `maxToken` | `flavor`. Label, not a chip — no decorative color for category (interaction principle #4: color carries state, not category). A `flavor` row shows a muted `[coming soon]` label if production gates it.
- **Targets** — `spec.resourceTypes[]` rendered as a joined list of workload-kind labels using canonical names: `Agents` (for `agent`), `Sandboxes` (for `sandbox`), `Model APIs` (for `model`), `MCP Servers` (for `function`), `Applications` (for `application`). Multiple values joined with `·`. Field binding: `spec.resourceTypes[]`.
- **Usage** — per-kind usage counts from `Policy.usage.{agents, functions, models, jobs, sandboxes}` (`PolicyUsageCounts` — integer counts on the Policy resource itself). Rendered as a compact joined list of non-zero counts. Example: `3 · 1` means 3 Agents + 1 Sandbox attach this policy. Zero across all kinds renders as `0` — the cleanup signal (Scenario 5). Field binding: `Policy.usage.*` (count integers, not names). Footnote C (count source vs names source distinction).
- **Updated** — `metadata.updatedAt` rendered as a relative date for scanning. Full timestamp on hover (tooltip). Field binding: `metadata.updatedAt`.

**Failure row visual weight — interaction principle #5 (Failure outranks success):**

A policy with `usage = 0` (nothing attaches it — stale candidate) renders the Usage cell in an amber muted color to visually weight it above zero-impact rows. This is the primary failure signal on the index: a policy existing but enforcing nothing is the Sam-audit concern and the Alex-cleanup trigger. Policies with active usage render usage counts in default foreground. No "all-green" treatment — stale rows stand out.

**Combination semantics footer:**

```
 3 policies · Combination rule: UNION within type (OR) · INTERSECTION across types (AND)
```

Rendered as a single muted footer line below the table. This surfaces the UNION/INTERSECTION algebra verbatim so any user reading the list with three rows targeting one Sandbox can predict the resolved policy. It is always visible on the populated state — not behind an info tooltip. Field binding: combination semantics are a docs-defined property of the Policy system, not a field on any individual Policy; the footer is a static annotation.

**Filters:**

- **Type filter** — `[Type: All ▼]` — options: All / location / maxToken / flavor. Filters on `spec.type`. Client-side or server `q` param.
- **Targets filter** — `[Targets: All ▼]` — options: All / Agents / Model APIs / MCP Servers / Sandboxes / Applications. Filters on `spec.resourceTypes[]`. (5 options matching the API enum: `agent | model | function | sandbox | application` — no `job` value in this enum.)
- **Sort** — `[Sort: Updated ▼]` — options: Updated (default, descending by `metadata.updatedAt`) / Name (ascending `metadata.displayName`) / Usage (descending total usage count). Scenario 2 (Sam audit): sort by Updated to find recently changed policies. Scenario 5 (Alex cleanup): sort by Usage ascending, then filter visually for 0-usage rows.
- **Search** — `[🔍 Search…]` — filters by `metadata.displayName` or `metadata.name`. Full-text or prefix match against `q` param.

**Row actions (on hover / `⋯` menu):**

Each row carries a `⋯` overflow menu on hover:
- `Open` — navigates to detail page (same as clicking the name)
- `Edit` — opens the create/edit inline panel pre-populated with this policy's spec
- `Delete` — inline confirmation: `Delete policy {name}? This removes it from all attached workloads.` Confirm / Cancel. No modal stack — inline.
- `Copy bl command` — copies `bl policy get {name}` or the equivalent `bl apply` command to clipboard

**Footnote C — two distinct usage data sources.** There are two different endpoints and two different shapes:

1. **`Policy.usage.*` — `PolicyUsageCounts` (integer counts)** — returned on the Policy resource itself (`GET /policies` list response and individual Policy object). Fields: `agents: integer`, `functions: integer`, `jobs: integer`, `models: integer`, `sandboxes: integer`. **This is the source for the index page Usage column.** A count of `3` means 3 Agents have `spec.policies` referencing this policy — it does not mean those Agents are currently running.

2. **`GET /policies/{name}/usages` → `PolicyUsages` (arrays of objects)** — a separate endpoint that returns arrays of workload name objects per kind. Fields: `agents: object[]`, `functions: object[]`, `jobs: object[]`, `models: object[]`, `sandboxes: object[]`. **This is the source for the detail page Band 3 expanded name rows.**

The two must not be conflated. The index Usage column reads counts from the Policy resource (`Policy.usage.agents: integer`); the detail page expand reads names from the `/usages` endpoint (`PolicyUsages.agents: object[]`). Screens phase wires them to their respective endpoints accordingly. Neither source reflects live workload running state — a joined `3 · 1` display is schema-accurate; a "3 active, 0 errored" breakdown is not (requires a live-state join not available from the Policy API).

---

---

## STATE 4 — Loading

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Policies                                           [+ Create Policy]        │
│  Define where and how your AI workloads run.                                 │
└──────────────────────────────────────────────────────────────────────────────┘

 FILTERS  [Type: All ▼]  [Targets: All ▼]  [Sort: Updated ▼]  [🔍 Search…]

──────────────────────────────────────────────────────────────────────────────
 Name                     Type        Targets              Usage    Updated
──────────────────────────────────────────────────────────────────────────────
 ████████████████         ████████    ████████████         ██       ███████
 ████████
 ─────────────────────────────────────────────────────────────────────────────
 ████████████████████     ████████    ████████             ██       ███████
 ████████████
 ─────────────────────────────────────────────────────────────────────────────
 █████████████████        ████████    ████                 ██       ███████
 ████████
──────────────────────────────────────────────────────────────────────────────
```

**Anatomy:** Three skeleton rows at the same column widths as the populated state. No spinner. The `+ Create Policy` button and filter controls render at their actual positions (not skeletonized) — they are client-side affordances that do not depend on the list fetch. The table body skeletons. No "Loading…" label — skeleton IS the loading signal per personality.md (no spinners, no loading banners).

---

---

## STATE 5 — Error

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Policies                                           [+ Create Policy]        │
│  Define where and how your AI workloads run.                                 │
└──────────────────────────────────────────────────────────────────────────────┘

 FILTERS  [Type: All ▼]  [Targets: All ▼]  [Sort: Updated ▼]  [🔍 Search…]

──────────────────────────────────────────────────────────────────────────────
 Name                     Type        Targets              Usage    Updated
──────────────────────────────────────────────────────────────────────────────

  Policies unavailable — could not load workspace policies. Retry ↻

──────────────────────────────────────────────────────────────────────────────
```

**Anatomy:** The error message replaces the table body rows. It is inline — not a toast, not a modal. Copy: cause (`could not load workspace policies`) + next move (`Retry ↻`). No apology, no "something went wrong" hedge. Column headers remain visible so the user knows the shape of the data they're waiting for. `Retry ↻` is a clickable link that re-triggers the list fetch.

---

---

## Create-policy flow

*Scenario trace: Scenario 6 (Sam CLI verify — dashboard create path); cross-cutting `bl` parity story from `alex-user-stories.md`. The create flow is specified inline here (as part of the index page) rather than as a separate screen — rationale: the production create flow is an overlay panel, not a full-page navigation. Sam's "author in dashboard" path and the CLI path are peers; the panel stays in context of the list.*

*Footnote D — flavor in the create flow.* The production dropdown today exposes `Location` and `Token usage` only. This wireframe **designs the `Flavor` option in the dropdown** so the spec is schema-complete, with a `[coming soon]` label on the option. Screens phase confirms whether to show it enabled, disabled, or hidden. If the operator chooses to drop flavor from the create flow at the screens phase, this wireframe's footnote is the documented decision point.

### Entry

Clicking `+ Create Policy` (header action, or the inline link in the empty state) opens a right-side panel overlay. The list behind it dims but remains visible. The panel does not navigate away from the index route.

### Panel — Step 1: Type + Name

```
┌─────────────────────────────────────────────────────────────┐
│  Create Policy                                          [×] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Policy type                                                │
│  [Location          ▼]                                      │
│  Control the location of the data centers where your        │
│  workloads will be executed.                                │
│                                                             │
│  ─── Options ──────────────────────────────────────────     │
│  Location          — continent or country allow-list        │
│  Token usage       — per-period token cap                   │
│  Flavor [coming soon] — CPU type allow-list                 │
│                                                             │
│  Display name                                               │
│  [____________________________]                             │
│  metadata.displayName — human label                         │
│                                                             │
│  Policy name (canonical ID)                                 │
│  [____________________________]                             │
│  metadata.name — used in bl commands and spec.policies[]    │
│  Lowercase, hyphens only. Auto-generated from display name. │
│                                                             │
│  Target workload types                                      │
│  [✓] Agents    [✓] Model APIs    [ ] MCP Servers            │
│  [ ] Sandboxes [ ] Applications                             │
│  spec.resourceTypes[] — which workload kinds this policy    │
│  can be attached to. Enum: agent | model | function |       │
│  sandbox | application (no "job" value in this enum).       │
│                                                             │
│  [Continue →]                                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  OR — apply a YAML manifest directly                        │
│                                                             │
│  apiVersion: blaxel.ai/v1alpha1                             │
│  kind: Policy                                               │
│  metadata:                                                  │
│    name: my-policy                                          │
│    displayName: My Policy                                   │
│  spec:                                                      │
│    type: location                                           │
│    resourceTypes:                                           │
│      - agent                                                │
│    locations:                                               │
│      - type: continent                                       │
│        name: North America                                  │
│      - type: country                                        │
│        name: US                                             │
│                                                             │
│  [Apply YAML]                                               │
└─────────────────────────────────────────────────────────────┘
```

**YAML manifest panel:**

- Mirrors the production "OR" alternative — shown below the form as a peer path, not hidden behind a toggle
- Schema-accurate: `apiVersion: blaxel.ai/v1alpha1`, `kind: Policy`, `metadata.{name, displayName}`, `spec.{type, resourceTypes[], locations[]}` with `{type: continent|country, name: string}` items (field binding: all fields from the Policy API schema)
- Switches to the appropriate `spec.*` section when the user changes the Type dropdown (location → `locations[]`, maxToken → `maxTokens:{}`, flavor → `flavors[]`)
- `[Apply YAML]` CTA submits the manifest directly; the panel closes and the new policy appears in the list within 5 seconds (interaction principle #3 — status streams; Scenario 6 re-entry contract)

### Panel — Step 2a: Location clause (when type = location)

```
┌─────────────────────────────────────────────────────────────┐
│  Create Policy — Location clause                       [×] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Allowed locations                                          │
│  spec.locations[] — continent or country allow-list.        │
│  Workloads are deployed only to matching data centers.      │
│  Mixed granularity allowed in one policy.                   │
│                                                             │
│  [Search continents and countries…      ▼]                  │
│                                                             │
│  Selected:                                                  │
│  [Continent: North America ×]  [Country: United States ×]   │
│                                                             │
│  Combination note: adding both a continent and a country    │
│  from the same region creates a UNION (OR) — the workload   │
│  can run in either. The INTERSECTION (AND) applies only     │
│  across policy types, not within a single policy.           │
│                                                             │
│  [← Back]  [Create Policy]                                 │
└─────────────────────────────────────────────────────────────┘
```

**Field binding:** `spec.locations[]` items: `{type: continent | country, name: string}`. The combobox renders both granularities as mixed items. Selected items render as chips labeled `Continent: {name}` or `Country: {name}` to make the granularity visually distinct — matching the production screenshot pattern. Removing a chip sets `spec.locations[]` to the remaining items.

### Panel — Step 2b: Token usage clause (when type = maxToken)

```
┌─────────────────────────────────────────────────────────────┐
│  Create Policy — Token usage clause                    [×] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Granularity window                                         │
│  spec.maxTokens.granularity                                 │
│  [month ▼]   — month | day | hour | minute                  │
│                                                             │
│  Step (number of granularity units per window)              │
│  spec.maxTokens.step                                        │
│  [  1  ]                                                    │
│                                                             │
│  Token thresholds (0 = not evaluated)                       │
│                                                             │
│  Input tokens per window:    spec.maxTokens.input           │
│  [  0  ]  ← "not evaluated" when 0                          │
│                                                             │
│  Output tokens per window:   spec.maxTokens.output          │
│  [  0  ]                                                    │
│                                                             │
│  Total tokens per window:    spec.maxTokens.total           │
│  [  0  ]                                                    │
│                                                             │
│  Input/output ratio cap:     spec.maxTokens.ratioInputOverOutput │
│  [  0  ]  ← "not evaluated" when 0                          │
│                                                             │
│  [← Back]  [Create Policy]                                 │
└─────────────────────────────────────────────────────────────┘
```

**Field binding:** All six `spec.maxTokens` fields rendered — `input`, `output`, `total`, `ratioInputOverOutput`, `granularity`, `step`. When value = 0, the helper text reads "not evaluated" inline below the field (not rendered as zero — matches the constraint). No collapsed or abbreviated view — all six fields on one step per Scenario 6 (Sam verifies every field matches her YAML).

### Panel — Step 2c: Flavor clause (when type = flavor) [coming soon]

```
┌─────────────────────────────────────────────────────────────┐
│  Create Policy — Flavor clause  [coming soon]          [×] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Allowed hardware flavors                                   │
│  spec.flavors[] — CPU type allow-list.                      │
│  Workloads are deployed only on matching hardware.          │
│                                                             │
│  [Search CPU flavors…           ▼]                          │
│                                                             │
│  Selected:                                                  │
│  (none)                                                     │
│                                                             │
│  Example: spec.flavors[]: [{name: "t4", type: "cpu"}]       │
│                                                             │
│  ⚠ Flavor policies are not yet available in the            │
│    production dashboard. You can author them via            │
│    bl apply -f policy.yaml or the REST API.                │
│                                                             │
│  [← Back]  [Create Policy]                                 │
└─────────────────────────────────────────────────────────────┘
```

**Field binding:** `spec.flavors[]` items: `{name: string, type: cpu | gpu}`. Docs today enumerate only `cpu` type (x86 documented); `gpu` appears in the API schema but is not documented with concrete flavor names. The combobox surfaces whatever flavors the API returns. The `⚠` note is honest about production state without hiding the feature — screens phase decides whether to enable, disable, or hide this step.

*Footnote D — screens phase decision:* If screens phase confirms flavor is production-deferred, replace Step 2c with a read-only info band: "Flavor policies can be authored via `bl apply -f policy.yaml` or the REST API. Dashboard UI coming soon." Remove the Create button from this state so Sam can't submit an incomplete form.

### Post-create

After `[Create Policy]` is submitted successfully:
- Panel closes
- New policy row appears in the list (top of the sort by Updated) within 5 seconds
- No toast, no celebration modal — the row appearing IS the confirmation. (Scenario 6: Sam verifies by clicking the row → detail page)
- On error: inline panel error: `Policy creation failed — {API error message}. Retry or apply via bl apply -f policy.yaml.` Panel stays open.

---

---

## Scenario verification gate

| Scenario | Wireframe answer | Region |
|---|---|---|
| **Scenario 2 — Sam audit (filtered by labels/updatedAt)** | Sort by Updated descending (default) + Type/Targets filters let Sam narrow to compliance-tagged policies. Row shows `metadata.updatedAt` in Updated column. Full detail drills on click. | Populated state table + filters |
| **Scenario 5 — Alex cleanup (zero usage)** | Usage column shows `0` in amber for zero-attachment policies. Sort by Usage ascending surfaces stale policies at top. | Populated state table, Usage column |
| **Scenario 6 — Sam CLI verify** | Create panel (dashboard path) renders all spec fields on Step 2. YAML manifest panel shown as peer path. After create, row appears in list; Sam clicks to verify on detail page. | Create-policy flow, post-create row |
| **Combination semantics visible** | Footer line on populated state: `Combination rule: UNION within type (OR) · INTERSECTION across types (AND)`. Also surfaced in capability card #3 on the locked state, and inline in Step 2a location clause panel. | Populated state footer, Locked state capability card |
| **Tier-1 paywall** | State 1 — full capability feature list visible with right-rail paywall. CTA links to account-billing.md § B4. | State 1 |
| **CLI parity** | Empty state leads with `bl apply -f policy.yaml`. Create panel has YAML manifest alternative. Row `⋯` menu has `Copy bl command`. | States 2, 3, Create flow |
| **Failure outranks success** | Zero-usage rows render Usage cell in amber; active-attachment rows render in default foreground. Stale policies visually out-weight enforcing ones. | Populated state table |

---

## Verification gate self-check

1. **All five states present** — Tier-1 locked / unlocked-empty / populated / loading / error — each with distinct layout and copy. PASS.
2. **Every column binds to a schema field** — Name (`metadata.displayName` + `metadata.name`), Type (`spec.type`), Targets (`spec.resourceTypes[]`), Usage (`usage.*`), Updated (`metadata.updatedAt`). PASS.
3. **Combination semantics visible** — footer on populated state, capability card on locked state, inline note in create step 2a. PASS.
4. **Tier-1 paywall links to account-billing.md § B4** — confirmed in State 1 anatomy. PASS.
5. **All three spec.type values in create flow** — location (Step 2a), maxToken (Step 2b), flavor (Step 2c with coming-soon label + footnote). PASS.
6. **YAML manifest in create flow** — present as "OR" peer below the form in Step 1. PASS.
7. **Failure outranks success (visual hierarchy)** — zero-usage rows amber, active rows default. Token spec deferred to design-token phase; hierarchy is specified. PASS.
8. **Schema-uncertain items footnoted** — Footnote A (tier gate), Footnote B (flavor), Footnote C (two distinct usage endpoints: `Policy.usage.*` counts on the Policy resource vs `GET /policies/{name}/usages` names — disambiguated for screens phase), Footnote D (screens phase flavor decision). PASS.
