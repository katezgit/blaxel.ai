# Product Personality — North Star

Owned by the product-designer. Drives every visual, interaction, and copy decision downstream — design tokens, wireframes, screen specs, component anatomy, copy.

---

## North star paragraph

Alex is 30 minutes into an incident when she opens blaxel.ai. Production p99 spiked at 22:14 UTC; the warm pool is half what it should be, two Sandboxes are pinned past TTL, and an Agent deployed an hour ago is throwing on a tool call. She came to find the leak, not be guided through it — the dashboard owes her the boot trace, the Policy that denied the retry, and the Image SHA on the first paint, and nothing else in the way. Sam opened the dashboard at 9 AM because security flagged an API Key scoped wider than the Policy spec — he needs the Policy resolution path and the audit log line before standup, copy-pasteable into the ticket without rewording. The runtime is *perpetual* (no cold start) and *co-located* (Sandbox + Agent + Model API on one plane) — the dashboard's job is to make those two facts visible as state, every paint, without translation.

---

## Personality adjectives

**Perpetual · Composed · Transparent · Exact · Disciplined · Swift**

Six dimensions, each defending a different axis. Overlap = dead weight.

- **Perpetual** — *temporal axis.* The product wedge is no cold start; the surface honors it. The dashboard never makes the user warm up either — first paint is live state, streams attach without spinners, the runtime's "always on" is the surface's "always current."
- **Composed** — *structural axis.* The model the user sees is primitives, not features. Every screen reads as named primitives from `platform.md` (Sandbox, Volume, Agent Drive, Image, Agent, Job, MCP Server, Model API, API Key, Policy) — visibly adjacent, not nested inside feature menus or workflow modes. The three IA groups (Sandboxes / Hosting / Security) stay flat and legible at every depth.
- **Transparent** — *epistemic axis.* Every layer of the runtime is reachable from the surface that summarizes it. Aggregates link to the primitives they counted; denials cite the rule that denied them. No black-box scoring, no synthetic "platform health" averages, no "trust us." If the value exists in the runtime, the user can drill to it.
- **Exact** — *lexical axis.* The right noun, the right digit, every time. Canonical primitive names verbatim (`Sandbox` not `instance`, `Policy` not `permission`, `Agent Drive` not `working dir`). Values at the user's decision granularity (`p99 = 412ms`, `5 Sandboxes warm · 3 cold`, `python-3.12@sha:9c1e…`). Transparent shows the layer; Exact picks the word and the digit on it.
- **Disciplined** — *tonal axis.* Serious enough that Sam's auditor reads it unedited; honest enough that Alex pastes it into an incident channel without trimming marketing. No playful empty states, no celebration banners, no hedges, no marketing phrasing. Error copy is a cause and a next move; audit lines read like log lines.
- **Swift** — *action-velocity axis.* The path from signal to next verb is short. Every primary action is reachable without scroll; every recovery action surfaces inline in the failure band (one-click retry, one-click open in CLI), not behind a second click. Distinct from Perpetual: Perpetual says the runtime is always present (backend commitment); Swift says the surface is one beat from the next action (UX commitment). Transparent makes every layer *reachable as information*; Swift makes the *next move reachable as an action*.

---

## Personality statement

Blaxel keeps the Sandbox warm, the Agent close, and the audit line honest — so the user acts on signal in the same paint the signal appears.

---

## Primary surface

The load-bearing UX is **runtime state at a glance, drillable in one click**. Two reading altitudes on the same canvas:

- **Glance** — warm/cold Sandbox counts, Agent health, Job outcomes, enforced Policies, active API Keys. Orient in seconds, no click. Where Alex confirms the runtime matches the spec; where Sam confirms scope hasn't drifted.
- **Deep** — per-Sandbox boot trace + resource series; per-Agent log stream; per-Job event timeline; per-Policy resolution path; per-API-Key call history. Where Alex finds the leak; where Sam reads the audit.

