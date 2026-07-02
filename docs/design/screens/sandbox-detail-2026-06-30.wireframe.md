# Sandbox detail — Wireframes (2026-06-30)

Routes covered:
- `/{workspace}/sandboxes/[name]` — Sandbox detail (Overview)
- Tab peers: Settings · Schedules · Logs · Terminal (see §3 — tab-strip rationale)

Shell: main dashboard shell. Sidebar group **Sandboxes**, item **Sandboxes** selected. Breadcrumb / back-link to `/{workspace}/sandboxes`.

Upstream:
- Current dashboard capture (Overview): `.intermediate/discovery/current-dashboard/sandbox-detail-overview-2026-06-30.png`
- Earlier capture: `.intermediate/discovery/current-dashboard/sandbox-detail-overview.png`
- Settings · Schedules · Logs · Terminal tab captures reviewed inline (2026-06-30).

Cross-links:
- List wireframe: [`sandboxes-2026-06-30.wireframe.md`](./sandboxes-2026-06-30.wireframe.md) — entry point.
- Flow model: [`../../product/sandbox-flow.md`](../../product/sandbox-flow.md) — provenance, single-scroll forensics, security-band rule.
- Phase model: [`../../product/alex-workflow.md`](../../product/alex-workflow.md) Phase 4 (load-bearing UX), Phase 5 (debug forensics).
- Detail-page heading rhythm: [`../foundations/header-rhythm.md`](../foundations/header-rhythm.md), [`../foundations/spacing.md`](../foundations/spacing.md) § "Detail page header rhythm".

---

## Design rationale — operational dashboard → tier-disciplined forensic surface

**Blaxel-side question first.** Alex lands on this page in one of two shapes, per [`sandbox-flow.md`](../../product/sandbox-flow.md) Diagram B:

1. **Aggregate drill-down.** She filtered the list to a failing subset and clicked into a representative Sandbox. The page must answer "what is the root cause of *this specific failure*" in one scroll, no tab hops.
2. **Direct URL.** A teammate pasted a Sandbox ID in the incident channel; she pasted it back into the URL bar. The page must be URL-addressable, render the forensic surface immediately, and surface the next-30-seconds action (`bl connect sandbox <name>`) prominently.

Both shapes are debug-flavored. Healthy-sandbox curiosity is a long tail and does not drive IA. This page is ~95% debug.

**Audit gap.** Current production (screenshots above) is an **operational dashboard** — name + RAM + CPU + call counts + six time-series charts. It is missing the forensic primitives Phase 5 requires:

| Missing primitive | Why it matters | Phase 5 source |
|---|---|---|
| **Provenance** (Agent / Job / CLI / Dashboard that spawned this Sandbox) | First question in any incident: "what created these failing instances" | [`sandbox-flow.md`](../../product/sandbox-flow.md) |
| **Image SHA** (production shows `blaxel/nextjs:latest` without SHA) | "Did this come from the broken Image build?" — SHA is the leverage point | [`alex-workflow.md`](../../product/alex-workflow.md) Phase 1 |
| **Audit context** (Created by / Updated by with timestamps) | Forensic value: "who deployed this." Production buries this in Settings | [`personas.md`](../../product/personas.md) Phase 5 |
| **Policy + API key band** | Sacrificial choice #3: security as a peer on the same scroll | [`personality.md`](../../product/personality.md) |
| **Volume / Agent Drive attachments** in Overview | Storage state at the substrate boundary. Production hides in Settings | [`sandbox-flow.md`](../../product/sandbox-flow.md) Diagram A |
| **Events timeline** (state transitions, requests, errors, boot/terminate) | Production has six amplitude charts but zero event signal | Phase 5 |
| **Process / exec history** as a peer band | Single-scroll rule | Sacrificial choice #3 |
| **`bl connect sandbox <name>` first-class affordance** | Phase 4 canonical operating pattern; production buries behind "How to use?" link | Phase 4 |
| **TTL urgency states + inline Extend action** | At 22h informational; at 2m an action signal. Production shows bare countdown with no Extend | Phase 5 |

**Why no time-series charts.** Sandboxes are ephemeral — minutes to hours, scaling to zero between requests. Amplitude charts (RAM / CPU / calls over time) answer "what's the trend," a question that only carries signal for long-running infra. For one ephemeral Sandbox, Alex's questions are *did it hit the limit* (peak vs limit), *what just broke* (events + logs), *is it serving traffic right now* (last-request relative). Production's six charts are replaced by: counters with peak-vs-limit annotations (§1.4) + events timeline (§1.6). Trend across many Sandboxes lives at the fleet/workspace level, not per-Sandbox.

**Why Schedules and Logs stay as tabs.** Schedules is a Sandbox-internal command scheduler (production copy: *"Schedules run a command **inside this sandbox** automatically, on a recurring cron, at a specific date, or after a delay"*) — not parent-Agent cron. Logs is a deep forensic surface with three real sources (Access · Process · Audit), severity filter, time range, search, streaming, log-volume sparkline. Production ships these because exporting from ephemeral Sandboxes to external aggregators (Datadog / Loki) is harder than owning logs in-Blaxel. Both tabs survive.

