# Policy Detail — Text Wireframe

**Page:** Security › Policies › {name}  
**Route:** `/:workspaceSlugOrId/policies/{name}`  
**Phase:** Wireframes  
**Date:** 2026-06-22  
**Source scenarios:** All six — Scenario 1 (Alex traces blocked sandbox), Scenario 2 (Sam audit), Scenario 3 (Alex investigates maxToken throttle), Scenario 4 (Sam multi-policy forensic), Scenario 5 (Alex cleanup), Scenario 6 (Sam CLI verify). Scenarios file: `.intermediate/discovery/policy-detail/scenarios.md`.

---

## Layout context

Rendered inside the workspace shell (see `docs/design/wireframe/app-shell.md` §2): topbar with workspace switcher + identity cluster, left sidebar with Security > Policies active. The detail page occupies the full main content area. A breadcrumb trail shows: `Policies / {metadata.displayName}`.

---

## Header contract (all scenarios)

*Synthesis from scenarios.md — intersection of all six scenarios' header requirements. Every field here is visible on first paint without scrolling.*

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Policies / eu-only-prod                                                     │
│                                                                              │
│  eu-only-prod                                            [Edit]  [⋯]       │
│  pol-7a3f                          ← metadata.name, monospace, muted        │
│                                                                              │
│  Type: location         Targets: Agents · Model APIs · Sandboxes             │
│  spec.type ──────────   spec.resourceTypes[] ────────────────────────────── │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Header fields — field-by-field binding:**