Switching altitudes is one click, not a navigation change. The glance view never loses its drill path; the deep view always has a return-to-overview affordance. This is the contract the entire dashboard is held to.

---

## Sacrificial choices

Each one names what we lose in concrete designer terms — a screen, a flow, an affordance — and what we keep instead. The loss must be real.

1. **State over onboarding.** First paint is current state, never a welcome card or setup wizard. *Lose:* the "Quickstart" panel, the empty-state hero illustration, the 4-step "Deploy your first Agent" checklist, the "What is a Sandbox?" tooltip on the sidebar item. *Keep:* the same paint that respects Alex mid-incident — counts, IDs, last event. Setup ships behind explicit `Create Sandbox` / `Deploy Agent` entry points, not as the default surface.

2. **Raw primitive ID over softened label.** Every row and detail header carries both the human label and the canonical ID — `cubic-prod / sbx-7f3a9c1e`, `webhook-policy / pol-4d21`, `prod-key / bl_pk_3f8c…`. *Lose:* one-line table density (each row carries an extra mono token), the cleaner "pretty name only" mockup. *Keep:* every value pasteable into the SDK, every screenshot reproducible from the CLI, every support ticket unambiguous.

3. **Single-page ops + security band, never a "Security view" tab.** Every primitive detail page lays Alex's density at the top (state, resource series, last events) and Sam's context as a peer band on the same scroll (Policy scope it ran under, API Key prefix that initiated it, recent audit lines). *Lose:* the clean "Overview / Logs / Security / Settings" tab strip and a tidier per-tab IA. *Keep:* one URL per primitive that serves both incident and audit without context-switching — and forces designers to keep both densities on the same canvas instead of hiding one under a tab.

4. **Three IA groups stay flat and equal.** Sandboxes / Hosting / Security are peer sidebar groups — Security is never collapsed under `Settings`, `Admin`, or a gear icon. *Lose:* the tidier "runtime stuff up top, config stuff in settings" hierarchy and a shorter primary nav. *Keep:* the signal — to every user, every paint — that Policies and API Keys are platform primitives, not configuration housekeeping. Sam's surface is first-class because Sam's persona is first-class.

5. **CLI / SDK is a peer surface, not a fallback.** Empty states lead with the `bl …` command, not a `Create` button. Every primitive detail page surfaces the SDK call that created (or could re-create) it. *Lose:* the "everything completable in the dashboard" promise, the `+ New` button as the dominant empty-state affordance, the parity of the create form across primitives. *Keep:* honesty about how Alex actually works — IaC and CLI for create, dashboard for inspection — and a one-step path back to terminal from any inspection surface.

6. **Per-primitive depth over cross-primitive rollups.** Detail surfaces drill into one Sandbox, one Agent, one Policy at a time. *Lose:* the "Platform Health" executive overview, the all-green status hero, the unified cost-and-uptime tile a CEO would screenshot. *Keep:* the path that matches how the runtime is composed — primitive-by-primitive — and a model the Alex-grade user trusts because it does not pretend the system has one mood.

7. **Failure surfaces are larger than success surfaces — and the way out is in the band.** A failed Job, a denied API call, an expired Key, a Policy-blocked exec gets more pixel area, more inline context (cause + primitive IDs + retry path), and higher contrast than a successful one. The recovery action (one-click retry, one-click open in CLI) lives inside that same expanded band — not behind a second click. *Lose:* the calm "all-green" aesthetic where success and failure look symmetric; the "click to see options" pattern on failed rows. *Keep:* incident-mode legibility — Alex sees the leak and the way out before she sees anything else. (Swift governs the recovery path; the expanded area is what Failure outranks success already owned.)

8. **Free-tier surfaces visible, paid surfaces inline-gated.** Free affordances stay fully visible and functional on the free tier; cloud / scale features surface their tier requirement at the point of use, not behind a hidden paywall. *Lose:* the cleanest free-tier view (no tier markers visible at all). *Keep:* an honest read of what the workspace can and can't do, with the upgrade path adjacent to the action, never in a surprise modal.