**Decision.** Restructure Overview into a **tier-disciplined forensic surface**:

- **Tier 1 — above the fold (~10 second triage):** identity + lifecycle (§1.1) → provenance (§1.2) → connect-now command (§1.3) → vitals counters (§1.4). Answers: *is it alive · who spawned it · when does it die · what do I run · did it hit a wall.*
- **Tier 2 — one scroll OR one tab click:** full connection methods (§1.5) → events timeline (§1.6) → process + log tail (§1.7) → storage (§1.8) → security (§1.9). Deeper modes via tabs: Settings, Schedules, Logs, Terminal.

Container: **page** (`/{workspace}/sandboxes/[name]`). Single scroll, no detail-side panel — Phase 5 needs the full viewport.

---

## 1. Sandbox detail — `/{workspace}/sandboxes/[name]` (Overview)

### Tier 1 — at-a-glance (above the fold)

Sections §1.1 → §1.4. Every item earns its slot by answering a triage question Alex has in the first 10 seconds. Adding anything else dilutes.

### 1.1 Page header — identity + lifecycle

Follows the detail-page heading rhythm in [`../foundations/header-rhythm.md`](../foundations/header-rhythm.md) and [`../foundations/spacing.md`](../foundations/spacing.md) § "Detail page header rhythm": outer `<header className="flex flex-col gap-3 pt-2 pb-6">` carries breadcrumb → title-column gap (`gap-3`, 12px); title column uses `.page-header` (`gap-1`, 4px) — a title row (`h1` + state pill, page actions pushed right) and a single `.page-header-meta` row (`gap-2`, 8px; `·` separators via `<Separator />`; wraps on narrow viewports).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Sandboxes                                                                 │
│                                                                              │
│  Next.js  ● Active                                                  [···]    │
│  next-js · nextjs:latest@9c1e8a · us-pdx-1 · 4096 MiB RAM ·                  │
│  Created by xu zy 2h ago · Last used 30s ago ·                               │
│  Expires in [ 22h 45m 6s ] [ Extend ]                                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Identity model — three tiers (matches production).**
- **Display name** (h1) — `metadata.displayName`. Human-set, mutable. Example: `Next.js`.
- **Resource slug** (`font-mono` meta-row item with `CopyButton`) — `metadata.name`, kebab-case, immutable. Example: `next-js`. URL-addressable.
- **Deployment ID** (UUID) — surfaced in Settings only, not in the header. Example: `9cdf10e6a9a7515243436aa129277b1b`.

Previous wireframe revisions fabricated an `sbx-…` ID prefix — production does not use one. Drop it everywhere. (The `sbx-…` substring DOES appear inside generated URLs like `sbx-next-js-epzkrc.us-pdx-1.bl.run` — that is a URL scheme suffix, not an identity primitive.)

**Anatomy:**

| Element | Token / notes |
|---|---|
| Outer `<header>` | `flex flex-col gap-3 pt-2 pb-6` per [`../foundations/header-rhythm.md`](../foundations/header-rhythm.md). |
| Back-link | `text-meta text-meta-foreground` chevron + "Sandboxes". Navigates to `/{workspace}/sandboxes` preserving filter state. |
| Title column | `flex min-w-0 flex-col page-header` — owns `gap-1` rhythm between title row and meta row. |
| Title row | `flex items-center justify-between gap-2` — left: `h1` + state pill (`gap-2`); right: page actions. Page-level actions sit top-right of the `<h1>` per [`../guidelines/toolbar.md`](../guidelines/toolbar.md). |
| `h1` — Display name | `metadata.displayName` in `text-display font-semibold text-foreground`. Falls back to `metadata.name` when absent. |
| State pill | Two-axis pill per [`sandboxes-2026-06-30.wireframe.md`](./sandboxes-2026-06-30.wireframe.md) §1.4 — Active / Standby / Deploying / Errored / Terminated / Inactive. Color = domain state only. |
| Overflow `···` | Per-page actions: Restart, Open in CLI (copies `bl connect sandbox <name>`), Delete (with confirm). No `[⚙]` gear — Audit Q3 closed in favor of the tab. |
| Meta row | `page-header-meta` utility (`flex flex-wrap items-center gap-2 text-body text-muted-foreground`); items `·`-separated via `<Separator />`. Single row, wraps on narrow viewports. |
| Resource slug | `metadata.name` (kebab) in `font-mono` inside `page-header-meta-group` (`gap-0`) with `CopyButton`. |
| Image with SHA prefix | `font-mono` (`nextjs:latest@9c1e8a`) inside `page-header-meta-group` with `CopyButton`. Image string links to the Image detail page (cross-link UP). SHA prefix is a wireframe addition vs production (production shows `:latest` without SHA — see audit gap above). |
| Region | Canonical region ID (`us-pdx-1`) — plain meta-row text, no pill, no flag, no "closest" label. |
| Memory | `4096 MiB RAM` — plain meta-row text. |
| Audit | `Created by {user} {time ago}` — links to the user. Single one-liner; full audit (Updated by, Created at absolute, Updated at absolute) lives in Settings → Audit. |
| Last used | Relative (`30s ago`, `2m ago`, `5h ago`) — same source as the list. |
| TTL pill + Extend | `Expires in [{pill}] [Extend]`. Pill content `font-mono text-meta`. `[Extend]` opens a duration popover (canonical steps: `+1h · +24h · +7d · No TTL`) — debug-flow action, NOT buried in Settings. Urgency states — see §1.1.1. |

