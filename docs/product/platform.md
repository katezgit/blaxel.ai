# Blaxel — platform overview

> **What this file is.** The structural and lexical anchor for the product. Every persona, workflow, design artifact, screen spec, component label, and error message derives from here. Fill before `personas.md` — it's step 1 of the derivation order in [`index.md`](./index.md).

## What Blaxel is

Blaxel is the **perpetual sandbox platform** — secure, infinite sandboxes kept on automatic standby to run AI code, with agents and context co-hosted on the same infrastructure plane for near-instant latency. It bundles four things every AI builder otherwise wires together themselves: **secure sandboxed compute with a real standby state** (a Sandbox idle for ~15s transitions to standby with no memory charge, then resumes near-instantly), **storage and image management scoped to the agent loop** (Volumes, Agent Drive, Images), **hosted runtime** (Agents / Agent Runtime, Batch Jobs, MCP Servers, Model APIs), and a **governance + access plane** (Policies for *where / how / how much* a workload runs; Roles for *who can do what* in a Workspace; API keys for authenticating callers).

## Domain model — the mental map behind every screen

> The dashboard's IA is **not finalized** (operator note, 2026-06-17). The model below is what the redesign should ground in — it is the domain understanding the IA should serve. The current sidebar grouping is captured separately, with a recommended adjustment.

**Three real problems Blaxel solves.** Naming them keeps the design grounded — every primitive on the platform exists to address one of these.

1. **AI workloads need a real isolated machine, not a function.** An agent might run `npm install`, edit files, start a dev server, browse the web. Function-level sandboxing (Lambda-style) doesn't cover that surface. → **Sandbox** is the load-bearing primitive: a real Linux machine with filesystem, processes, ports.
2. **AI workloads burst and idle hard.** A user types → spawn a Sandbox; user thinks → Sandbox idles for minutes; user types again → Sandbox runs. Cold-starting every interaction kills UX. Always-on burns money. → **Standby** is the wedge: idle Sandboxes drop to no-memory-charge in ~15s and resume near-instantly. This is the "perpetual" in the marketing line.
3. **AI workloads talk to models, expose tools, persist context, hand off between agents.** They aren't just "code that runs." → A family of primitives sits on top of Sandboxes: **Model APIs** (inference), **MCP Servers** (tool surfaces), **Agent / Agent Runtime** (long-running session-stateful programs with multi-agent primitives), and a **built-in MCP server** on every Sandbox so an agent can drive the Sandbox itself as a tool.

**The four-layer primitive stack.** Every primitive in the platform falls into one of these layers; designers should know which layer they're touching at every screen.

| Layer | What's in it | Why it's separate |
|---|---|---|
| **L1 — Compute substrate** | Sandbox · Image · Volume · Agent Drive | The unit of isolated compute and the persistent state attached to it. Everything else runs on top of this. |
| **L2 — Hosted workloads** | Agent (current) · Agent Runtime (private preview) · Batch Job · MCP Server · Model API | What the platform *runs*. Each has a distinct workload shape — see "Workload shapes" below. |
| **L3 — Surfaces** | REST API · built-in MCP server · Preview URL · Custom domains | How outside-world callers reach into L1 or L2. The first three are properties of every Sandbox; Custom domains lifts any of them onto customer-owned DNS. |
| **L4 — Tenancy, governance, access** | Account · Workspace · Region · Policy · Role · API key | Who can do what, where things are physically pinned, and what governs deployment decisions. Three distinct concerns: Policies = deployment governance, Roles = access control, API keys = authentication. |

**Workload shapes (L2).** Each hosted workload has a different scale shape and lifetime — the dashboard must make the shape visible because the user's mental model of "what's running" differs by primitive.