9. **Primary action above the fold, forensic detail one click below.** On every primary list and detail surface, the dominant action for that context (Restart, Redeploy, Revoke, Retry) is visible without scroll. Diagnostic detail (full boot trace, event timeline, audit log) is one click below — present, not hidden, but not competing for the primary viewport. *Lose:* the symmetric layout where the action row and log stream share equal weight on first paint. *Keep:* Alex can restart the Sandbox or redeploy the Agent in the same motion she reads the status — no scroll hunt for the button.

---

## Voice & copy

**Peer, not guide.** Copy talks to someone deep in their own problem. The dashboard does not explain itself, does not congratulate the user, does not hedge.

**Vocabulary is the voice.** Canonical primitive names (full list in [`platform.md`](./platform.md) — `Sandbox`, `Volume`, `Agent Drive`, `Image`, `Agent`, `Job`, `MCP Server`, `Model API`, `Network`, `Custom Domain`, `API Key`, `Policy`) appear verbatim in every label, error, empty state, tooltip, and audit line. Synonyms break trust because the SDK and the dashboard must name the same thing the same way. Bad/good pairings below show how the rule lands in real copy.

| Surface | Bad | Good |
|---|---|---|
| Error toast | "Something went wrong booting your instance — please try again." | "Sandbox boot failed — Image `python-3.12@sha:9c1e…` not present in registry `default`. Push the Image or pick another." |
| Empty state | "Welcome! You don't have any containers yet. Create one to get started." | "No Sandboxes in this workspace. `bl sandbox create --image python-3.12` to spin one up." |
| Audit line | "Permission denied for token tok_3f… on resource exec." | "Policy `pol-7a3` denied `sandbox.exec` for API Key `bl_pk_3f8c…` at 22:14:03 UTC. Reason: scope did not include `sandbox.exec`." |
| List header | "Drives" | "Volumes" (or "Agent Drives" — never collapsed to "Drives") |
| Filter chip | "Active tokens" | "Active API Keys" |
| Confirmation | "Your bot has been deployed!" | "Agent `agt-7f3a` deployed to region `us-east-1` · Custom Domain `agents.cubic.dev` attached." |
| Metric label | "Approximate latency" | "p99 = 412ms (last 5m)" |
| State label | "A few warm" | "5 Sandboxes warm · 3 cold" |
| Cost label | "Low cost" | "$0.0021 / Sandbox-hour" |
| Sidebar item | "Roles & Permissions" | "Policies" (and "API Keys" — the two primitives in `Security`, not aggregated to "Access") |
| Setup CTA | "Get started with sandboxes" | (no CTA — show the `bl sandbox create` command) |
| Error toast (recovery) | "Sandbox boot failed — check your Image." | "Sandbox boot failed — Image `python-3.12@sha:9c1e…` not found. [Retry] [Open in CLI]" (recovery actions as inline affordances, not prose) |

**Error voice.** Cause + next move, no apology, no hedge. Cause names the primitive that failed and the primitive it failed against; next move is one verb the user can act on.

**Empty states.** Lead with the `bl …` command. No illustration. No "Get started" CTA paragraph. The reader is technical; the command is the affordance.

**Provenance.** Every aggregate, every result, every audit line carries its primitive IDs (`sbx-…`, `agt-…`, `job-…`, `pol-…`, `bl_pk_…`) alongside the human label. Every first-class entity has a stable, shareable URL — anchoring is part of the vocabulary.

**Security tone.** Audit + Policy resolution copy reads like a log line, not a compliance brochure. No "We take security seriously," no "your account is protected." The line tells what was attempted, what decided, what the decision was, and why — in the order the runtime processed it.