**Ports** are exposed as named declarations (`sandbox-api: 8080`, `preview: 3000`). They drive §1.5 connection-method routing and are surfaced in §1.5 / Settings → Deployment config — not in the §1.1 meta row, to keep Tier 1 dense without being noisy.

**Removed from current production:**
- Standalone "Display" toggle at top-left of the tab strip — Audit Q1 closed (drop). Shell chrome at most; not page chrome.
- "Time left before termination" verbose label — replaced by inline `Expires in [pill]` meta-row item.
- Multi-row sub-identifier layout (production stacks ID, image, region, memory, timestamps, TTL on separate visual rows). Canon is a single wrapping `.page-header-meta` row.
- Fabricated `sbx-…` ID prefix — production uses the kebab slug (`next-js`) for identity; the URL scheme is separate.
- Trend arrows (`↗11700%`, `↗200%`) — meaningless against a cold-start workspace baseline.

#### 1.1.1 TTL urgency states

The TTL pill renders three visual states based on remaining time:

| Remaining | Token | Behavior |
|---|---|---|
| `> 1h` or no TTL set | `bg-muted-surface text-meta-foreground` | Quiet. Updates without refresh. `—` (em dash) when no TTL. |
| `≤ 1h` and `> 10m` | `bg-state-warning-subtle text-state-warning-text` + `border border-state-warning/40` | Warning color + 1px border. The bg alone is too close to `bg-muted-surface` to read as a state change at thumbnail glance — the border carries the urgency signal as a second channel. |
| `≤ 10m` | `bg-state-errored-subtle text-state-errored-text font-medium` + `border border-state-errored/50` | Failure-grade weight + border. The pill is the alert — no separate banner. |

Never reads "Never" or "Forever". Never blurs "about to be deleted" into "still has time." `[Extend]` action remains visible at all three states — the operator can rescue at any urgency.

### 1.2 Provenance band — spawned by

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Spawned by  ↑ Agent  email-triage  ·  session  ses-c1e7a209  ·  2m ago     │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

| Element | Token / notes |
|---|---|
| Section label | `text-meta text-meta-foreground` — "Spawned by". One line. |
| Parent type | `↑ Agent` / `↑ Batch Job` / `↑ CLI` / `↑ Dashboard`. Arrow signals up-link to a parent primitive. |
| Parent name | Link to the parent's detail page (Agent detail / Job detail). For CLI / Dashboard origin, no link — just the label. |
| Context piece | Session ID (for Agent), task index (for Job), user email (for CLI / Dashboard) — `font-mono text-meta`. Click-to-copy. |
| Relative time | "2m ago" with absolute timestamp on hover. |

**Four provenance shapes:**

| Source | Render |
|---|---|
| Agent | `↑ Agent {name} · session {ses-id} · {time} ago` |
| Batch Job | `↑ Batch Job {name} · task {N of M} · {time} ago` |
| CLI | `↑ CLI · {user-email} · via bl sandbox create · {time} ago` |
| Dashboard | `↑ Dashboard · {user-email} · via /sandboxes/new · {time} ago` |

This band is the highest-impact addition vs. current production. It is the first thing Alex's eye lands on after the identity row in an incident.

### 1.3 Connect-now strip

Tier 1 affordance for the Phase 4 canonical operating pattern. The full connection-methods band (URLs, language samples, MCP / Preview tabs) lives at §1.5 — this is the one-line copy Alex can act on without scrolling.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ⌨ Connect now    $ bl connect sandbox next-js                       [copy]  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

| Element | Token / notes |
|---|---|
| Label | `text-meta text-meta-foreground` — "Connect now" + keyboard glyph. |
| Command | `font-mono bg-surface-secondary` code block. Resource slug interpolated. Copy icon right-aligned. |

Hidden when state is Terminated (nothing to connect to). Visible during Deploying with a quiet "Sandbox deploying — command ready to paste." caption (operator can copy in advance) — see audit Q11.

### 1.4 Vitals strip

Production's per-tile mini-strip-with-limit-line (e.g., `RAM usage max 17%` + sawtooth + dashed limit line) IS the right counter shape — a peak number with limit context, no separate time-series band needed. Match that shape; drop the duplicate big charts and the trend arrows.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Requests           Errors           Peak RAM              Peak CPU          │
│  73                 0                3.2 / 4 GiB           87%               │
│  2xx 73 · 4xx 0     —                ▁▂▁▂▁▂─ ─ ─ ─ ─ ─    ▁▁█▂▁              │
│  5xx 0                               (limit 4 GiB)                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

