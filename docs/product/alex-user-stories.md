# Alex User Stories

Primary persona: AI Platform / Agent Engineer (Alex, 28). Stories are anchored to [`alex-workflow.md`](./alex-workflow.md) phases and [`personas.md`](./personas.md) scope. Blaxel canonical vocabulary used verbatim throughout (see [`platform.md`](./platform.md) § Terminology).

> **Conventions used in this doc:**
> - `**[load-bearing]**` marks the stories that define the product's core wedge for this persona. Cuts and trade-offs preserve load-bearing stories first.
> - Every story cites its source in italics — `(— personas.md: "...")` or `(— alex-workflow.md Phase N: "...")` or `(— personality.md § ...)`. If a story has no source citation, it is not grounded and should be removed or re-derived.
> - Acceptance criteria are observable behaviors, not implementation notes. Each row is something a reviewer can check against a running build.
> - Vocabulary discipline: Sandbox / Volume / Agent Drive / Image / Agent / Batch Job / MCP Server / Model API / Custom domain / API Key / Policy / Region — verbatim. Synonyms = FAIL (see [`platform.md`](./platform.md) § Terminology).

---

## Phase 0 — Cross-cutting

Stories that span every phase: first-paint-is-state posture, CLI/SDK as a peer surface, primitive IDs always pasteable, command palette as primary navigation, free-tier and paid surfaces visible inline.

---