| Workload | Scale shape | Lifetime | Standout property |
|---|---|---|---|
| **Sandbox (raw)** | 1 Sandbox per session | Active → standby → deleted via TTL | The substrate; everything else uses it. |
| **Agent** *(current)* | 1 Agent runs in 1 Sandbox per session | Long-running, session-scoped | The current product surface for hosting a persistent agent. |
| **Agent Runtime** *(private preview — waitlist)* | 1 stateful session per identity; multi-agent coordination primitives | "Hours and days" — *no execution timeout*; scale-to-zero while waiting on external APIs | Atomic **lock / borrow / handover**, **copy-on-write forks**, shared context drives, **harness-agnostic**. The future shape of the Agent product. |
| **Batch Job** | "Spawn thousands of Sandboxes in seconds" — wide parallel fan-out | Finite, per-Job | The horizontal-scale primitive — many Sandboxes for a short time. Opposite shape from Agent's vertical-and-long. |
| **MCP Server** | Serverless, autoscaling | **15-minute hard cap** per invocation | Tool surface deployable as a peer of an Agent. Direct contrast with Agent Runtime's "no timeout." |
| **Model API** | Hosted inference endpoint — autoscaling | Long-running endpoint | The LLM call surface. |

**Reading the stack.** A typical customer composition stacks across L1 → L2 → L3: deploy an Image as a Sandbox (L1) → run an Agent on that Sandbox (L2) → expose it on a Custom domain over the Preview URL with a `bl_preview_token` (L3), governed by a Policy (L4) and called via an API key whose Role allows the action (L4). The Dashboard's job is to make this composition legible without forcing the user to navigate four sidebar groups to see it.

## Surfaces of the Blaxel platform

| Surface | Where | What users do there |
|---|---|---|
| **Dashboard** | blaxel.ai (web app) | Inspect and manage Sandboxes, Volumes, Agents, Batch Jobs, MCP Servers, Model APIs, Custom domains; rotate API keys; author and audit Policies; debug runs |
| **CLI** | local terminal — binary `bl` | Authenticate, connect into a Sandbox (`bl connect sandbox <name>` — opens an interactive terminal session, "similar to SSH"), deploy and inspect primitives, drive the runtime from local |
| **SDK** | customer code — package `@blaxel/core` (entry class `SandboxInstance`) | Programmatically create / connect to Sandboxes; operate sub-objects `fs` (file system), `process` (process execution), `network` (Ports), `previews` (real-time previews), `sessions` (client-side sessions), `codegen` (code-generation tools); read `metadata` / `spec` / `events` / `status` / `lastUsedAt` |
| **Hosted runtime** | Blaxel infrastructure, region-pinned (see Regions below) | Where Sandboxes, Agents, Batch Jobs, MCP Servers, and Model APIs actually execute |

**Surface model in one line.** The CLI + SDK are how the user *authors and operates* the runtime; the Dashboard is how the user *inspects and audits* it. The two are peers, not a hierarchy — `bl connect sandbox <name>` from a local terminal opens a remote-dev-env channel into the running Sandbox, and the developer can then drive `sandbox.process.exec()` / `sandbox.fs.write()` / `sandbox.previews.create()` from local code while the Dashboard shows live state for the same Sandbox.

## Tenancy and access model

Two distinct planes — **governance** (what runs where, and with what budget) and **access** (who is allowed to touch it). These are separate primitives in Blaxel; conflating them is a common misread.

- **Account** — highest tenancy level. An Account can hold multiple **Workspaces** ("a common pattern when dealing with multiple environments — dev vs prod — business units, or end-clients").
- **Workspace** — the container every resource (Sandbox, Agent, Batch Job, MCP Server, Model API, Custom domain, Policy, API key) lives inside. Access is scoped here.
- **Role** — workspace-level access control. Two roles today: **admin** (full CRUD) and **member** (full CRUD on Agents, MCP Servers, Model APIs, Batch Jobs, Sandboxes; **read-only on Policies**).
- **API key** — long-lived authentication credential. Identifies *which caller* a request is from; the caller's Role then determines what they can do.
- **Policy** — **governance**, not access. Policies "program how and where your workloads are deployed on Blaxel" — gating **location** (region), **flavor** (hardware tier), and **token usage** for Model APIs, hosted MCP Servers, and Agent deployments on the Global Agentics Network.