| Element | Token / notes |
|---|---|
| Four-counter row | Each counter: label `text-meta text-meta-foreground`, value `text-h2 font-mono`. Equal widths on desktop, wrap to two rows on narrow viewports. |
| Requests | Total `73` + status breakdown `2xx 73 · 4xx 0 · 5xx 0`. 4xx / 5xx `text-meta` quiet when zero; `text-state-warning` / `text-state-error font-medium` when non-zero. No time-window caption — counter is lifetime-for-this-Sandbox. |
| Errors | Counter = `status4xx + status5xx` (derived from `requests`, never read from a separate field) — eliminates the contradiction Alex would otherwise see between Requests' 4xx total and a parallel Errors number. Sub-row mirrors the Requests rhythm: `4xx N · 5xx M`. **Flips to `bg-state-error-subtle text-state-error font-medium` when total > 0** — this is the primary failure signal at Tier 1. No time-window caption — same framing as Requests. |
| Peak RAM | `Peak 3.2 / 4 GiB` + a mini-strip (`▁▂▁▂…`) + dashed limit line, matching production's `RAM usage max` shape. The strip is decorative texture (the peak number carries the signal), NOT a separate chart band. `(limit X GiB)` caption only — drop the `(last 1h)` window qualifier, the strip is just texture. |
| Peak CPU | Same shape as Peak RAM, no limit line. No caption. |
| Trend arrows | **Removed.** Production's `↗11700%` / `↗200%` are meaningless against a cold-start workspace baseline. |
| Sparkline duplicate | **Removed.** Production duplicated the calls sparkline with the big chart; both gone. |

**Failure-signal split.** When `Errors > 0`:
1. The Errors counter flips to error-grade weight (primary tile signal).
2. Matching `⚠ Error` rows appear on the §1.6 events timeline (temporal signal).

This pair replaces the prior "overlay errored calls in red on the orange chart" rule — color overlay on a line chart fails for color-blind users and is weaker than a peer-weighted counter. Audit Q9 closed: chart deleted, signal split.

Boot duration (production: not surfaced) appears in §1.6 as the `▶ Deployed · 28s boot` event row, not as a vitals counter — it is a one-time fact, not a current vital.

---

### Tier 2 — investigation (below the fold)

Sections §1.5 → §1.9. Reached by one scroll. Each band carries unique forensic signal: connection details (§1.5), temporal sequence (§1.6), running state (§1.7), storage attachments (§1.8), security context (§1.9).

### 1.5 Connection methods band

Production has three tabs (REST API · MCP server · Preview URL); we add Connect-from-terminal as a fourth. Each tab is **port-bound** — Sandboxes expose named ports declared at create time (`sandbox-api: 8080`, `preview: 3000`); each connection method targets a specific port.

| Tab | Port | Surfaces |
|---|---|---|
| REST API | `sandbox-api` (e.g. `:8080`) | Base URL for direct HTTP into the Sandbox SDK surface. |
| MCP server | `mcp` (when enabled) | MCP endpoint URL for tool-use clients. |
| Preview URL | `preview` (e.g. `:3000`) | Public-facing app URL (Next.js dev server, etc.). |
| Connect from terminal | n/a (CLI / SDK) | `bl connect sandbox <name>` + language code samples. Same affordance as §1.3 with alternatives. |

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ⟨/⟩ REST API    🔌 MCP server    👁 Preview URL    ⌨ Connect from terminal   │
│  ─────────────                                                                │
│                                                                              │
│  https://sbx-next-js-epzkrc.us-pdx-1.bl.run                          [copy]  │
│                                                                              │
│  Base URL for this Sandbox's REST API (port sandbox-api:8080).               │
│  See sandbox API reference.                                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

| Element | Token / notes |
|---|---|
| Tab row | Four peers — REST / MCP / Preview / Connect-from-terminal. Iconified, single line. |
| Active tab underline | `text-foreground` underline; inactive tabs `text-meta-foreground`. |
| URL / command block | `font-mono bg-surface-secondary` code block. Copy icon right-aligned. |
| Caption | `text-meta text-meta-foreground` — one-line context naming the bound port + link to docs. |

#### 1.5.1 Connect-from-terminal tab

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ⟨/⟩ REST API    🔌 MCP server    👁 Preview URL    ⌨ Connect from terminal   │
│                                                       ──────────────────────  │
│                                                                              │
│  $ bl connect sandbox next-js                                        [copy]  │
│                                                                              │
│  Opens an interactive terminal into this Sandbox (like SSH).                 │
│  Or drive from local code:                                                   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ const sbx = await SandboxInstance.get({ name: "next-js" });          │   │
│  │ await sbx.process.exec("ls -la /workspace");                         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  Language: [ TS ▾ ]  TS · Python · Go · cURL                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

Phase 4 canonical pattern is `bl connect` + drive from local. Production buries this behind a "How to use?" link; the redesign promotes it to a peer of the URL-based tabs. Language tabs per [feedback memory on spec reference panels](../../../.claude/projects/-Users-kate-phoenix-projects-baxel-ai/memory/feedback_spec_reference_panel_uses_language_tabs.md) — TS / Python / Go / cURL, no raw YAML.