- `eu-only-prod` — `metadata.displayName`. Primary identity; the human label used in Slack threads, tickets, and audit lines. Standard weight, prominent size.
- `pol-7a3f` — `metadata.name` (canonical ID). Monospace, muted foreground, second line. Pasteable into `bl` commands and `spec.policies[]` on workloads. Clicking copies to clipboard (copy icon on hover).
- `[Edit]` — navigates to (or opens inline panel for) the edit form pre-populated with this policy's spec. Equivalent to the create panel in edit mode.
- `[⋯]` — overflow: Delete / Copy bl command / Copy link (URL-addressability per interaction principle #8).
- **Type** — `spec.type` value: `location` / `flavor` / `maxToken`. Rendered as a label-value pair, not a chip. The type declares the clause kind on first glance — audit question 1 and 6 both require this.
- **Targets** — `spec.resourceTypes[]` joined list using canonical display names (agent → `Agents`, model → `Model APIs`, function → `MCP Servers`, sandbox → `Sandboxes`, application → `Applications`). API enum: `model | function | agent | sandbox | application` — `job` is not a valid `spec.resourceTypes[]` value. Audit question 2 requires this visible on first paint.

**Footnote E — Policy mode pill dropped.** The `enforced / audit-only / draft` state pill is absent from the header on first paint. The Policy API schema (`https://docs.blaxel.ai/api-reference/policies`) exposes no `mode` or `status` field — only `metadata`, `spec`, and `usage`. The states listed in `personality.md` are product-aspirational and not yet implemented. Designing the pill as a default-present header element would invent a data field that the API does not surface — the same failure mode as the Custom Domains prior gate. **Decision: pill is omitted from the header.** If a `mode` or `status` field materialises in the API at screens phase, the pill is added then. The fallback design (two identity lines only) IS the default design. No further fallback needed — this IS the ship state.

---

## Band structure

Five bands rendered in this order for every policy type. The type-specific clause band (Band 2) changes content based on `spec.type`. All other bands are constant.

1. **Header** — see above (all scenarios)
2. **Clause band** — the policy's constraint, rendered per `spec.type` (Scenarios 1, 2, 3, 6)
3. **Usage band** — workloads that reference this policy (Scenarios 1, 2, 3, 4, 5)
4. **Provenance band** — metadata audit trail (Scenarios 2, 5, 6)
5. **CLI band** — `bl` command + YAML manifest (Scenarios 1, 5, 6 explicit; all scenarios via cross-cutting rule)

Band label treatment matches `account-billing.md`: small-caps track label, letter-spaced, muted — orientation, not a heading. No `<Card>` wrappers — flat bands on the page scroll.

---

---

## BAND 2A — Clause band: `spec.type = location`

*Scenario trace: Scenario 1 (which clause blocked the deploy?), Scenario 2 (what does this policy restrict?), Scenario 6 (did it land with the right clause values?).*

*Audit question answered: Q1 — "Which clause of this policy — location, flavor, or maxToken — caused the deny, and what is the clause currently set to?"*

```
── CLAUSE ─────────────────────────────────────────────────────────────────────

  Type: location
  Workloads attached to this policy are deployed only in these locations.
  Requests routed to any other data center are denied.

  Allowed locations                        spec.locations[]
  ──────────────────────────────────────────────────────
  [Continent: North America]  [Country: United States]
  [Country: Germany]  [Country: France]

  Mixed granularity: continent-level and country-level entries combine
  as a UNION (OR) — the workload can run in any matching data center.

───────────────────────────────────────────────────────────────────────────────
```

**Anatomy:**

- **Description line** — one sentence explaining what the `location` type enforces. Honest cause-language: "Requests routed to any other data center are denied." Not softened.
- **Allowed locations** — `spec.locations[]` rendered as chips. Each chip labeled `{type}: {name}` — e.g. `Continent: North America`, `Country: United States`. The prefix makes granularity visible at a glance (matching the production combobox chip pattern from the operator's screenshot). Two granularities coexist in one array; the mixed-granularity note below the chips explains the UNION rule.
- **Mixed-granularity note** — inline, plain text, below the chip cluster. Surfaces the UNION semantics in the context where they're most relevant (the clause itself). Does not repeat the footer line from the list page — it's contextual here, not global.
- **Empty clause state** (locations array is empty or policy is malformed): `No locations configured — this policy does not restrict deployment location. Edit to add locations.` One line, no illustration.

**Field bindings:** `spec.locations[]` items each as `{type: continent | country, name: string}`. Chip label maps `type` to title-case prefix + `name` value.

---

## BAND 2B — Clause band: `spec.type = flavor`

*Scenario trace: Scenario 1 (which clause?), Scenario 2 (what does this policy restrict?), Scenario 6 (did it land correctly?). Note: flavor may be production-deferred — Footnote B from policies.md applies here too.*

*Audit question answered: Q1, Q2 — clause type visible; clause content explicit.*

```
── CLAUSE ─────────────────────────────────────────────────────────────────────

  Type: flavor
  Workloads attached to this policy are deployed only on these hardware
  configurations. Requests scheduled on any other hardware type are denied.

  Allowed flavors                          spec.flavors[]
  ──────────────────────────────────────────────────────
  [CPU: t4]  [CPU: x86-standard]

  ⚠ Flavor policies are not yet available in the production dashboard.
    You can manage this policy via bl apply -f policy.yaml or the REST API.

───────────────────────────────────────────────────────────────────────────────
```

**Anatomy:**

- **Allowed flavors** — `spec.flavors[]` rendered as chips labeled `{type}: {name}` (e.g. `CPU: t4`). The `type` field prefix (`cpu` or `gpu`) is displayed title-cased. GPU chips render if the API returns GPU flavor items; the docs today enumerate only `cpu` type.
- **Warning note** — honest about production state, matches Footnote D / B from the index wireframe. The policy spec IS persisted and enforced even if the dashboard UI for creating flavor policies is not shipped; the detail page must still display it.
- **Empty clause state:** `No flavors configured — this policy does not restrict hardware type. Edit to add flavors.`

**Field bindings:** `spec.flavors[]` items each as `{name: string, type: cpu | gpu}`. Chip label: `{type title-cased}: {name}`.

---

## BAND 2C — Clause band: `spec.type = maxToken`

*Scenario trace: Scenario 3 (Alex — what are the input/output/total caps and at what granularity?), Scenario 6 (Sam — did all six fields land correctly?).*

*Audit question answered: Q3 — "What are the input, output, and total token caps on this policy, at what granularity, and which Model APIs currently reference it?"*

```
── CLAUSE ─────────────────────────────────────────────────────────────────────

  Type: maxToken
  Token consumption for attached workloads is capped per window.
  Requests exceeding the cap receive 429. All subsequent requests
  within the window are dropped.

  Window                                   spec.maxTokens.granularity + step
  ─────────────────────────────────────────────────────────────────────────
  1 month                                  granularity: month / step: 1

  Token limits                             spec.maxTokens.*
  ─────────────────────────────────────────────────────────────────────────
  Input tokens per window       1,000,000  spec.maxTokens.input
  Output tokens per window      not evaluated  spec.maxTokens.output = 0
  Total tokens per window       2,000,000  spec.maxTokens.total
  Input/output ratio cap        not evaluated  spec.maxTokens.ratioInputOverOutput = 0

───────────────────────────────────────────────────────────────────────────────
```

**Anatomy:**

- **Window** — `spec.maxTokens.granularity` + `spec.maxTokens.step` combined into a human-readable label: `{step} {granularity}` (e.g. `1 month`, `15 minute`, `4 hour`). Rendered as a named pair, not a table row.
- **Token limits table** — four rows, one per threshold field. Each row: label / value / field name (muted, right-aligned). **When value = 0, render as "not evaluated"** — never as "0". This is a hard constraint from the spec: `threshold = 0 means "not evaluated"`. The "not evaluated" text is muted/secondary so it does not draw equal visual weight to active caps.
- **Active cap rows** (non-zero values) render in default foreground weight. `not evaluated` rows render in muted foreground. This creates the failure-outranks-success visual hierarchy at the field level: configured caps are the signal, not-evaluated rows are the background.
- **Description line** — cites the 429 behavior verbatim from the docs ("Requests exceeding the cap receive 429. All subsequent requests within the window are dropped."). Cause + effect, no softening.

**Schema-uncertain — live token consumption (Footnote F):**

Live consumption against the cap (e.g. "you are at 78% of the per-minute total") is NOT in the `spec.maxTokens` schema — the Policy API only stores the cap declaration, not a counter. The docs describe the enforcement behavior (429 on breach) but do not expose a metering endpoint under `/api-reference/policies`. **This reading is therefore absent from the default-content contract.** If a separate metering surface exists (e.g. under an observability or billing API), screens phase will confirm and add a "Current window usage" row to this band. Until confirmed: the band shows only the declared caps, with a muted note: `Live consumption data — see workload metrics for attached Agents and Model APIs.` (one line, muted, links to nothing until screens phase resolves the source).

**Field bindings:** `spec.maxTokens.input` (integer, 0 = not evaluated), `spec.maxTokens.output` (integer, 0 = not evaluated), `spec.maxTokens.total` (integer, 0 = not evaluated), `spec.maxTokens.ratioInputOverOutput` (integer, 0 = not evaluated), `spec.maxTokens.granularity` (string: month|day|hour|minute), `spec.maxTokens.step` (integer).

---

---

## BAND 3 — Usage band

*Scenario trace: Scenario 1 (is this policy attached to the Sandbox that was blocked?), Scenario 2 (which workloads currently reference it?), Scenario 3 (which Model APIs reference it?), Scenario 4 (peer-policy adjacency on workloads), Scenario 5 (is anything still using this policy?).*

*Audit questions answered: Q2 — "What does this policy restrict, on which workload kinds, and which workloads in this workspace currently attach it?"; Q3 — "...which Model APIs currently reference it?"; Q5 — "Is anything still using this policy...?"*

```
── USAGE ──────────────────────────────────────────────────────────────────────

  Workloads referencing this policy

  Agents           3     ▼              Policy.usage.agents: 3 (integer count)
  ─────────────────────────────────────────────────────────────────────────────
  cubic-prod-agent                      ← names from GET /policies/{name}/usages
  webflow-content-agent                    → PolicyUsages.agents: object[]
  staging-v2-agent

  Each of these Agents also attaches:   Footnote G (peer-policy adjacency)
  cubic-prod-agent   → [token-cap-gpt4]  [eu-only-prod ← this policy]
  webflow-content-agent → [token-cap-gpt4]
  staging-v2-agent   → (only this policy)

  ─────────────────────────────────────────────────────────────────────────────

  Model APIs        0                   Policy.usage.models: 0 (integer count)
  MCP Servers       0                   Policy.usage.functions: 0 (integer count)
  Jobs              0                   Policy.usage.jobs: 0 (integer count)
  Sandboxes         1     ▼             Policy.usage.sandboxes: 1 (integer count)
  ─────────────────────────────────────────────────────────────────────────────
  sbx-9c1e                              ← names from GET /policies/{name}/usages
                                           → PolicyUsages.sandboxes: object[]

───────────────────────────────────────────────────────────────────────────────
```

**Anatomy:**

- **Per-kind rows** — five rows, one per resource kind: Agents / Model APIs / MCP Servers / Jobs / Sandboxes. Each shows an integer count drawn from `Policy.usage.{agents, functions, models, jobs, sandboxes}` (`PolicyUsageCounts` — returned on the Policy resource itself). Rows with count 0 render in muted foreground — present but not dominant. Rows with count > 0 render in default foreground and are expandable (▼ expander).
- **Expanded name list** — when expanded, workload names are fetched from `GET /policies/{name}/usages` → `PolicyUsages.{agents|functions|models|sandboxes}[]` (arrays of objects, one entry per workload). Each name is a link to the workload's detail page (e.g. `/agents/{name}`). This is a **separate API call** from the count; the count on the collapsed row comes from `Policy.usage.*` (integer), the names in the expanded view come from the `/usages` endpoint. Screens phase wires these to their respective endpoints. This satisfies interaction principle #7 (every aggregate links to its primitives).
- **Zero-usage state (all five counts = 0):** The entire band reads:

  ```
  No workloads reference this policy.
  Safe to delete — no attached workloads will be affected.
  bl policy delete eu-only-prod
  ```

  This is the Scenario 5 green-light-to-delete signal. The `bl policy delete` command is inline here (not only in the CLI band) because the zero-usage state is the specific trigger for the delete action.

- **Failure outranks success — visual priority:** Rows with non-zero usage render at full weight; zero-usage rows are muted. The non-zero rows draw the eye first — Alex, coming from a workload that was blocked (Scenario 1), should immediately see her Sandbox in the Sandboxes count.

**Peer-policy adjacency (Scenario 4) — Footnote G:**

Scenario 4 requires seeing which *other* policies are attached to the same workloads, so Sam can understand this policy's contribution to the combined effect. The Usage band shows this as an adjacency sub-row per workload name: `{workload name} → [{peer-policy-1}] [{peer-policy-2}]`. Each peer policy name links to its own detail page.

**Schema-uncertain — adjacency requires a join (Footnote G).** The `list-resources-using-a-policy` endpoint returns workload names per kind. Each workload's `spec.policies` field contains the list of policy names attached to it — but this requires a separate read of each workload's spec (one API call per workload). The wireframe designs the adjacency inline as the default-visible content because it answers Scenario 4's audit question. Screens phase resolves whether to (a) denormalize this data at the API layer, (b) perform the join client-side on page load (N+1 reads — acceptable if workload counts are small), or (c) defer adjacency to a "expand to see peer policies" action. **Fallback design:** if the join is too expensive or not implemented at screens phase, the adjacency sub-row is replaced with a muted link: `See peer policies on {workload name} →` that navigates to the workload detail page's security band.

**Field bindings:**
- **Counts (collapsed rows):** `Policy.usage.agents`, `Policy.usage.functions`, `Policy.usage.models`, `Policy.usage.jobs`, `Policy.usage.sandboxes` — integers on the Policy resource itself (`PolicyUsageCounts`). These are the numbers rendered in the count column.
- **Names (expanded rows):** `GET /policies/{name}/usages` → `PolicyUsages.agents[]`, `PolicyUsages.functions[]`, `PolicyUsages.models[]`, `PolicyUsages.jobs[]`, `PolicyUsages.sandboxes[]` — arrays of objects. These are fetched on expand, not on page load.
- **Peer-policy adjacency:** each workload's `spec.policies[]` (join — see Footnote G).

---

---

## BAND 4 — Provenance band

*Scenario trace: Scenario 2 (Sam audit — created by whom, when?), Scenario 5 (Alex cleanup — when was it last touched, who owns it?), Scenario 6 (Sam CLI verify — createdAt timestamp confirms this is the just-created policy).*

*Audit questions answered: Q5 — "Is anything still using this policy, when was it last touched, and who owns it?"; Q6 — "Did the policy I just created land...?" (the `createdAt` timestamp confirms recency).*

```
── PROVENANCE ─────────────────────────────────────────────────────────────────

  Created      Jun 20, 2026 · 14:33 UTC    metadata.createdAt
               by kate@cubic.dev           metadata.createdBy

  Last updated Jun 21, 2026 · 09:12 UTC    metadata.updatedAt
               by alex@cubic.dev           metadata.updatedBy

  Workspace    cubic-prod                  metadata.workspace
  Labels       compliance:hipaa  env:prod  metadata.labels[]

───────────────────────────────────────────────────────────────────────────────
```

**Anatomy:**

- **Created** — `metadata.createdAt` (full timestamp, UTC) + `metadata.createdBy` (email or user handle). Two lines, standard layout. For Scenario 6: `createdAt` showing "just now" (relative time with full timestamp on hover) is the verification that this is Sam's newly-created policy.
- **Last updated** — `metadata.updatedAt` + `metadata.updatedBy`. Same layout. For Scenario 5: a `updatedAt` 90+ days ago is the staleness signal.
- **Workspace** — `metadata.workspace`. Confirms scope to this workspace, not leaking across account boundary (Scenario 2 audit requirement from `platform.md` § "Tenancy and access model").
- **Labels** — `metadata.labels[]` rendered as chips. For Scenario 2: Sam confirms the `compliance:hipaa` label is present before signing off on the audit.

**Field bindings:** All from `metadata.*` — `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `workspace`, `labels`.

**Provenance loading state:** Skeleton rows (two-line pairs, same count) while metadata fetches. No spinner.

---

---

## BAND 5 — CLI band

*Scenario trace: Scenario 1 (Alex pastes the bl command to update the policy), Scenario 5 (Alex needs the delete command), Scenario 6 (Sam confirms the bl command that would re-produce this policy). Cross-cutting rule from alex-user-stories.md Phase 0: the `bl` command is required on every primitive detail page.*

*Personality.md interaction principle #9 (CLI parity is visible, not hidden): the `bl` command must be on the surface — not behind a "Show CLI" toggle.*

```
── CLI ────────────────────────────────────────────────────────────────────────

  bl policy get eu-only-prod

  ──────────────────────────────────────────────────────────────────────────

  YAML manifest
  ──────────────────────────────────────────────────────────────────────────
  apiVersion: blaxel.ai/v1alpha1
  kind: Policy
  metadata:
    name: eu-only-prod
    displayName: eu-only-prod
    labels:
      compliance: hipaa
      env: prod
  spec:
    type: location
    resourceTypes:
      - agent
      - model
      - sandbox
    locations:
      - type: continent
        name: North America
      - type: country
        name: US
      - type: country
        name: DE
      - type: country
        name: FR

  [Copy YAML]   [Copy bl policy get]   [Copy bl apply -f …]

───────────────────────────────────────────────────────────────────────────────
```

**Anatomy:**

- **Primary `bl` command** — `bl policy get {metadata.name}` — the read command for this policy. One line, monospace, always visible. This is the command Alex pastes into the incident channel or IaC.
- **YAML manifest** — the full canonical spec for this policy rendered as a read-only code block. Always visible (not collapsed) per personality.md sacrificial choice #5. The YAML reflects the live spec as stored — field-accurate at the current moment, not a static template.
- **For `spec.type = maxToken`:** the manifest renders `spec.maxTokens:` block with all six fields; zero values are rendered as `0` (the YAML is API-faithful — "not evaluated" is a UI interpretation; in the raw spec, 0 IS the value).
- **For `spec.type = flavor`:** the manifest renders `spec.flavors:` block.
- **Three copy actions:**
  - `Copy YAML` — copies the entire manifest block
  - `Copy bl policy get` — copies `bl policy get {name}`
  - `Copy bl apply -f …` — copies a `bl apply -f` invocation with an inline heredoc, suitable for re-applying this policy from a terminal

**Field bindings:** All fields from the Policy API schema — `metadata.name`, `metadata.displayName`, `metadata.labels[]`, `spec.type`, `spec.resourceTypes[]`, and the type-specific spec block (`spec.locations[]` / `spec.flavors[]` / `spec.maxTokens`).

---

---

## Schema-uncertain items — resolution summary

*Each item was flagged in scenarios.md as deferred to wireframe phase. This wireframe resolves them:*

### ¹ Evaluation / resolution-path log (denial log)

**Wireframe phase resolution:** The Policy API (`/api-reference/policies`) does not expose any evaluation log, denial log, or audit events endpoint. WebFetch confirmed no such endpoint is documented. The `alex-workflow.md` Phase 6 demand for "the resolution path — which rule fired, on which deploy, why it denied or allowed" is real but the data source does not exist under the Policy surface.

**Design decision:** The denial log band is **not designed** in this wireframe — designing it would repeat the Custom Domains failure mode (inventing a data shape that doesn't exist). The CLI band's `bl policy get` command is the closest available surface for re-checking policy spec.

**Footnote H — screens phase action:** Screens phase must investigate (a) whether `/api-reference/audit-events` or a separate observability endpoint surfaces policy-evaluation events, (b) whether the workload's own event timeline (e.g. Sandbox event log, Agent log) carries policy-denial entries that can be linked from this page. If found: add a 6th band "Evaluation log" between Band 3 (Usage) and Band 4 (Provenance) with a log-line table showing `timestamp / workload / outcome (allowed|denied) / clause-that-fired`. If not found: the detail page links to the workload's detail page ("See workload events for {name} →") as the fallback drill path. **This band is deferred to screens phase; do not design it here.**

### ² Live token consumption against cap

**Wireframe phase resolution:** The Policy API does not expose a live consumption counter. The `spec.maxTokens` block declares caps only. WebFetch confirmed: no metering field exists under the Policy API.

**Design decision:** The maxToken clause band (Band 2C) shows declared caps only. A muted one-line note reads: `Live consumption data — see workload metrics for attached Agents and Model APIs.` This is honest about what the Policy page can and cannot show without inventing a field.

**Footnote F — screens phase action:** If a metering/observability API is found that exposes per-policy consumption, add a "Current window" row to Band 2C above the threshold table: `Current window: {used tokens} / {cap tokens} ({pct}%)`. Until confirmed: the note stands.

### ³ Peer-policy adjacency (workload `spec.policies` join)

**Wireframe phase resolution:** The adjacency data requires reading each workload's `spec.policies` field — a join not performed by the Policy API directly. The wireframe designs the adjacency as default-visible content in Band 3 with a defined fallback if the join is too expensive.

**Design decision:** See Footnote G in Band 3. The wireframe shows the adjacency inline; screens phase confirms the join strategy (denormalize / client-side / deferred).

---

---

## Full-page assembly — default state (spec.type = location)

Read-through of all five bands for a populated location policy. This is the view Scenario 2 (Sam audit) sees on first paint — all audit questions answerable without scrolling past Band 3.

```
Policies / eu-only-prod

eu-only-prod                                               [Edit]  [⋯]
pol-7a3f

Type: location         Targets: Agents · Model APIs · Sandboxes

── CLAUSE ─────────────────────────────────────────────────────────────────────

  Type: location
  Workloads attached to this policy are deployed only in these locations.
  Requests routed to any other data center are denied.

  Allowed locations                        spec.locations[]
  [Continent: North America]  [Country: United States]
  [Country: Germany]  [Country: France]

  Mixed granularity: continent-level and country-level entries combine
  as a UNION (OR) — the workload can run in any matching data center.

── USAGE ──────────────────────────────────────────────────────────────────────

  Agents          3   ▼
    cubic-prod-agent            → [token-cap-gpt4]  [eu-only-prod ← this]
    webflow-content-agent       → [token-cap-gpt4]
    staging-v2-agent            → (only this policy)
  Model APIs      0
  MCP Servers     0
  Jobs            0
  Sandboxes       1   ▼
    sbx-9c1e

── PROVENANCE ─────────────────────────────────────────────────────────────────

  Created      Jun 20, 2026 · 14:33 UTC  by kate@cubic.dev
  Last updated Jun 21, 2026 · 09:12 UTC  by alex@cubic.dev
  Workspace    cubic-prod
  Labels       [compliance:hipaa]  [env:prod]

── CLI ────────────────────────────────────────────────────────────────────────

  bl policy get eu-only-prod

  apiVersion: blaxel.ai/v1alpha1
  kind: Policy
  metadata:
    name: eu-only-prod
    displayName: eu-only-prod
    labels: {compliance: hipaa, env: prod}
  spec:
    type: location
    resourceTypes: [agent, model, sandbox]
    locations:
      - {type: continent, name: North America}
      - {type: country, name: US}
      - {type: country, name: DE}
      - {type: country, name: FR}

  [Copy YAML]  [Copy bl policy get]  [Copy bl apply -f …]
```

---

---

## Full-page assembly — spec.type = maxToken

Read-through for Scenario 3 (Alex investigates Model API throttle). All audit question Q3 fields visible without scrolling past Band 2C.

```
Policies / token-cap-gpt4

token-cap-gpt4                                             [Edit]  [⋯]
pol-2c1e

Type: maxToken         Targets: Model APIs · Agents · MCP Servers

── CLAUSE ─────────────────────────────────────────────────────────────────────

  Type: maxToken
  Token consumption for attached workloads is capped per window.
  Requests exceeding the cap receive 429. All subsequent requests
  within the window are dropped.

  Window
  1 month                                  granularity: month / step: 1

  Token limits
  Input tokens per window       1,000,000  spec.maxTokens.input
  Output tokens per window      not evaluated  spec.maxTokens.output = 0
  Total tokens per window       2,000,000  spec.maxTokens.total
  Input/output ratio cap        not evaluated  spec.maxTokens.ratioInputOverOutput = 0

  Live consumption data — see workload metrics for attached Model APIs.  ← muted

── USAGE ──────────────────────────────────────────────────────────────────────

  Agents          2   ▼
    cubic-prod-agent
    staging-v2-agent
  Model APIs      1   ▼
    prod-openai-chat
  MCP Servers     0
  Jobs            0
  Sandboxes       0

── PROVENANCE ─────────────────────────────────────────────────────────────────

  Created      Jun 18, 2026 · 11:00 UTC  by alex@cubic.dev
  Last updated Jun 18, 2026 · 11:00 UTC  by alex@cubic.dev
  Workspace    cubic-prod
  Labels       (none)

── CLI ────────────────────────────────────────────────────────────────────────

  bl policy get token-cap-gpt4

  apiVersion: blaxel.ai/v1alpha1
  kind: Policy
  metadata:
    name: token-cap-gpt4
    displayName: token-cap-gpt4
  spec:
    type: maxToken
    resourceTypes: [model, agent, function]
    maxTokens:
      granularity: month
      step: 1
      input: 1000000
      output: 0
      total: 2000000
      ratioInputOverOutput: 0

  [Copy YAML]  [Copy bl policy get]  [Copy bl apply -f …]
```

---

---

## Full-page assembly — spec.type = flavor

Read-through for a flavor policy (Scenario 1 — which clause blocked the deploy?). The `⚠ coming soon` note from Footnote B/D is visible in the clause band only; the rest of the page is identical in structure.

```
Policies / gpu-flavor-staging

gpu-flavor-staging                                         [Edit]  [⋯]
pol-9b4d

Type: flavor           Targets: Agents

── CLAUSE ─────────────────────────────────────────────────────────────────────

  Type: flavor
  Workloads attached to this policy are deployed only on these hardware
  configurations. Requests scheduled on any other hardware type are denied.

  Allowed flavors                          spec.flavors[]
  [CPU: t4]  [CPU: x86-standard]

  ⚠ Flavor policies are not yet available in the production dashboard.
    You can manage this policy via bl apply -f policy.yaml or the REST API.

── USAGE ──────────────────────────────────────────────────────────────────────

  Agents          2   ▼
    staging-agent-v1
    staging-agent-v2
  Model APIs      0
  MCP Servers     0
  Jobs            0
  Sandboxes       0

── PROVENANCE ─────────────────────────────────────────────────────────────────

  Created      Jun 15, 2026 · 08:45 UTC  by sam@webflow.com
  Last updated Jun 15, 2026 · 08:45 UTC  by sam@webflow.com
  Workspace    staging-workspace
  Labels       [env:staging]

── CLI ────────────────────────────────────────────────────────────────────────

  bl policy get gpu-flavor-staging

  apiVersion: blaxel.ai/v1alpha1
  kind: Policy
  metadata:
    name: gpu-flavor-staging
    displayName: gpu-flavor-staging
    labels: {env: staging}
  spec:
    type: flavor
    resourceTypes: [agent]
    flavors:
      - {name: t4, type: cpu}
      - {name: x86-standard, type: cpu}

  [Copy YAML]  [Copy bl policy get]  [Copy bl apply -f …]
```

---

---

## Additional page states

### Loading state

```
Policies / ...

████████████████                                          [Edit]  [⋯]
████████████

Type: ████████      Targets: ████████████████

── CLAUSE ──────────────────────────────────────────────────────────────────────
  ████████████████████████████████████████████████████████████
  ████████████████████████████████████████

── USAGE ───────────────────────────────────────────────────────────────────────
  ██████    ███████████████████
  ██████    ███████████████████
  ██████    ███████████████████
  ██████    ███████████████████
  ██████    ███████████████████

── PROVENANCE ──────────────────────────────────────────────────────────────────
  ████████████████████████████████████████████████████
  ████████████████████████████████████████████████████

── CLI ─────────────────────────────────────────────────────────────────────────
  █████████████████████████████████████
```

Skeleton fills each band at the same density as the populated state. Header skeleton includes the action buttons as skeletons; no mode pill skeleton (pill is absent per Footnote E). No spinner. The `[×]` close / breadcrumb navigation renders immediately (not skeletonized) — the user can leave even while loading.

### Error state

```
Policies / eu-only-prod

  Policy unavailable — could not load pol-7a3f. Retry ↻

  If this policy was recently deleted, it may no longer exist.
  Return to Policies list →
```

The error replaces the entire band content below the breadcrumb. Copy: cause (names the policy's `metadata.name`) + next move (Retry ↻). Secondary move: return to list (handles the "deleted while viewing" case). No band structure is rendered when the policy cannot be loaded — the structure assumes data.

### Not-found state (policy deleted or wrong name)

```
Policies / unknown-policy

  Policy not found.

  No Policy named "unknown-policy" exists in this workspace.
  It may have been deleted, or the URL may be incorrect.

  Return to Policies list →    bl policy list
```

Per `docs/design/guidelines/resource-not-found.md` pattern. Names the resource type (`Policy`) and the identifier from the URL. Does not pretend to know if it was deleted or never existed. Two recovery paths: return to list (GUI) + `bl policy list` (CLI parity).

---

---

## Scenario verification gate

| Audit question | Wireframe answer | Band |
|---|---|---|
| **Q1 — Which clause caused the deny, what is it set to?** | Header `Type:` field names the clause kind on first paint. Clause band (2A/2B/2C) shows the full clause content — `spec.locations[]`, `spec.flavors[]`, or all six `spec.maxTokens` fields. No expand required. | Header + Band 2 |
| **Q2 — What does it restrict, on which kinds, which workloads attach it?** | Header `Targets:` lists `spec.resourceTypes[]`. Usage band lists all five resource kinds with counts and named workloads. | Header + Band 3 |
| **Q3 — Input/output/total caps, granularity, which Model APIs reference it?** | Band 2C renders all six `spec.maxTokens` fields (with "not evaluated" for zero values) + granularity/step window label. Band 3 shows `usage.models` count + named Model API list expanded. | Band 2C + Band 3 |
| **Q4 — What does this policy add vs peer policies on shared workloads?** | Band 3 shows peer-policy adjacency per workload name (via `spec.policies[]` join — Footnote G). Header `Type:` names this policy's slice of the AND/OR algebra. | Header + Band 3 |
| **Q5 — Anything still using it, when was it last touched, who owns it?** | Band 3 zero-usage state shows `0` across all five kinds with green-light-to-delete copy. Band 4 shows `updatedAt` + `updatedBy` + `createdAt` + `createdBy`. | Band 3 + Band 4 |
| **Q6 — Did the policy land with the right type, clause values, target resource types?** | Header `Type:` + `Targets:` on first paint. Band 2 shows full clause (no collapsed view). Band 4 `createdAt` shows "just now" timestamp for Scenario 6 recency check. | Header + Band 2 + Band 4 |

---

## Verification gate self-check

1. **All scenarios trace to at least one band** — Scenarios 1–6 each map to specific bands in the scenario verification gate table above. PASS.
2. **Every band element binds to a real API field** — all field names cited inline in each band's anatomy section. Schema-uncertain items footnoted (F, G, H) with fallback designs and "screens phase resolves" stamps. Mode pill (formerly Footnote E) dropped entirely — no `mode`/`status` field in the API, pill is absent from the header. PASS.
3. **All three `spec.type` values designed** — Band 2A (location), Band 2B (flavor, with coming-soon footnote), Band 2C (maxToken). Three full-page assemblies provided. PASS.
4. **Failure outranks success** — zero-usage rows muted; active-usage rows default weight; `not evaluated` maxToken fields muted vs active caps in default foreground. Visual hierarchy specified; token assignments deferred to design-token phase. PASS.
5. **CLI parity visible** — `bl policy get {name}` + YAML manifest in Band 5, always visible, not behind a toggle. PASS.
6. **Header contract from scenarios.md satisfied** — `metadata.displayName` + `metadata.name` + `spec.type` + `spec.resourceTypes[]` all in the header, visible on first paint. Mode pill absent (API field does not exist — Footnote E). PASS.
7. **Default-content contract from scenarios.md satisfied** — clause band (full fidelity, no collapsed view), usage counts by type (Band 3), `bl` command (Band 5), provenance (Band 4) — all default-visible. PASS.
8. **Combination semantics addressed** — location clause Band 2A notes UNION within type inline. Adjacency in Band 3 shows peer policies so Sam can read INTERSECTION across types. PASS.
9. **Schema-uncertain items footnoted with fallback + screens phase stamp** — Footnotes E, F, G, H each define a fallback design and name the screens phase as the resolver. PASS.
10. **Vocabulary** — `Policy`, `Agent`, `Model API`, `MCP Server`, `Sandbox`, `Job`, `Workspace`, `bl` — all canonical per `platform.md`. No synonyms. PASS.

---

## Decisions for operator review

1. **Policy mode state pill — resolved.** The pill is dropped. The Policy API (`https://docs.blaxel.ai/api-reference/policies`) has no `mode` or `status` field. The header renders two identity lines only (`metadata.displayName` + `metadata.name`) with `[Edit]` and `[⋯]` actions. If a mode field appears in a future API version, add the pill at screens phase — no wireframe revision required. (Domain review FAIL #3 resolved.)

2. **Flavor type — screens phase decision (Footnote B/D).** The wireframe includes flavor with a `[coming soon]` label in the create flow and a `⚠` note in the clause band. Operator to confirm at screens phase: (a) expose flavor fully, (b) expose with coming-soon label as designed, (c) hide from dashboard and route to CLI only.

3. **Peer-policy adjacency join strategy (Footnote G).** The adjacency sub-row in Band 3 requires reading each workload's `spec.policies[]`. Operator + engineering to confirm at screens phase whether this is (a) denormalized by the API, (b) done client-side, or (c) replaced by the fallback link ("See peer policies on {name} →").

4. **Denial log / evaluation log (Footnote H).** Screens phase must confirm whether any audit/observability endpoint surfaces policy-evaluation events. If found: Band 6 design spec is needed. If not: the fallback link to the workload's event timeline stands.

5. **Live token consumption (Footnote F).** Screens phase confirms whether a metering API surfaces per-policy consumption. If found: Band 2C gains a "Current window" row. If not: the muted note ("See workload metrics…") stands.