## Who it's for

Hybrid B2B SaaS — self-serve sign-up for individual builders and growth-stage teams, enterprise contracts for larger AI customers. Target customer: **AI builders at high-growth companies** (current logo wall: Cubic, Mendral, Shortwave, Polsia, Vybe, Casco, Bloom, Cartage, hirethomas.ai, Sapiom, Webflow, Strapi, Ploy, Human Behavior).

Primary user types: **AI Platform / Agent Engineer at an AI-native startup** (the primary) and **Lead AI Engineer at an established product company adding agents** (the secondary). See [`personas.md`](./personas.md) for the full profiles.

## Platform primitives

The nouns that make up the product. Every UI label, every error message, every doc references these terms verbatim — see "Terminology" below.

| Name | What it is |
|---|---|
| **Sandbox** | Isolated, secure compute environment that runs AI / agent code. The platform's load-bearing primitive — every other compute concern composes through here. Region-pinned. Three runtime states: **active**, **standby** (idle ~15s → standby with no memory charge; resumes near-instantly), and **deleted** (via `expiresIn` driven by `ttl` / `ttl-idle` / `ttl-max-age` — no default; quota tier caps lifetime at 7d on Tier 0 and 30d on Tier 1). Surfaces SDK sub-objects (`fs`, `process`, `network`/Ports, `previews`, `sessions`, `codegen`) and three connection methods (REST API, built-in MCP server, Preview URL — see below). |
| **Volume** | Persistent block storage attachable to a Sandbox. **Regional** — must be in the same region as the resource it attaches to (required when attaching to a region-pinned Agent). State that must outlive a Sandbox lifecycle goes here. |
| **Agent Drive** | **Distributed filesystem mountable to multiple Sandboxes or Agents simultaneously**, with concurrent read-write access and built-in replication. The distinguishing feature vs. a Volume is *concurrent multi-resource mount*, not "pre-wired into one agent." |
| **Image** | The **customizable, reusable snapshot** a Sandbox is forked from. Workflow: customer takes a base Sandbox, configures it (installs deps, sets up the environment), saves it as an Image; new Sandbox instances are then **spawned from that Image**, inheriting the configured state. *("Fork off sandboxes from an image — create customized & reusable sandbox environments to spawn new sandbox instances from.")* Closer to a git-fork mental model than a container-boot one. Customer-built or platform-provided. |
| **Agent** *(current GA)* | Hosted, long-running AI program with co-located Sandbox + Drive + Model API access. The deployable unit for a customer's product today. Long-running by design — contrast with the 15-minute runtime cap on hosted MCP Servers. |
| **Agent Runtime** *(private preview — "Join the waitlist" today)* | Purpose-built **session-first, fully stateful** runtime for AI agents. *"Run for hours, and hand off cleanly between agents without writing a single line of state management."* Distinguishing properties: **session-first, keyed by identity** (state and storage persist across restarts, retrieve with just a key); **no execution timeouts** (scale-to-zero while waiting on external APIs — designed for hours-and-days agents); **multi-agent primitives built in** (atomic lock, borrow, handover; copy-on-write forks; shared context drives); **harness-agnostic** (works with any agentic framework). Likely supersedes Agent when GA — flag for operator before designing the Agents detail page. |
| **Batch Job** | Finite, massively-parallel execution: *"Spawn thousands of jobs in individual sandboxes in seconds with Blaxel SDK. Instant scale on demand."* Each Job fans out across many Sandboxes — the **horizontal-scale primitive**, opposite of Agent's vertical-and-long shape. Product page labels this **"Batch jobs"** (lowercase j); the API noun stays as documented. |
| **MCP Server** *(Hosting)* | Serverless, autoscaling deployable program that exposes capabilities (DBs, APIs, files, etc.) through the Model Context Protocol. Maximum runtime per invocation: **15 minutes**. Has its own global endpoint. **In the API this primitive is called `function`.** This is *not* the same as the per-Sandbox built-in MCP server — see Connection methods. |
| **Model API** | Hosted inference endpoint — customer-deployed model or platform-brokered access to frontier models. |
| **Custom domains** *(docs group: Infrastructure)* | Customer-owned DNS pointed at a Blaxel resource with managed TLS. *Today only Sandbox previews are supported; Agents and MCP Servers marked "coming soon."* |
| **API key** | Long-lived authentication credential. Scoped to a Workspace. Identifies the caller; Role determines what they can do. |
| **Policy** | **Deployment governance** — programs *how and where* your workloads run (location / flavor / token usage on Model APIs, MCP Servers, Agent deployments). **Not** runtime authorization (that's Roles + API keys). |
| **Role** | Workspace-level access control. `admin` (full CRUD across the workspace) or `member` (CRUD on Sandboxes/Agents/Batch Jobs/MCP Servers/Model APIs; read-only on Policies). |
| **Region** | Where a resource is physically pinned. Currently enumerated: `us-pdx-1` (Oregon), `us-was-1` (N. Virginia), `eu-lon-1` (London), `eu-fra-1` (Frankfurt), plus pseudo-region **`auto`** (routes to closest). Volumes attaching to a region-pinned Agent must match its region. |
| **Workspace** | The tenancy container every resource lives inside; access is scoped here via Roles. Multiple Workspaces per Account (e.g. dev/prod, business units, end-clients). |

**Primitives the operator-supplied IA names but the public docs don't surface as standalone primitives** (flagged for operator confirmation — see Open questions):

| Name | Note |
|---|---|
| **Network** | Public docs treat networking as per-resource (Sandbox **Ports**, Infrastructure **Egress gateway**) — there is no top-level "Network" primitive. If the dashboard sidebar literally shows a "Network" item under Hosting, that's a dashboard-only grouping. |

## Sandbox lifecycle states

The Sandbox is the platform's load-bearing primitive; its state machine is referenced across the Dashboard, the SDK, and the audit surface. Every state below must be expressible in copy, color, and timeline UI:

| State | Trigger | What's true |
|---|---|---|
| **deploying** | `bl sandbox create` or `SandboxInstance.createIfNotExists` | The Sandbox is being provisioned from an Image. Not yet reachable. |
| **active** | Boot complete | Reachable on its connection methods; running processes consume RAM + CPU. The Dashboard shows live resource usage and Sandbox-call metrics. |
| **standby** | No traffic / activity for ~15s | Process state preserved; memory not charged; resumes near-instantly on the next inbound call. *This is the wedge — "perpetual" without standing-charges.* |
| **deleted** | `expiresIn` reaches zero (configured via `ttl` / `ttl-idle` / `ttl-max-age`) **or** Workspace quota tier cap reached (Tier 0: 7 days; Tier 1: 30 days) | Sandbox is removed. State on attached Volumes / Agent Drives persists. |

**Termination wording.** The Dashboard label *"Time left before termination: 6d 23h 57m 19s"* renders the `expiresIn` countdown — at zero, the Sandbox is **deleted**, not paused. Standby is not a terminating state; it is a steady state.

**No default TTL.** Docs are explicit: *"If these parameters are absent, sandboxes will not be deleted."* The countdown only appears once a `ttl*` is set or a Workspace tier cap applies.

## Sandbox connection methods

Every Sandbox exposes three first-class ways for the outside world to reach into it. These are *connection methods on a Sandbox*, not separate primitives — surfaced as a peer tab row on the Sandbox detail page in the Dashboard. Each is authenticated through API keys (with the caller's Role determining allowed actions); Policies do not gate per-request access here — they gate where the Sandbox itself was deployed.

| Method | What it is | Auth |
|---|---|---|
| **REST API** | HTTPS endpoint into the Sandbox runtime — JSON request/response. | API key bearer token. |
| **built-in MCP server** | Every Sandbox automatically exposes a Model Context Protocol endpoint so agents operate the Sandbox via tool calls for files, processes, ports, and previews. Endpoint pattern `https://<SANDBOX_BASE_URL>/mcp`. | `Authorization: Bearer <API_KEY>` (+ optional `X-Blaxel-Workspace` header). |
| **Preview URL** | A `*.preview.bl.run` URL that proxies **a specific port** inside the Sandbox. Multiple previews per Sandbox; each pinned to one port. Custom-domain mapping is supported for previews. | One of two token mechanisms: `bl_preview_token` query parameter, or `X-Blaxel-Preview-Token` header. |

**Built-in MCP server vs MCP Server (Hosting) — important disambiguation.** They share the protocol but are different primitives:

- **Built-in MCP server** = a protocol endpoint that comes attached to every running Sandbox. Lifetime = the Sandbox's lifetime. Use it to let an external agent operate *this* Sandbox.
- **MCP Server (Hosting)** = a separately deployable serverless program (API noun `function`) that exposes capabilities over MCP — its own global endpoint, own lifecycle, 15-minute max runtime per invocation.

## Top-level IA (dashboard nav)

> **Not finalized.** The operator has flagged that the current IA may not be the right one for the redesign. The brief documents both *what exists today* (the working hypothesis) and *what I recommend* (the adjustment, with reasoning). The wireframes phase makes the final call against personas — the recommendation below is input, not a lock.

### Current IA (working hypothesis, observed today)

Three concern groups in the dashboard sidebar, as described by the operator from the live product:

- **Sandboxes** — Sandboxes, Volumes, Agent Drive, Images
- **Hosting** — Agents, Jobs, MCP Servers, Model APIs, Network, Custom Domains
- **Security** — API keys, Policies

What works here: three groups is a legible top-level count; "Sandboxes" being its own group respects the load-bearing primitive; Security being a peer (not buried in Settings) signals platform-grade governance.

What's fuzzy here: "Hosting" mixes **workloads** (Agents / Jobs / MCP Servers / Model APIs) with **routing surfaces** (Network / Custom Domains). The public docs put Custom domains and Egress under "Infrastructure" — a different mental split. A user who wants to map a custom domain to a Preview URL has to know that "Custom Domains" lives under Hosting rather than under the Sandbox that exposes the preview.

### Recommended IA (one option, derived from the four-layer domain model above)

Three groups, with sharper labels that name the L1/L2/L3 distinction from the domain model:

- **Compute** *(L1)* — Sandboxes · Volumes · Agent Drive · Images
- **Workloads** *(L2)* — Agents *(or Agent Runtime when GA)* · Batch Jobs · MCP Servers · Model APIs
- **Network & Access** *(L3 + L4)* — Custom domains · Network · API keys · Policies

**Why this changes the mental model:**

1. **"Compute" names what the group is.** Today "Sandboxes" the group and "Sandboxes" the item share a name — the sidebar item collides with its parent. "Compute" pulls back to the layer the group represents.
2. **"Workloads" makes the L2 distinction load-bearing.** Users come to the platform to *run something*; this group is "the things you run." It excludes routing/access concerns, which makes "what's running right now" answerable in one glance at one group.
3. **"Network & Access" unifies what was previously split.** Custom domains, Network, API keys, and Policies are all about *getting into a workload from outside* (routing) and *deciding who is allowed to* (access). Grouping them resolves the docs-vs-dashboard tension about where Custom domains lives, and gives Sam (security-conscious persona) a single first-class destination.
4. **Tenancy primitives (Account / Workspace / Region / Role)** stay in the workspace switcher and account menu, not the sidebar — matches every comparable product (Vercel, Linear, Fly.io).

**Where Agent Runtime fits.** If Agent Runtime ships as the canonical Agent primitive (likely, per its positioning), the "Agents" sidebar item becomes "Agents" surfacing Agent Runtime. If both ship side-by-side for a period, the item becomes a section with two children — but the IA group itself stays Workloads.

**What this recommendation does not yet decide:**
- Whether "Batch Jobs" deserves its own sidebar item or nests under "Jobs" with a job-type filter. The product page treats it as a first-class destination, so first-class sidebar item is the safe default.
- Whether Agent Runtime is gated behind a separate waitlist surface in the dashboard or lives inline on the Agents page with a "preview" badge.
- Whether **Observability** and **Integrations** (top-level doc sections, unclear dashboard presence) need their own sidebar items or compose into the per-primitive detail pages.

These are wireframes-phase calls; they belong to the persona-anchored IA derivation, not the platform brief.

## Canonical user loops

The dominant journeys that combine the primitives above. Every screen exists to serve one of these. Workflows in `alex-workflow.md` are persona-specific *executions* of these loops.

1. **Spin up the runtime.** Pick a platform **Image** or fork your own (configure a base Sandbox, snapshot it as a reusable Image) → spawn a **Sandbox** from that Image (with attached **Volume** / **Agent Drive**) → deploy an **Agent** (or **MCP Server** / **Model API**) into it → expose via a **Preview URL** with a `bl_preview_token`, optionally on a **Custom domain**.
2. **Drive the Sandbox from local (Alex's primary loop).** `bl connect sandbox <name>` → run a TS / Python script against `SandboxInstance` — `process.exec`, `fs.write`, `previews.create` — while the Dashboard shows live state, resource usage, and Sandbox-call metrics.
3. **Fan out for batch work.** Compose a **Batch Job** that spawns N Sandboxes from an Image, runs work in parallel, collects results. Different shape from Agent's vertical-and-long loop — the same composition primitive, applied horizontally.
4. **Persist long agent sessions** *(Agent Runtime, when GA).* Deploy an Agent against the Agent Runtime engine → state and storage persist across restarts keyed by session identity → hand off to peer agents via lock / borrow / handover without writing state-management glue.
5. **Govern + gate.** Define **Policies** for deployment governance (where workloads run, on what hardware, with what token budget). Provision **API keys**; assign **Roles** for workspace access control.

---

## Terminology — canonical vocabulary

> **Rule.** Every label, error message, empty state, doc, spec, component name, and code identifier uses these terms **verbatim**. Synonyms drift across pages and break user trust. When in doubt, copy from this table.
>
> **Enforced by:** `product-domain-reviewer` on UX flows + wireframes — any synonym = FAIL, quote the offending term + the correct one. Engineering-surface enforcement (screen specs, component labels, code identifiers, Storybook stories) is **not yet automated** — `frontend-reviewer` and `storybook-documenter` should be extended to apply this same rule. Until then, the human review gate.

| Canonical term | Means | Banned synonyms (do not use) |
|---|---|---|
| **Sandbox** | Isolated secure compute environment for AI / agent code | `container`, `vm`, `instance`, `box`, `worker`, `runner` |
| **Volume** | Persistent regional block storage attached to a Sandbox | `disk`, `drive` (the latter is reserved for Agent Drive), `storage` |
| **Agent Drive** | Distributed multi-mount filesystem for Sandboxes / Agents | `agent volume`, `agent storage`, `working dir`, `home`, `shared volume` |
| **Image** | Customizable, reusable Sandbox snapshot; new Sandboxes are **forked / spawned** from it | `template`, `base`, `dockerfile output`. *Note: docs marketing uses "snapshot" descriptively ("a snapshot of a configured Sandbox") — that's fine in body copy, but **Image** is the canonical noun, not "snapshot."* |
| **Agent** | Hosted long-running AI program (a deployable unit) | `bot`, `assistant`, `worker`, `program` |
| **Agent Runtime** | The session-first, stateful, no-timeout runtime engine for Agents (private preview today) | Don't shorten to just "Agent" when the property in question (sessions / lock-borrow-handover / COW forks / harness-agnostic) is Agent-Runtime-specific |
| **Batch Job** | Massively-parallel finite execution — spawns many Sandboxes per Job | `task`, `run`, `cron job`. *Product page labels this **"Batch jobs"** (lowercase j); UI sidebar may shorten to "Jobs" — see Open questions; in body copy, prefer "Batch Job" verbatim.* |
| **MCP Server** | Hosted, serverless MCP program (API noun `function`); 15-min max runtime | `tool server`, `context server`, `mcp host`, `function` (as a UI label — `function` is the API noun only) |
| **built-in MCP server** | Per-Sandbox MCP endpoint at `/mcp` | `sandbox MCP`, `local MCP`, `MCP tab` |
| **Model API** | Hosted inference endpoint | `LLM endpoint`, `inference server`, `model server` |
| **Custom domains** | Customer-owned DNS pointed at a Blaxel resource (today: Sandbox previews) | `domain`, `vanity URL`, `custom URL`, `Custom Domain` (use plural lowercase d) |
| **API key** | Long-lived authentication credential | `token`, `secret`, `access key`, `API Key` (lowercase k after API) |
| **Policy** | Deployment governance rule (location / flavor / token usage) | `permission`, `rule`, `ACL`. **Not a synonym for Role.** |
| **Role** | Workspace access-control assignment (`admin` / `member`) | `permission`, `policy`, `group` |
| **Workspace** | Tenancy container; resources live here, access is scoped here | `project`, `tenant`, `org` |
| **Account** | Highest tenancy level; can hold multiple Workspaces | `org`, `team` |
| **Region** | Resource location pin (`us-pdx-1`, `us-was-1`, `eu-lon-1`, `eu-fra-1`, `auto`) | `zone`, `cluster`, `availability zone` |
| **Standby** | Sandbox idle state — no memory charge, near-instant resume | `paused`, `sleeping`, `cold` |
| **`expiresIn` / TTL** | Countdown to Sandbox **deletion** | `termination`, `time-to-live` (in UI: prefer "Expires in"; copy the SDK field name where exact) |

**Disambiguation rules** — call out pairs that are easy to confuse:

- **Sandbox vs Image.** Sandbox = the running, isolated compute instance. Image = the immutable template it boots from. A Sandbox runs an Image; an Image is not running. Using one for the other = FAIL.
- **Volume vs Agent Drive.** Volume is regional block storage attached to a Sandbox. Agent Drive is a **distributed, concurrently mountable** filesystem across multiple Sandboxes / Agents. "Drive" alone is ambiguous — always say "Agent Drive" or "Volume."
- **Agent vs Batch Job.** Agent = long-running deployable unit in 1 Sandbox (vertical-and-long shape). Batch Job = finite, massively-parallel execution that spawns N Sandboxes at once (horizontal-and-short shape). An Agent is *not* a Batch Job and vice versa — the shapes are opposites.
- **Agent vs Agent Runtime.** Agent is the current GA primitive. Agent Runtime is the next-gen engine (private preview) with sessions, no execution timeout, multi-agent coordination primitives (lock / borrow / handover / COW forks), and harness-agnosticism. Don't substitute one for the other when the property in question is Runtime-specific.
- **MCP Server vs built-in MCP server.** MCP Server (Hosting) is a separately deployed program with its own endpoint and 15-min runtime cap. built-in MCP server is a per-Sandbox protocol endpoint at `<SANDBOX_BASE_URL>/mcp`. Same protocol, different primitives. Never collapse to "MCP."
- **MCP Server vs Model API.** MCP Server exposes tools/context over the MCP protocol. Model API exposes inference. Both are hosted, but the protocol and purpose differ.
- **Policy vs Role vs API key.** Three distinct concerns: **API key** = authentication (who is calling), **Role** = workspace access control (what they can touch), **Policy** = deployment governance (where/how/how-much a workload runs). Confusing any two = FAIL. Especially: Policy is **not** authorization.
- **Sandbox standby vs deleted.** Standby is a steady state (idle, no charge, resumes). Deleted is terminal — `expiresIn` reached zero or quota cap hit. UI must not blur "your Sandbox is asleep" into "your Sandbox is gone."

**Voice / tone** lives in [`personality.md`](./personality.md) — this file is nouns only. Apologies, encouragement, hedges, and tone rules are guarded there.

> **No top nav / IA here.** ~~Nav structure and labels are derived in `wireframes`/`screens` from the canonical user loops above + the persona's workflow.~~ ~~Exception for this project: the top-level dashboard IA *is already fixed by the existing product*.~~ **Revised 2026-06-17:** the IA is **not** finalized — operator has explicitly opened it for the redesign. The brief documents (a) the current sidebar grouping as a working hypothesis and (b) a recommended IA derived from the four-layer domain model. The wireframes phase makes the final call.

---

## Open questions for operator

Each blocks a downstream design call; flag here so it's surfaced rather than guessed at. Ordered roughly by load-bearing-ness for downstream design.

1. **Agent vs Agent Runtime — design target for the redesign.** Agent Runtime is in private preview (waitlist). Three possible framings, each with different design consequences:
   - **(a) Design for current Agent only.** Agent Runtime stays a marketing/waitlist surface; redesign ignores it.
   - **(b) Design for Agent Runtime as the GA target.** The "Agents" sidebar item is built around Agent Runtime semantics (sessions, identity-keyed state, multi-agent primitives), with current Agent semantics treated as legacy.
   - **(c) Design both side-by-side with explicit framing.** Agents tab has a section for each.
   Operator pick drives the entire Agents detail page + the Hosting / Workloads group's mental model.
2. **IA grouping — Compute / Workloads / Network & Access vs current Sandboxes / Hosting / Security.** The recommendation in the IA section is one option, derived from the four-layer domain model. The wireframes phase will pressure-test it against personas; the operator's blessing on direction would unblock that pressure-test now rather than after another round of derivation.
3. **Does Policy gate runtime access in addition to deployment governance?** Public docs frame Policies as deployment-time (location, flavor, token usage). If runtime calls are *also* policy-evaluated (rather than authorized solely by Role + API key), say so — this changes the personality north-star paragraph (currently references "the Policy that denied the retry" and "the Policy resolution path before standup," which assume runtime-time policy evaluation). **If runtime-time Policy is not real, `personality.md` needs a touch-up pass to reframe Sam's audit story around Role denial + API key scope.**
4. **Sidebar label for Batch Jobs.** Docs canonical noun is "Batch Job"; the product page shows lowercase "Batch jobs"; the sidebar may further shorten to "Jobs." Confirm the in-product label before wireframes lock copy.
5. **`Observability` and `Integrations` appear as top-level doc sections** but aren't named in the operator-supplied dashboard IA. Real dashboard groups or doc-organization only? If real, they slot into the recommended IA (Observability is often per-primitive inline; Integrations is often a settings-tier group).
6. **Public docs don't enumerate SDK class names.** The dashboard screenshot evidences `SandboxFileSystem`, `SandboxProcess`, `SandboxNetwork`, `SandboxPreviews`, `SandboxSessions`, `SandboxCodegen`. Confirm these are the canonical class names if we'll reference them in design copy / empty states.
7. **Does the current dashboard expose Roles, Members, Workspaces, Account anywhere users see?** Standard pattern is workspace switcher + account menu, but if these surface as primary IA items today, the recommended IA should reflect that.

---

Canonical product reference: [https://blaxel.ai](https://blaxel.ai). Public docs: [https://docs.blaxel.ai](https://docs.blaxel.ai) — section index at [`/llms.txt`](https://docs.blaxel.ai/llms.txt).