### 1.6 Events timeline band — primary temporal view

With the time-series band deleted, this is the **only** temporal view on Overview. Promoted accordingly — must handle high-volume Standby ↔ Active transitions without drowning real signal.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Events                                  [ All ▾ ]   [ Last 1h ▾ ]           │
│                                                                              │
│  11:48:12   ⚠ Error                       500 from /invoke — see log line ↗  │
│  11:48:10   ● Standby → Active            request from session ses-c1e7a209  │
│  11:46:55   ◑ Active → Standby            idle for 15s   (× 8 in last 1h)    │
│  11:46:40   ● Standby → Active            request from session ses-c1e7a209  │
│  …                                                                           │
│  10:54:34   ▶ Deployed                    Image nextjs:latest@9c1e8a · 28s   │
│  10:54:06   ↑ Spawned                     by Agent email-triage              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

| Element | Token / notes |
|---|---|
| Band header | "Events" label + type filter (`All / State transitions / Requests / Boot / TTL / Errors`) + time range (`Last 5m / 1h / 6h / 24h / 7d / custom`). |
| Row | `font-mono text-meta` timestamp · type icon · transition label · one-line context. Newest first. |
| Type icons | ● Active · ◑ Standby · ▶ Deployed · ↑ Spawned · ⚠ Error · ✕ Terminated. Color matches state pill; error rows use `text-state-error font-medium`. |
| Error event | NEW peer event type. Renders `⚠ Error` with HTTP status + one-line cause + link to the matching log line. Half of the failure-signal split (the other half is the §1.4 Errors counter flipping red). |
| Standby↔Active grouping | When more than 10 idle transitions occur in the active window, fold into one row: `(× N in last {window})` count summary. Default filter excludes ungrouped transitions unless type filter = All. Q7 closed: grouping at the band, not per-cell. |
| URL-addressable | Each event row has a stable anchor (`#event-{timestamp}`) so Alex can paste a deep link into the incident channel ([`personality.md`](../../product/personality.md) interaction principle #8). |

**Removed:** `Sync events` checkbox — no time-series chart to sync with. Time-range stays.

### 1.7 Process + log tail band

Live snapshot of what's running and what it's saying. The deeper Logs tab (§3) is the forensic search surface; this band is the at-a-glance peek.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Processes                                          [ Tail logs ☑ ]          │
│                                                                              │
│  PID    Command                            CPU    Mem      Started           │
│  ───    ───────────────────────────        ───    ────     ──────────        │
│  1      /bin/init                          0%     12 MiB   10:54:34          │
│  47     node /app/server.js                3%     180 MiB  10:54:38          │
│  152    python /app/agent_worker.py        12%    420 MiB  10:54:41          │
│                                                                              │
│  Log tail (Process)                       ▼ 247 lines     [ Open in Logs ↗ ] │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 11:48:12.034  node:server  POST /invoke 200 142ms                    │   │
│  │ 11:48:11.992  node:server  POST /invoke 200 89ms                     │   │
│  │ 11:48:11.851  py:agent     [INFO] Tool call: search_emails(q="...")  │   │
│  │ 11:48:11.733  py:agent     [INFO] Session resumed from standby       │   │
│  │ ...                                                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

| Element | Token / notes |
|---|---|
| Process table | Compact dense table — PID, Command, CPU, Mem, Started. `font-mono` for PID / Command. Sorted by CPU desc default. |
| Tail logs toggle | When checked, the log tail pane auto-scrolls as lines arrive. Default ON. |
| Log source | Tail defaults to **Process** source (app stdout/stderr) — most signal for "what's it doing right now." Access and Audit live only in the Logs tab; surfacing all three inline would dilute the at-a-glance. |
| Log tail pane | `font-mono text-meta`, dark background. Last ~50 lines. |
| Log line | `{timestamp} {source} {level} {message}` — error / warn lines colored per `text-state-error` / `text-state-warning`. |
| Open in Logs | Link to the Logs tab pre-filtered to source = Process + current time window. |

**Three log sources** (full triage in the Logs tab — see §3):
- **Access** — HTTP request log (`GET /…`, status, latency)
- **Process** — application stdout/stderr (the at-a-glance default)
- **Audit** — workspace audit events (who touched the Sandbox via API)

**Access-log default filter.** Terminal-session reattachment keep-alive traffic (`GET /terminal/ws…` polled every ~2s) floods the Access source unfiltered — production capture shows 36 noise rows of `Reattaching to existing terminal session` in 15 minutes. Default Access source filters out `/terminal/ws*` paths; user can re-enable via a "Show terminal control traffic" chip.

### 1.8 Storage band — Volumes + Agent Drives

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Storage                                                                     │
│                                                                              │
│  Volumes                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ vol-conversations    us-pdx-1    /mnt/state    12.4 GiB   ↑ Volume   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Agent Drives                                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ shared-corpus        us-pdx-1    /mnt/corpus   read-write  ↑ Drive   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

| Element | Token / notes |
|---|---|
| Sub-section per type | Volumes (1:1) and Agent Drives (N:N) are distinct primitives — keep them visually separate per [`platform.md`](../../product/platform.md) disambiguation rule. |
| Row | Name (link to Volume / Drive detail) · Region · Mount path (`font-mono`) · Size (Volume) or Mode (Drive) · `↑ Volume` / `↑ Drive` provenance arrow. |
| Region mismatch | If a Volume's region ≠ this Sandbox's region, the row renders in `bg-state-error-subtle` with copy "Region mismatch — Volumes must be in the same region as the Sandbox." |
| Empty state | "No Volumes / Agent Drives attached." No CTA — attachment happens at create time, not on the detail page. |

### 1.9 Security band — Policy + API key

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Security                                                                    │
│                                                                              │
│  Policy                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ prod-eu-only          ↑ Policy                                       │   │
│  │ Region allowed: eu-fra-1, eu-lon-1 · Flavor: standard-cpu · Tokens   │   │
│  │ allowed up to 1M/hr                                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  API key                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ bl_pk_3f8c…             ↑ API key   ·  3 calls in last 1h             │   │
│  │ Spawned this Sandbox at 10:54:06 (UTC-7)                             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

| Element | Token / notes |
|---|---|
| Section heading | "Security" — `h2`. Peer band, not a tab. |
| Policy sub-card | Policy name + `↑ Policy` link to Policy detail · resolution summary (region / flavor / tokens) inline. If no Policy applied, render "No Policy attached — workspace default applies" in `text-meta text-meta-foreground`. |
| API key sub-card | Truncated key prefix (`bl_pk_3f8c…`) + `↑ API key` link · activity summary ("3 calls in last 1h") · timestamp this key spawned the Sandbox. |
| Policy denial | If a Policy denied a call against this Sandbox in the time window, the sub-card renders in `bg-state-warning-subtle` with the denied call inline + link to the Policy resolution path. |

**Hard rule.** This band is a **peer scroll section**, never a tab. Sacrificial choice #3 from [`personality.md`](../../product/personality.md): single-page ops + security band. Moving this to a tab is a FAIL.

---

## 2. State variants

### 2.1 Active (default — covered above)

All bands populated, vitals live, events tail current, log tail streaming, no error overlays.

### 2.2 Standby

Same scroll layout. Changes:
- State pill: `Standby` (`bg-surface-secondary text-meta-foreground`).
- Vitals: counters live; Peak RAM / Peak CPU mini-strips flat near baseline.
- Process band: processes still visible but quiescent (CPU 0%).
- Events: most recent row is `◑ Active → Standby · idle for 15s`.
- TTL pill: same logic as Active; standby does not pause the TTL countdown ([`platform.md`](../../product/platform.md) lifecycle states).
- "Resume" affordance is implicit — any inbound REST/MCP/Preview call resumes in ~25ms. No "wake up" button.

### 2.3 Errored — Image pull / boot fail

Failure renders inline, not via a separate error page. Header follows the §1.1 rhythm — operational metadata adapts to the failure: `Deploy failed at …` replaces `Last used …`; `0 successful requests` appended.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Sandboxes                                                                 │
│                                                                              │
│  staging-agent  ✕ Errored                                           [···]    │
│  staging-agent · node20@a4f2c8 · eu-lon-1 · 4096 MiB RAM ·                   │
│  Created by alex 5m ago · Deploy failed at 10:54:34 (UTC-7) ·                │
│  0 successful requests · Expires in [ 22h 45m 6s ] [ Extend ]                │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ ⚠ Image pull failed                                                  │   │
│  │                                                                      │   │
│  │ node20@a4f2c8 returned 403 from the registry.                        │   │
│  │ Last successful pull: node20@9c1e8a (3 days ago).                    │   │
│  │                                                                      │   │
│  │ [ Retry ]   [ Pick another Image → ]                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Failure card sits directly under the identity row, above the provenance band — first thing Alex sees.
- Cause first ("Image pull failed"), evidence ("403 from the registry"), context ("last successful pull"), one-verb recovery actions.
- Provenance, connect-now, vitals, connection-methods, events, process-log, storage, security bands still render below — Alex needs them to correlate (which Policy might have denied the pull? which API key tried?).

### 2.4 Deploying (in-progress)

- State pill: `Deploying` (`bg-state-info-subtle text-state-info`).
- Vitals counters: `—` placeholders (no data yet).
- Connect-now strip visible with "Sandbox deploying — command ready to paste." caption (Q11 open).
- Connection methods band still renders URLs with a quiet "not yet reachable" caption.
- Events timeline: live tick stream showing `Image pull → Image cached → Container start → Init complete`. The Deploy event will eventually carry the boot duration (`▶ Deployed · {N}s boot`).
- Process band: `Init not yet visible. Waiting for boot trace…`.

### 2.5 Expiring soon (TTL urgency)

Same as Active layout. Only the TTL pill changes color (per §1.1.1). At `≤ 10m`, no banner — the pill is the alert. `[Extend]` action remains visible at all urgency states.

### 2.6 Terminated

- State pill: `Terminated` (`bg-surface-secondary text-meta-foreground` dimmed).
- Identity band dims to `text-meta-foreground`.
- Vitals: final-snapshot counters (lifetime totals).
- Events timeline: most recent row is `✕ Terminated · expiresIn reached zero` or `✕ Terminated · quota cap reached`.
- Connect-now strip hidden — nothing to connect to.
- Connection methods band hidden — no URLs to render.
- Process + log tail band: "Sandbox terminated at 11:55:08 (UTC-7). Processes no longer running."
- Security band still visible — audit context outlives the Sandbox.
- Storage band still visible — state on attached Volumes / Agent Drives persists ([`platform.md`](../../product/platform.md) lifecycle states).

### 2.7 Loading (page initial fetch)

- Identity band skeleton matches §1.1 rhythm: breadcrumb renders as text immediately (route is known); title row shows an `h1`-sized skeleton block + state-pill skeleton; the `.page-header-meta` row shows 4–6 inline skeleton blocks separated by `·`.
- Provenance, connect-now, vitals, and lower bands render skeleton placeholders matching their layout — band shape stays visible so the page does not jump on load.
- No centered spinner.

### 2.8 API error (page fetch failed)

Fetch failed → no metadata to render. Heading reverts to the index-page shape (per [`../foundations/header-rhythm.md`](../foundations/header-rhythm.md) § Call-site shape): outer `<header>` keeps the breadcrumb-to-title `gap-3`; title column uses the `.page-header` utility — title row (h1 + right-edge `[Retry]`) → description line (`text-body text-muted-foreground`) at `gap-1`. No meta row.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Sandboxes                                                                 │
│                                                                              │
│  Failed to load Sandbox                                            [ Retry ] │
│  The Sandbox `next-js` could not be loaded. Network or API error.            │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Same pattern as the list error state ([`sandboxes-2026-06-30.wireframe.md`](./sandboxes-2026-06-30.wireframe.md) §1.8). Cause first, one-verb recovery, no apology.
- 404 (Sandbox does not exist or was deleted long ago): "Sandbox not found. It may have been deleted." + link back to the list.

---

## 3. Tab strip rationale

Production tab strip: `Overview · Settings · Schedules · Logs · Terminal` + `Display` button. Final verdict:

| Tab | Final | Why |
|---|---|---|
| **Overview** | ✓ | Default; the tier-disciplined forensic surface above. |
| **Settings** | ✓ | Post-deploy mutable config + audit. Reorganize the production data-dump into four sub-sections: **Audit** (Created by / Updated by / Created at / Updated at + avatars) · **Deployment config** (Image, Memory, Ports, Region, Deployment ID UUID with copy) · **Lifecycle** (TTL extension popover, lifecycle policies, date of termination) · **Resources** (Previews, Volumes attached, Policies, Labels). Inline-edit on Display name + Description only; everything else read-only. |
| **Schedules** | ✓ | Sandbox-internal command scheduler. Production copy: *"Schedules run a command **inside this sandbox** automatically, on a recurring cron, at a specific date, or after a delay."* Not parent-Agent cron — Sandbox-level primitive. Empty state must show a canonical CLI example (e.g. `bl sandbox schedule add --cron '0 3 * * *' npm run cleanup`) so the primitive is self-explanatory. Execution history sub-section matches production: schedule · trigger status · when · logs. Audit Q2 closed: stays. |
| **Logs** | ✓ | Deep forensic search surface, not "demoted." Three sources via segmented control: **Access** (HTTP request log) · **Process** (app stdout/stderr) · **Audit** (workspace events). Severity filter (FATAL/ERROR/WARNING/INFO/DEBUG/TRACE/UNKNOWN with colored dots). Time range. Search box. Streaming toggle. Log-volume sparkline strip across the top (one of the few places a small chart earns its slot — it's binned event volume, not amplitude). Local-time toggle. The Overview log tail (§1.7) is the at-a-glance peek; this tab is where Alex grep-and-time-ranges through 10k lines. Exporting to external aggregators is workspace-level; this surface owns in-Blaxel log forensics. |
| **Terminal** | ✓ | Full-viewport in-browser shell. A *mode* — no other bands visible. Peer to `bl connect sandbox <name>` from local terminal. **Pop-out affordance:** `Open in new tab ↗` link top-right (matches production). |
| ~~Display~~ | ✗ | Shell chrome, not page chrome. Audit Q1 closed: drop. If it controls density / dark-mode preview, move to the dashboard topbar. |

**Tier-routing rule.** Each tab has a single forensic role; Overview must not duplicate the deeper-tab job. Specifically:
- Vitals counters (§1.4) carry "current state at a glance" — they do not become charts.
- The §1.7 log tail tails Process only; multi-source filtering is the Logs tab's job.
- The §1.3 Connect-now strip carries the one-line CLI; the §1.5 Connect-from-terminal sub-tab carries the language samples.

---

## 4. State matrix

| State | Header | Provenance | Connect-now | Vitals | Connection methods | Events | Process + log | Storage | Security |
|---|---|---|---|---|---|---|---|---|---|
| Active | populated | populated | visible | live | populated, 4 tabs | live | live | populated | populated |
| Standby | populated, Standby pill | populated | visible | live, flat mini-strips | populated | populated | quiescent | populated | populated |
| Errored | populated + failure card | populated | visible (may be unreachable) | `—` or partial, Errors red | populated, may be unreachable | populated, `⚠ Error` rows | partial | populated | populated |
| Deploying | populated, Deploying pill | populated | visible, "not yet reachable" | `—` placeholders | URLs visible, "not yet reachable" | live boot ticks | "waiting for boot" | populated | populated |
| Expiring soon | populated, TTL pill red | populated | visible | live | populated | live | live | populated | populated |
| Terminated | populated, dimmed | populated | hidden | final-snapshot | hidden | populated, final event | "terminated at …" | populated (state persists) | populated |
| Loading | skeleton | skeleton | skeleton | skeleton | skeleton | skeleton | skeleton | skeleton | skeleton |
| API error | error card | hidden | hidden | hidden | hidden | hidden | hidden | hidden | hidden |

---

## 5. Audit questions

**Closed:**

- **Q1 — Display button.** Drop. Shell chrome at most; not page chrome.
- **Q2 — Schedules tab.** Stays. Sandbox-internal command scheduler (cron / specific-date / delay) — Sandbox-level primitive per production copy.
- **Q3 — Settings gear vs Settings tab.** Drop the gear; the tab is more discoverable.
- **Q4 — Schedules placement.** Moot — Q2 stays it as a peer tab.
- **Q7 — Event row volume.** Folded into §1.6 spec: group Standby ↔ Active when >10 in the active window; show `(× N in window)` summary.
- **Q9 — Failure-overlay color.** Chart deleted. Failure signal split between §1.4 Errors counter (flips red) and §1.6 events timeline (`⚠ Error` row).

**Open:**

- **Q5 — Provenance for hand-spawned Sandboxes.** For CLI / Dashboard origin, the provenance band shows `via bl sandbox create` / `via /sandboxes/new`. Should the original `bl` invocation (with flags) be capturable and replayable, so Alex can re-run the exact command? Or is user email + timestamp + path sufficient?
- **Q6 — Region-mismatch detection.** §1.8 says a Volume in a different region renders in error styling. Does the API contract let the dashboard detect this client-side, or does the platform reject the attach at create time so the case never reaches detail-page render?
- **Q8 — Log tail length.** §1.7 shows "last ~50 lines" inline. Is 50 the right default? Should the height be fixed pixels or grow with viewport? "Open in Logs" is the escape hatch; the inline pane should not become the primary log reader.
- **Q10 — TTL urgency at `≤ 1m`.** §1.1.1 has three urgency thresholds. Should there be a fourth at `≤ 1m` (e.g., pulse animation)? Recommendation: no — at `≤ 1m` the Sandbox is effectively terminating; an animation suggests an action Alex can still take. The error-grade pill at `≤ 10m` is the strongest channel.
- **Q11 — Connect-now visibility during Deploying.** §1.3 keeps the strip visible during Deploying with a "not yet reachable" caption so Alex can copy the command in advance. Confirm with Phase 4 user research, or hide until first reachable signal?
- **Q12 — Logs sparkline strip.** The Logs tab's log-volume sparkline (binned event count over time) is one of the few places a chart earns its slot — it answers "when did traffic spike." Confirm this is binned volume and not amplitude, and that it's not duplicating events-timeline signal.

---

## 6. Sources

- [`../../product/sandbox-flow.md`](../../product/sandbox-flow.md) — provenance, single-scroll forensics, security-band rule, design implications.
- [`../../product/alex-workflow.md`](../../product/alex-workflow.md) — Phase 4 (load-bearing UX, drive from local), Phase 5 (debug forensics, one-click drill, URL-addressable, failure outranks success).
- [`../../product/platform.md`](../../product/platform.md) — Sandbox primitive definition, lifecycle states, connection methods, Volume vs Agent Drive disambiguation.
- [`../../product/personas.md`](../../product/personas.md) — Alex Phase 5 incident shape; wizard-creep + Sam-creep anti-patterns.
- [`../../product/personality.md`](../../product/personality.md) — Sacrificial choice #3 (no Security tab), interaction principles #2 (one-click primitive→trace), #5 (failure outranks success), #8 (URL-addressable).
- [`./sandboxes-2026-06-30.wireframe.md`](./sandboxes-2026-06-30.wireframe.md) — entry-point list; state pill model; column convention.
- [`../foundations/header-rhythm.md`](../foundations/header-rhythm.md), [`../foundations/spacing.md`](../foundations/spacing.md) — detail-page heading rhythm.
- `.intermediate/discovery/current-dashboard/sandbox-detail-overview-2026-06-30.png` — current production capture (Overview baseline). Settings · Schedules · Logs · Terminal captures reviewed inline 2026-06-30.