**Never:** encouragement copy ("Nice work!", "You're crushing it!"), progress celebrations (confetti, "Deploy successful!" hero modals), onboarding coach voice in steady state ("Now, let's set up your first Policy…"), passive hedges ("It seems like…", "We think…"), marketing phrasing in product copy ("Blazing-fast Sandboxes", "Lightning quick").

---

## Interaction principles

Each principle is a hold-up test: a reviewer can put a wireframe against it and call PASS / FAIL without judgment. Soft "good UX" lines don't qualify.

1. **First paint = current state.** *Test:* Open the dashboard cold. Is the first visible surface a live count, list, or event — or is it a welcome card, a "Get started" tile, or a sample-data demo? Anything but live state = FAIL.
2. **One click, primitive to trace.** *Test:* From any primitive row (Sandbox, Agent, Job, API Key, Policy), is its forensic surface (boot trace, log stream, event timeline, call history, resolution path) reachable in exactly one click — no modal stack, no new-tab requirement, no intermediate "details" view? Two clicks = FAIL.
3. **Status streams, never polls.** *Test:* Hover a glance counter (warm pool, Agent health, Job state, Policy enforcement) for 30 seconds with no user interaction. Does the value update on its own when the runtime state changes? Stale value requiring refresh = FAIL.
4. **Color carries state, nothing else.** *Test:* Pick any colored element on the surface. Does the hue encode a domain state (Sandbox warm/cold/booting/errored, Agent healthy/degraded, Job succeeded/failed, Policy enforced/audit/draft, API Key active/expiring/revoked)? Color used for branding, category, or aesthetic emphasis only = FAIL. (Hue assignments → design-token phase; the encoding rule is set here.)
5. **Failure outranks success — and the recovery action is in the band.** *Test:* On any list or summary surface with mixed outcomes, does the failed / denied / errored row have (a) higher visual weight (larger area, higher contrast, inline cause + primitive IDs) than a succeeded one, AND (b) the recovery action (retry, open in CLI, revoke, redeploy) visible inside that expanded band without a second click? Symmetric treatment = FAIL. Recovery action behind a modal or submenu = FAIL.
6. **Security context inline, never tabbed away.** *Test:* On a Sandbox, Agent, or Job detail page, are the Policy scope it ran under and the API Key prefix that initiated it visible on the same scroll as the operational state — or hidden behind a `Security` tab, a separate audit page, or an expandable that defaults collapsed? Tabbed-off security band = FAIL.
7. **Every aggregate links to its primitives.** *Test:* Click any number on any glance tile (`5 Sandboxes warm`, `12 Policies enforced`, `3 Jobs failed`). Does it navigate to the filtered list of those primitives? Number-as-decoration with no drill path = FAIL.
8. **Every primitive and every event is URL-addressable.** *Test:* Right-click any Sandbox row, any Policy denial in the audit log, any event in a Job timeline. Is there a stable "Copy link" that another teammate can paste into Slack and land on the same surface? Modal-only or state-held views = FAIL.
9. **CLI parity is visible, not hidden.** *Test:* On every primitive detail page and every empty state, is the `bl …` command that created (or could re-create) the primitive visible on the surface — not behind a "Show CLI" toggle, not in a docs link? Hidden CLI = FAIL.
10. **Command palette is the primary navigation.** *Test:* Time a power-user path (open Policy `pol-7a3` → jump to its denied events → filter by API Key `bl_pk_3f8c…`). Is every step reachable via `Cmd-K` with no mouse? Mouse-required step = FAIL. (Pointer paths exist; they're the secondary.)
11. **Free surfaces visible, paid surfaces inline-gated.** *Test:* As a free-tier user, navigate to a paid feature. Is the feature visible in the IA with its tier requirement noted at the point of use — or hidden entirely, surfaced only after a modal interception? Surprise paywall = FAIL.
12. **Primary next-action reachable without scroll.** *Test:* On any primary list view or detail surface, is the dominant action for that context (Restart, Redeploy, Revoke, Retry) visible in the initial viewport without scrolling? Button below the fold = FAIL. (Forensic depth — trace, log, timeline — may live below; the *action* may not.)

---

## Anti-personality drift map

Each drift names the *tempting* failure mode — the move a competent designer might honestly make under deadline pressure — not the absurd one. Catch yourself reaching for these.

- **Perpetual → abrupt.** Tempting move: strip every transition, drop every skeleton, hard-cut every paint to "feel faster." Result: a dashboard that flickers instead of feeling live; the user can't tell what changed and re-reads the whole surface to confirm. Perpetual means *the runtime is always present* — state changes are acknowledged (motion contract owned by motion-designer), never ceremonious, never invisible. The opposite of welcome chrome is not the absence of feedback; it is unbroken continuity.
- **Composed → over-grouped.** Tempting move: wrap every primitive in a `<Card>`, nest "Networking" under a collapsed accordion inside `Hosting`, introduce a parent "Compute" group above Sandboxes + Volumes for tidiness. Result: the three flat IA groups become a tree, the primitive vocabulary becomes a categorization scheme, and Alex's one-click drill becomes a three-click hunt. Composed means primitives stay *named and adjacent*, not tucked into containers.
- **Transparent → firehose.** Tempting move: stream every event into a left-rail "Activity" feed on every page, paint every counter changing every tick, surface every internal probe result so "nothing is hidden." Result: signal drowns in noise; the boot trace Alex came for is below a 200-event scroll. Transparent means *every layer is reachable*, not *every layer is ambient*. Raw lives behind drill paths; the glance view stays curated.
- **Exact → precision theater.** Tempting move: render `p99 = 412.387219ms`, show Image SHAs at full 64 chars, display API Key prefixes with 12 chars instead of 8 to "prove we're not hiding." Result: every column wider, every screenshot less scannable, no decision actually improved. Exact means *the right noun, the digit at the user's decision granularity* — `p99 = 412ms`, `python-3.12@sha:9c1e…`, `bl_pk_3f8c…` truncated visibly with the full value pasteable from the row.
- **Disciplined → cold.** Tempting move: strip every empty state to a code block, remove every confirmation message, surface every Policy denial in monospace red with no surrounding context. Result: surfaces feel punitive instead of professional; Sam's auditor wonders if the platform is broken. Disciplined means *the audit line is honest*, not that the dashboard is hostile. Clarity, not severity.
- **Swift → trigger-happy.** Tempting move: remove confirmations on destructive ops to reduce friction, hide diagnostic detail to fit the primary action above the fold, surface only the happy-path button and bury the forensic affordances. Result: Alex mid-incident hits "Restart Sandbox" by accident and loses the running state she came to inspect; Sam can't find the audit detail because the detail panel was collapsed to make room for the action row. Swift means *short path to the next verb*, never *missing path to the context or the confirm*. Forensic surface stays one click away; destructive confirms stay one beat away; the failure band keeps its area.

---

## Moodboard

| System | Steal | Don't steal |
|---|---|---|
| Linear | Command palette as primary navigation (Swift exemplar: every action reachable in ≤2 keystrokes); zero encouragement copy; ambient status color; density without apology | Issue-tracker-as-primary-surface; project-team-cycle vocabulary |
| Vercel | Logs as a readable artifact; streaming output without spinners; precise actionable errors; CLI-first empty states | Deploy-as-the-hero framing (Blaxel runtime is steady-state — Jobs run, but the dashboard is not deploy-centric) |
| Fly.io | Raw infra honesty; primitives in URLs; machine-readable surfaces; CLI parity visible in-product | Sparse-by-default IA (Blaxel needs the three-group structure legible at first paint) |
| Modal | Primitive-first composition; clean technical UI; no marketing copy in-product | Notebook / function-as-unit framing (Blaxel's unit is the Sandbox, not the function) |
| Bloomberg Terminal | Density without apology; color as pure state encoding; no wasted real estate | Terminal-era keyboard cryptics; fixed-layout assumption; opaque acronyms |
| Cursor / Zed | User knows what they're doing; tool is fast and honest, not guiding | Editor-as-canvas metaphor; AI-pair-programmer framing |
| AWS Console | — | Drown-in-options IA; deep nesting; inconsistent affordance vocabulary across services — explicit don't-steal |

---

## Counterexample

The specific patterns we will not ship. Designers should recognize each one in the wild.

- **The "Let's get you set up!" hero.** Full-width welcome card on the steady-state dashboard, illustration of a friendly box, three-step "1. Deploy 2. Connect 3. Run" checklist. Push real state below the fold and burn Alex's first paint.
- **The synonym creep.** Sidebar reads `Containers / Workloads / Access Control`. Empty state says "you have no instances yet." Audit page calls Policies "Roles." Each substitution forces the user to translate between dashboard and SDK; trust erodes per surface.
- **The "all systems operational" hero.** Single green tile, "Platform Health: 100%", microcopy "Everything is running smoothly!" Hides the one degraded Agent under a happy aggregate; the per-primitive drill path doesn't exist.
- **The Settings-buried security tab.** `Policies` and `API Keys` collapsed under a gear icon at the bottom of the sidebar — or worse, behind `Settings → Team → Permissions`. Signals to the user that security is configuration, not platform.
- **The wizard re-authoring the SDK.** A 5-step modal form to create a Sandbox: name field, image dropdown, region picker, "Advanced" expander, "Review" step, "Create" CTA. The CLI does this in one line; the modal exists because the design didn't trust the user to read a command.
- **The cute error.** "Oops! Looks like something went sideways. Don't worry, we're on it! 🛠️" — no cause, no primitive ID, no next move. Sam can't paste it into a ticket; Alex can't act on it.
- **The celebration deploy.** Full-screen confetti, "Agent deployed!" with a checkmark animation, modal blocking the next action. Steals two seconds from a user who needs to verify the rollout, not be congratulated.
- **The illustration empty state.** Pastel SVG of an empty box and a CTA "Create your first Sandbox →". No SDK command, no link to docs, no primitive name in the copy. Pretty, useless.

These are the moves a competent infra dashboard makes by default. Blaxel rejects each one explicitly.

---

## States the surface must express

Every state below requires a distinct visual encoding. The five domain-state rows feed Interaction principle #4 (color = state); the interaction-state row feeds the focus-and-anchor model.

**Domain states (carry color):**
- **Sandbox:** warm · cold · booting · running · errored · terminating
- **Agent:** deployed · deploying · healthy · degraded · errored · stopped
- **Job:** queued · running · succeeded · failed · errored · canceled
- **Policy mode:** enforced · audit-only · draft
- **API Key:** active · expiring · revoked

**Interaction states (carry weight, focus ring, anchor mark):**
- hovered · focused-selected · pinned-anchored

(Exact hue assignments → design-token phase. The states are the rule; the colors are the encoding.)

---

## Out of scope (deliberately)

- **Motion** — durations, easings, reduced-motion — motion-designer's layer.
- **Hue assignments** — which specific color values carry which state — design-token phase.
- **Async collaboration** — roles, comment threads, presence indicators — different product surface.
- **End-user-facing UI for the customer's product** — Blaxel is the runtime under the customer's agent, not the chat / app surface the customer's users see.
- **Marketing chrome in the dashboard** — the dashboard is not blaxel.ai's homepage; landing-page voice does not bleed into product surfaces.
- **Compliance brochure language** — Sam's audit surfaces are honest log lines, not regulatory copy.

---

Derived from: [`platform.md`](./platform.md), [`personas.md`](./personas.md), `product.md`, the customer profile, and the marketing positioning. *Note: `alex-workflow.md` and `alex-user-stories.md` are still in HUD-template state and were not consumed here — they will be re-derived against the new Alex / Sam personas in a follow-up phase.*