**[load-bearing]** As Alex, I want the first surface I land on after authenticating to be the live state of my Workspace — warm/cold Sandbox counts, Agent health, Batch Job outcomes, enforced Policies, active API Keys — so that I spend zero paints on onboarding chrome before I see what the runtime is doing. *(— personality.md § "Interaction principles" #1: "First paint = current state … Anything but live state = FAIL"; personas.md anti-pattern "Alex wizard creep")*

Acceptance criteria:
- The post-login surface for a returning user shows, without a click: glance counts for Sandboxes (warm / cold / errored), Agent health, recent Batch Job outcomes, the count of enforced Policies, and the count of active API Keys.
- No welcome card, no setup checklist, no "Deploy your first Sandbox" hero appears on the post-login surface for any user — new or returning [Source: personality.md § "Sacrificial choices" #1 — *"State over onboarding"*].
- A user who opened the dashboard within the previous 8 hours lands on their last-viewed primitive detail page (Sandbox / Agent / Batch Job / Policy / API Key), not on a home reset.
- Empty state for a Workspace with zero Sandboxes shows the `bl new sandbox <name>` command, not a `+ Create Sandbox` CTA [Source: personality.md § "Voice & copy" — *"Empty states. Lead with the bl … command. No illustration"*].

---

**[load-bearing]** As Alex, I want every primitive ID (Sandbox, Volume, Agent Drive, Image, Agent, Batch Job, MCP Server, Model API, Policy, API Key) visible and pasteable on every surface — alongside its human label — so that every screenshot, every Slack paste, and every support ticket is unambiguous. *(— personality.md § "Sacrificial choices" #2: "Raw primitive ID over softened label … every value pasteable into the SDK, every screenshot reproducible from the CLI")*

Acceptance criteria:
- Every list row carries both the human label and the canonical ID — `cubic-prod / sbx-7f3a9c1e`, `webhook-policy / pol-4d21`, `prod-key / bl_pk_3f8c…` — in mono.
- Long IDs (Image SHAs, API Key values) render truncated to a stable prefix length (e.g. `bl_pk_3f8c…`) with the full value pasteable from the row via a copy affordance — not displayed at full 64 chars [Source: personality.md § "Anti-personality drift map" — *"Exact → precision theater"*].
- Every primitive detail page header shows the canonical ID at full length with a copy button; clicking copies the raw ID, not a formatted URL.
- A row's primitive ID is selectable + copyable via keyboard alone (Cmd-K → navigate → Cmd-C) — no mouse required [Source: personality.md § "Interaction principles" #10 — *"Command palette is the primary navigation"*].

---

As Alex, I want the `bl …` command that creates or re-creates any primitive visible on that primitive's detail page — not behind a "Show CLI" toggle — so that I can copy the command into IaC or rerun it from the terminal without leaving the dashboard. *(— personality.md § "Interaction principles" #9: "CLI parity is visible, not hidden … Hidden CLI = FAIL"; personas.md § "Alex — In scope": "Alex's composition lives in the SDK and IaC, not in form fields")*

Acceptance criteria:
- Every Sandbox / Volume / Agent Drive / Image / Agent / Batch Job / MCP Server / Model API / Custom domain / API Key / Policy detail page shows the `bl …` command that produced (or could re-produce) it, in a fixed-position panel — visible on first paint, not behind an expander.
- The command is copyable via a single click; pasting it into a terminal produces the same primitive in the same Workspace.
- Empty states across all primitive lists show the equivalent `bl …` command — never a `+ New` button as the primary affordance [Source: personality.md § "Voice & copy" — *"Empty states"*].
- The `bl …` panel includes the SDK equivalent (`SandboxInstance.createIfNotExists({…})` for Sandboxes, the equivalent for other primitives) so Alex can choose CLI or SDK without navigating to docs.

---

As Alex, I want the command palette (`Cmd-K`) to be the primary navigation surface — reachable from every screen, never blocked behind a modal — so that I can navigate primitive-to-primitive without leaving the keyboard. *(— personality.md § "Interaction principles" #10: "Command palette is the primary navigation … Mouse-required step = FAIL"; moodboard § Linear — "Command palette as primary navigation")*

Acceptance criteria:
- `Cmd-K` from any surface (including primitive detail pages, audit log, error states) opens the command palette without dismissing the underlying surface.
- The palette supports navigating to: any Sandbox by name or ID, any Agent / Batch Job / MCP Server / Model API by name or ID, any Policy by name or ID, any API Key by prefix, any Region.
- The palette supports actions: rotate API Key (with confirmation), navigate to Policy denial events, filter the current list by state.
- A power-user path (open Policy `pol-7a3` → jump to its denied events → filter by API Key `bl_pk_3f8c…`) is completable in three palette interactions with zero mouse use.

---

As Alex, I want free-tier Workspace limits and paid-tier features visible inline at the point of use — never hidden behind a surprise paywall modal — so that I can read what the Workspace can and can't do honestly. *(— personality.md § "Sacrificial choices" #8: "Free-tier surfaces visible, paid surfaces inline-gated"; § "Interaction principles" #11)*

Acceptance criteria:
- Workspace tier (Tier 0 / Tier 1 / Enterprise) is shown in the workspace switcher or account menu — not buried in Settings.
- Sandbox lifetime caps (Tier 0: 7 days, Tier 1: 30 days [Source: platform.md § "Platform primitives" — Sandbox row]) appear inline on the Sandbox detail page next to the `expiresIn` countdown.
- Attempting an action that requires a higher tier surfaces the tier requirement inline at the action point (e.g., "Tier 1 required for Sandbox lifetime > 7 days") — never a blocking modal interception.
- The upgrade path link is adjacent to the gated action, not in a separate billing surface.

---

## Phase 1 — Pick or fork the Image

Alex picks a platform Image or forks her own — configures a base Sandbox, snapshots it, and reuses that snapshot across every customer session. Authoring is CLI / SDK; the dashboard is inspection.

---

**[load-bearing]** As Alex, I want the Images list to show every Image in my Workspace with its SHA, region availability, last-spawn timestamp, and the `bl` command that produced it — so that I can diff a working Image against a broken one and copy the canonical ID into IaC without re-deriving it. *(— alex-workflow.md Phase 1: "the Images list shows every Image in the Workspace with its SHA, region availability, last-spawn timestamp, and the `bl` command that produced it")*

Acceptance criteria:
- The Images list renders, per Image: human name, canonical ID, SHA (truncated visibly to first 8 chars with full value pasteable), region availability (which Regions the Image is replicated to), last-spawn timestamp, and Sandbox count currently running from this Image.
- Clicking an Image opens its detail page showing the configuration (base Image, installed deps, exposed ports, environment variables set during build) — not just a metadata block.
- The detail page shows the `bl` command sequence that produced the Image (`bl new sandbox …` → configuration steps → `bl deploy`) in a copyable block.
- The Images list supports filter by Region, sort by last-spawn timestamp, and search by SHA prefix — all keyboard-accessible.

---

As Alex, I want no "Create Image" wizard, no "Configure your first Image" coaching, and no `+ New Image` button as the dominant empty-state affordance — so that the dashboard never re-authors what `bl deploy` already does in one line. *(— personality.md § "Sacrificial choices" #5: "CLI / SDK is a peer surface, not a fallback. Empty states lead with the `bl …` command, not a `Create` button"; § "Counterexample" — "The wizard re-authoring the SDK")*

Acceptance criteria:
- No multi-step modal form for creating an Image exists in the dashboard.
- The Images list empty state shows: `bl new sandbox <name>` followed by `bl deploy` — formatted as a code block — and a link to docs.blaxel.ai/Sandboxes. No "Create your first Image" CTA.
- A `+ New` affordance, if present, opens a brief command snippet (the `bl` invocation), not a form dialog.

---

## Phase 2 — Provision the runtime (Sandbox + storage)

Alex spawns a Sandbox from the Image, region-pinned, and attaches a Volume or mounts an Agent Drive — picking the storage primitive that matches the workload's persistence shape.

---

**[load-bearing]** As Alex, I want the Sandboxes list to show, per Sandbox, the live state (`active` / `standby` / `deploying` / `deleted`), region, Image SHA, attached Volumes + Agent Drives, last-used timestamp, and `expiresIn` countdown when a TTL is set — so that I can confirm the runtime matches the spec without clicking into each Sandbox. *(— alex-workflow.md Phase 2: "the Sandboxes list shows, per Sandbox: name + canonical ID, state … region, Image SHA, attached Volumes + Agent Drives, last-used timestamp, and the `expiresIn` countdown")*

Acceptance criteria:
- Each Sandbox row shows: `human-name / sbx-xxxx`, state with hue encoding [Source: personality.md § "States the surface must express"], Region (`us-pdx-1`, `us-was-1`, `eu-lon-1`, `eu-fra-1`, or `auto`), Image SHA prefix, attached Volume + Agent Drive names, last-used relative timestamp, `expiresIn` countdown if set.
- Standby is visually distinct from deleted — distinct color, distinct iconography; never collapsed to a shared "inactive" treatment [Source: platform.md § "Disambiguation rules" — *"Sandbox standby vs deleted"*; personality.md § "Counterexample"].
- The `expiresIn` countdown updates without a refresh; when no TTL is set, the column reads — (em dash), not "Never" or "Forever" [Source: platform.md § "Sandbox lifecycle states" — *"No default TTL"*].
- Filtering by state (active / standby / deploying / deleted / errored) is a one-click filter chip, not a multi-step filter panel.
- Hue assignments for state are TBD in design-token phase — the encoding rule (color = domain state, nothing else) is set [Source: personality.md § "Interaction principles" #4].

---

As Alex, I want Volume and Agent Drive sub-lists inside the Sandboxes group of the IA — peer to Sandboxes, not nested behind a parent label — so that the relationship between a Sandbox and its storage is one nav click away. *(— alex-workflow.md Phase 2: "Volume + Agent Drive sub-lists sit inside the Sandboxes group, peer to Sandboxes, so the relationship is one nav click away")*

Acceptance criteria:
- The sidebar shows, under the Sandboxes group: Sandboxes, Volumes, Agent Drive, Images — flat, peer items, in that order.
- The Volume list shows Region, attached Sandbox(es), size, and last-write timestamp; the Agent Drive list shows the same plus concurrent mount count.
- From a Sandbox detail page, clicking an attached Volume opens the Volume detail page; clicking the mounted Agent Drive opens the Agent Drive detail page — one click, no intermediate view.
- Volumes and Agent Drives are never collapsed under a single "Storage" item or a Settings submenu [Source: personality.md § "Sacrificial choices" #4 — *"Three IA groups stay flat and equal"*].

---

As Alex, I want the Sandbox detail page to distinguish standby (steady state, no memory charge, near-instant resume) from deleted (terminal, removed via `expiresIn` or quota cap) in copy and color — so that I never wonder whether my Sandbox is asleep or gone. *(— platform.md § "Disambiguation rules": "Sandbox standby vs deleted. Standby is a steady state (idle, no charge, resumes). Deleted is terminal"; personality.md § "Counterexample" — "UI must not blur 'your Sandbox is asleep' into 'your Sandbox is gone'")*

Acceptance criteria:
- A standby Sandbox detail page reads "Standby — resumes on next call" with a distinct color treatment; the resource-usage chart shows the standby threshold transition (~15s of inactivity) [Source: https://docs.blaxel.ai/Sandboxes/Overview — *"approximately 15 seconds"*].
- A deleted Sandbox detail page reads "Deleted — `expiresIn` reached zero on {timestamp}" or "Deleted — Workspace quota cap reached" — naming the cause; the page does not 404, it shows the historical record.
- Resume latency from standby is surfaced on the Sandbox detail page as a typical-time figure ("Resumes from standby in ~25ms" [Source: https://blaxel.ai — *"25ms Resume from standby"*]).
- The Sandbox state never reads "paused", "sleeping", or "cold" — banned synonyms per [Source: platform.md § "Terminology"].

---

## Phase 3 — Deploy the workload (Agent / Batch Job / MCP Server / Model API)

Alex deploys the workload that runs on top of the Sandbox substrate — Agent for vertical-and-long, Batch Job for horizontal fan-out, MCP Server for tool surfaces (15-minute cap), Model API for inference.

---

**[load-bearing]** As Alex, I want the Hosting group of the IA to surface Agent, Batch Job, MCP Server, and Model API as peer items — each with its workload shape visible on the detail page — so that I can pick the right primitive for a new workload without reading docs. *(— alex-workflow.md Phase 3: "the Hosting group of the IA surfaces all four L2 workloads as peers. Each workload's detail page makes its shape visible")*

Acceptance criteria:
- The sidebar shows, under the Hosting group: Agents, Jobs, MCP Servers, Model APIs, Network, Custom Domains — per the operator-supplied IA [Source: CLAUDE.md § "Top-level dashboard IA"].
- Agent detail page surfaces: session count, per-session lifetime, attached Sandbox + Volume + Agent Drive, Model API binding, current state (deployed / deploying / healthy / degraded / errored / stopped) [Source: personality.md § "States the surface must express"].
- Batch Job detail page surfaces: fan-out width (number of Sandboxes spawned), Sandbox count per Job, per-Sandbox state (queued / running / succeeded / failed / errored / canceled), aggregate outcome counts.
- MCP Server detail page surfaces: invocation count, mean / p99 invocation duration, the 15-minute hard cap as a visible constraint (a hue-encoded line on the duration chart, not a small footnote) [Source: platform.md § "Workload shapes" — *"15-minute hard cap"*].
- Model API detail page surfaces: endpoint URL, request count, token throughput, attached Policy (token budget).
- Workload shape descriptions never read as marketing copy — they read as a measured value (e.g., "spawns N Sandboxes per invocation, current width 1,247") [Source: personality.md § "Voice & copy" — *"Never: marketing phrasing in product copy"*].

---

As Alex, I want a deployed Agent / Batch Job / MCP Server / Model API to land in its respective list within seconds of `bl deploy` completing — without requiring a refresh — so that the CLI and the dashboard never disagree about what's running. *(— alex-workflow.md Phase 4: "Status streams, never polls"; personality.md § "Interaction principles" #3)*

Acceptance criteria:
- A new primitive deployed via `bl deploy` appears in its list within 5 seconds of the CLI command completing successfully.
- The list does not require a manual refresh to surface new primitives; the stream attaches without a spinner [Source: personality.md § "Personality adjectives" — *"streams attach without spinners"*].
- A primitive that transitions state (e.g., Agent: deploying → healthy) updates its row hue within 2 seconds of the state change in the runtime.
- A primitive that errors during deploy surfaces the error inline on its row — cause, primitive ID, and a one-line next move [Source: personality.md § "Voice & copy" — *"Error voice. Cause + next move, no apology, no hedge"*].

---

As Alex, I want Batch Job detail to show per-Sandbox outcomes in a grid sorted with failures first — so that when 14 of 1,200 Sandboxes errored, I see the 14 before I see the 1,186 that succeeded. *(— personality.md § "Interaction principles" #5: "Failure outranks success … Symmetric treatment of success and failure = FAIL"; § "Sacrificial choices" #7)*

Acceptance criteria:
- The Batch Job per-Sandbox grid sorts errored / failed Sandboxes to the top by default; succeeded Sandboxes follow.
- Errored Sandbox cells have higher visual weight (larger area, higher contrast, inline error cause + Sandbox ID) than succeeded ones [Source: personality.md § "Interaction principles" #5].
- Clicking an errored Sandbox cell opens the boot trace + last event for that Sandbox in one click — no intermediate modal [Source: personality.md § "Interaction principles" #2].
- The grid supports filter by outcome (succeeded / failed / errored / canceled / queued / running) as one-click chips; the default state shows all outcomes with failed/errored prominent.

---

## Phase 4 — Drive the Sandbox from local + observe runtime

Alex's daily-operating phase. `bl connect sandbox` from the terminal, `SandboxInstance` from the IDE, dashboard for live state. This is the load-bearing UX of the entire product.

---

**[load-bearing]** As Alex, I want the Sandbox detail page to surface operational state, connection methods, and the security band on the same scroll — so that when I'm driving the Sandbox from my IDE, the dashboard never tabs me away from what I need to see. *(— alex-workflow.md Phase 4: "Sandbox detail surfaces three things on the same scroll: (a) the operational state … (b) the connection methods … (c) the security band"; personality.md § "Sacrificial choices" #3: "Single-page ops + security band, never a 'Security view' tab")*

Acceptance criteria:
- The Sandbox detail page shows, top to bottom on a single scroll:
  - **Operational band** — current state, resource series (CPU, memory, network) for the last 5m / 1h / 24h, recent processes, last events.
  - **Connection methods band** — REST API endpoint (copyable URL + cURL example), built-in MCP server endpoint at `<SANDBOX_BASE_URL>/mcp` [Source: platform.md § "Sandbox connection methods"], Preview URLs (one row per active preview, with port + `bl_preview_token` or `X-Blaxel-Preview-Token` header indicated).
  - **Security band** — Policy scope the Sandbox was deployed under (Policy name + ID), API Key prefix that created the Sandbox, last 5 audit events targeting this Sandbox.
- The three bands are on the same URL — no tab strip, no "Security" tab, no separate `/audit` page.
- The audit lines in the security band read as log lines, not compliance copy: cause + decision + primitive ID [Source: personality.md § "Voice & copy" — *"Security tone"*].
- The page never shows a "Loading…" overlay for the security band when the operational band has loaded; both attach independently and stream in [Source: personality.md § "Interaction principles" #3].

---

**[load-bearing]** As Alex, I want every aggregate number on every glance tile (`5 Sandboxes warm`, `12 Policies enforced`, `3 Batch Jobs errored`) to link to the filtered list of those primitives — so that "5 warm" is never decoration, it's always a drillable answer. *(— personality.md § "Interaction principles" #7: "Every aggregate links to its primitives … Number-as-decoration with no drill path = FAIL")*

Acceptance criteria:
- Every numeric value on a glance tile is a link; clicking navigates to the filtered list (e.g., clicking "5 Sandboxes warm" opens the Sandboxes list filtered to `state:standby`).
- The filtered list URL is stable and shareable — pasting it in Slack lands on the same filter [Source: personality.md § "Interaction principles" #8].
- The glance tile value updates in place when the runtime state changes — no refresh required [Source: personality.md § "Interaction principles" #3].
- A glance tile with a value of zero renders as `0` (not hidden, not "—") with the link still active — so Alex can navigate to confirm the empty list, not infer it.

---

As Alex, I want `bl connect sandbox <name>` from my terminal to open an interactive session into the running Sandbox — and the dashboard to show the same Sandbox's live state for the same connection — so that the CLI and the dashboard are peer views of one runtime, not two parallel systems. *(— platform.md § "Surfaces of the Blaxel platform": "bl connect sandbox <name> from a local terminal opens a remote-dev-env channel into the running Sandbox … the developer can then drive sandbox.process.exec() / sandbox.fs.write() / sandbox.previews.create() from local code while the Dashboard shows live state for the same Sandbox")*

Acceptance criteria:
- The Sandbox detail page shows a "Connected sessions" indicator naming each active terminal session and the SDK client (TS / Python) that's currently driving the Sandbox.
- Process activity initiated via `sandbox.process.exec()` from a local script surfaces on the Sandbox detail page's recent-processes list within 2 seconds.
- File writes via `sandbox.fs.write()` surface in the recent-events stream with the file path.
- The Sandbox detail page never blocks live updates when Alex has an active CLI session — the dashboard is read-only relative to the CLI/SDK, not a competing authoring surface.

---

As Alex, I want the warm-pool state across my Workspace surfaced as a first-class glance metric — total warm Sandboxes / total cold / total standby / total errored — so that I can confirm capacity matches demand without opening every Sandbox individually. *(— personality.md § "North star paragraph": "the warm pool is half what it should be"; § "Voice & copy": "5 Sandboxes warm · 3 cold")*

Acceptance criteria:
- The top-level dashboard surface shows a Sandboxes glance tile with the breakdown: `N active · M standby · K deploying · J errored` — distinct values, not aggregated.
- Each value in the breakdown is a link to the Sandboxes list filtered to that state [Source: personality.md § "Interaction principles" #7].
- The breakdown updates in place as Sandboxes transition state — no refresh required.
- A warm-pool capacity series (active Sandboxes over time, last 1h / 24h / 7d) is reachable in one click from the Sandboxes glance tile.

---

## Phase 5 — Debug an incident

Alex opens the dashboard mid-incident. The drill from aggregate to forensic surface must be one click; failures must outrank successes; every event must be URL-addressable.

---

**[load-bearing]** As Alex, I want from any primitive row — Sandbox, Agent, Batch Job, Policy, API Key — its forensic surface (boot trace, log stream, event timeline, resolution path, call history) reachable in exactly one click, with no intermediate modal or "details" view in the way. *(— personality.md § "Interaction principles" #2: "One click, primitive to trace … Two clicks = FAIL"; alex-workflow.md Phase 5)*

Acceptance criteria:
- A Sandbox row click opens the Sandbox detail page showing the boot trace + resource series + recent processes + last events — without an intermediate modal.
- An Agent row click opens the Agent detail page with the log stream visible on first paint.
- A Batch Job row click opens the Job detail page with the per-Sandbox event timeline on first paint.
- A Policy row click opens the Policy detail with the resolution path (which rule fired, on which deploy, why) on first paint.
- An API Key row click opens the Key detail with the call history (what this Key invoked, against which primitive, when) on first paint.
- No row click opens a modal that requires a further "View details" action to reach the forensic surface.

---

As Alex, I want a failed Batch Job, denied API call, expired API Key, or Policy-blocked deploy to have larger pixel area, higher contrast, and more inline context (cause + primitive IDs + a one-line next move) than a successful one — so that during an incident, the leak is visible before the noise. *(— personality.md § "Sacrificial choices" #7: "Failure surfaces are larger than success surfaces"; § "Interaction principles" #5)*

Acceptance criteria:
- On any list or summary with mixed outcomes (Batch Jobs list, audit log, Sandboxes list), failed / errored / denied rows render with measurably higher visual weight than succeeded ones — larger row height, higher color contrast.
- Each failed row shows inline: the cause, the primitive ID of the failing entity, and a one-verb next move (e.g., "Retry", "Rotate key", "Inspect policy").
- The success rows render at baseline weight with no decoration — no checkmarks, no celebration treatment [Source: personality.md § "Counterexample" — *"The celebration deploy"*].
- A summary surface with all-succeeded state never reads as "all systems operational" — it reads as the actual count with the most recent timestamp [Source: personality.md § "Counterexample" — *"The 'all systems operational' hero"*].

---

As Alex, I want every event in every audit log and every primitive timeline to have a stable, shareable URL — so that I can paste a Slack link to "the Policy denial that broke prod at 22:14 UTC" and my teammate lands on the same row. *(— personality.md § "Interaction principles" #8: "Every primitive and every event is URL-addressable")*

Acceptance criteria:
- Right-clicking any audit log line, any event row in a Batch Job timeline, any process in a Sandbox boot trace shows a "Copy link" action.
- The copied URL, when opened in another browser session by an authorized teammate, lands on the same surface with the same event highlighted.
- The URL persists the surrounding context (filter state, time range, expanded panels) — pasting it does not require the teammate to reproduce filters.
- Modal-only or state-held views are FAIL [Source: personality.md § "Interaction principles" #8].

---

As Alex, I want the audit log to render denial copy as a log line — cause, decision, primitive ID, timestamp — not as compliance prose — so that I can paste the line directly into an incident ticket without rewording it. *(— personality.md § "Voice & copy" — Audit line example: "Policy `pol-7a3` denied `sandbox.exec` for API Key `bl_pk_3f8c…` at 22:14:03 UTC. Reason: scope did not include `sandbox.exec`"; § "Security tone")*

Acceptance criteria:
- Audit log lines follow the pattern: `{Policy/Role/API Key ID} {decision} {action} for {caller ID} at {timestamp UTC}. Reason: {cause}` — the order the runtime processed the decision.
- No apology or hedge language ("We're sorry, but…", "It seems like…").
- No compliance-brochure language ("Your account is protected", "We take security seriously").
- A copy-paste of the audit line into a plain-text channel preserves the primitive IDs and the cause; the reader can grep the line for `pol-…` or `bl_pk_…` and find the related surface.

---

## Phase 6 — Govern + gate (Policies, API Keys)

Alex defines Policies (where / how / how-much workloads run) and provisions API Keys. Security is a peer of Sandboxes and Hosting — never collapsed under Settings.

---

**[load-bearing]** As Alex, I want API Keys and Policies as peer sidebar items in the Security group of the IA — never collapsed under Settings, never behind a gear icon — so that the platform's governance surface is first-class, not configuration housekeeping. *(— personality.md § "Sacrificial choices" #4: "Three IA groups stay flat and equal. Sandboxes / Hosting / Security are peer sidebar groups — Security is never collapsed under `Settings`, `Admin`, or a gear icon"; § "Counterexample" — "The Settings-buried security tab")*

Acceptance criteria:
- The sidebar shows three top-level groups — Sandboxes, Hosting, Security — at equal hierarchy. Security renders the same as Sandboxes and Hosting in visual treatment.
- Under Security, the items API Keys and Policies are listed flat — no nesting under "Access Control" or similar parent.
- A user can reach Policies in zero hover-disclosure steps from the dashboard's first paint — the group is visible, the items are visible.
- The label is "Security" — not "Admin", not "Settings", not "Access Control" [Source: platform.md § "Terminology"].

---

As Alex, I want Policy detail to show the resolution path — which rule fired, on which deploy, why it denied or allowed — not a permissions matrix — so that "this Policy denied my Sandbox deploy" is answerable with one click. *(— alex-workflow.md Phase 6: "Policy detail shows the resolution path (which rule fired, on which deploy, why it denied or allowed) — not a permissions matrix")*

Acceptance criteria:
- The Policy detail page shows a recent-evaluations log: each row is one Policy evaluation with `{timestamp} · {Policy rule ID} · {decision: allow/deny} · {target primitive ID} · {reason}`.
- Clicking a deny row opens the affected primitive's detail page (the Sandbox / Agent / Batch Job that was denied) with the denial event highlighted.
- The Policy editor shows the rule definition in code (the Policy specifies *location / flavor / token usage* per [Source: platform.md § "Tenancy and access model"]) — not a multi-step form.
- The detail page never reads as a permissions checklist ("can the user do X? ✓") — Policy is deployment governance, not access control [Source: platform.md § "Disambiguation rules" — *"Policy is not authorization"*].

---

As Alex, I want API Key detail to show the call history (what this Key invoked, against which primitive, when) and a one-click rotate action — so that during an incident I can identify the blast radius of a leaked Key and rotate it without leaving the page. *(— alex-workflow.md Phase 6: "API Key detail shows call history … and a one-click rotate"; personas.md § "Alex — Why": "one sandbox escape kills the company")*

Acceptance criteria:
- The API Key detail page shows the Key prefix (`bl_pk_3f8c…` truncated visibly, full value pasteable on hover/click — but only the prefix shown by default for shoulder-surfing safety).
- The call history shows: timestamp, called primitive ID, action, decision (allowed / denied by Policy), and result — sortable, filterable by primitive type.
- A "Rotate" action is visible on first paint, requires a one-step confirmation, and produces a new Key value within 5 seconds. The old Key remains in the audit history.
- A revoked Key still appears in the API Keys list with state `revoked`; its detail page is reachable so historical calls remain investigable [Source: personality.md § "States the surface must express" — *"API Key: active · expiring · revoked"*].

---

As Alex, I want the Workspace switcher and account menu to surface the Workspace name, the Account name (when multiple Workspaces exist in the Account), and the active Region — so that I never run a destructive command in the wrong Workspace. *(— platform.md § "Tenancy and access model": "Account — highest tenancy level. An Account can hold multiple Workspaces"; personality.md § "Personality adjectives" — Exact)*

Acceptance criteria:
- The Workspace switcher shows the current Workspace name with its canonical ID, and the Account name when the Account has > 1 Workspace.
- The account menu shows the current Role (`admin` / `member`) and the Workspace's Tier (Tier 0 / Tier 1 / Enterprise).
- Switching Workspace preserves the user's current primitive type (e.g., switching from Workspace A's Sandboxes list to Workspace B lands on Workspace B's Sandboxes list, not a home reset).
- Account-level concepts (multiple Workspaces under one Account) are never surfaced as a flat list mixing primitives from both Workspaces — the boundary is preserved [Source: platform.md § "Disambiguation rules"].

---

## Out of Scope (Alex)

Stories that belong to Sam, to no current persona, or to a deliberately-scoped-out part of the platform. Listed here to prevent "while we're at it" additions to Alex's surfaces during design review.

- **Wizards re-authoring the SDK.** Multi-step modal forms for creating a Sandbox, Agent, Batch Job, MCP Server, or Model API. The CLI does this in one line; the dashboard's job is inspection, not authoring. *(— personality.md § "Sacrificial choices" #5; § "Counterexample" — "The wizard re-authoring the SDK"; personas.md § "Alex anti-pattern: wizard creep")*
- **Welcome tours, setup checklists, "Get started" heroes.** First paint is current state. Alex is mid-incident or mid-debug when the dashboard opens; coaching UI burns her attention. *(— personality.md § "Sacrificial choices" #1; personas.md § "Alex — In scope" — "Skips welcome tours and config wizards")*
- **Cute or apology-tone error copy.** "Oops!", "Something went wrong, we're on it", "🛠️". Error copy is cause + next move, no hedge. *(— personality.md § "Voice & copy"; § "Counterexample" — "The cute error")*
- **All-green platform-health hero.** A single "Platform Health: 100%" tile hides the one degraded Agent under a happy aggregate. Per-primitive depth over cross-primitive rollups. *(— personality.md § "Sacrificial choices" #6; § "Counterexample" — "The 'all systems operational' hero")*
- **Sam-grade compliance chrome on Alex's path.** Regulatory badges, audit-export buttons styled as marketing, "We take security seriously" copy on the Security group. Sam's audit surfaces are honest log lines, not compliance brochures — but the compliance chrome belongs nowhere on Alex's path. *(— personas.md § "Alex / Sam anti-pattern: Sam deep-platform-ops creep, mirror image)*
- **Sam-grade guided onboarding for new Policy / API Key authoring.** Step-by-step Policy builders, "Configure your first Policy" walkthroughs. Alex authors Policies in code; the dashboard inspects evaluations and rotates keys. *(— personality.md § "Sacrificial choices" #5; alex-workflow.md Phase 6)*
- **Training / RL / eval surfaces.** Reward curves, training step counters, eval set authoring, reward function editors. Blaxel runs inference and agent code, not training jobs. Out of scope by the product brief. *(— product.md § "Out of scope": "model training / RLHF tooling … Blaxel runs inference + agent code, not training jobs")*
- **End-user-facing UI for the customer's product.** Chat surfaces, app dashboards for the customer's downstream users. Blaxel is the runtime under the customer's agent, not the chat the customer's users see. *(— product.md § "Out of scope"; personality.md § "Out of scope (deliberately)")*
- **Async collaboration UI on primitives.** Comment threads on Sandboxes, presence indicators on Agent detail pages, in-product review queues. Different product surface. *(— personality.md § "Out of scope (deliberately)")*
