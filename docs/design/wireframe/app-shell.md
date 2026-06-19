# App Shell — wireframe (canonical)

**Status:** canonical · promoted 2026-06-18 from `.intermediate/design/wireframes/app-shell/`. Extended 2026-06-18 with three shell variants by URL scope (workspace / workspace settings / account).

**Anchors:**
- [`docs/design/guidelines/app-shell-layout.md`](../guidelines/app-shell-layout.md) — decision-tree branch 3 (sidebar + topbar combined).
- [`.intermediate/design/ia/proposal-v1.md`](../../../.intermediate/design/ia/proposal-v1.md) — IA scopes (Personal / Account / Workspace).
- [`docs/product/personas.md`](../../product/personas.md) — Alex (primary persona), Sam (sanity gate).
- [`docs/product/alex-workflow.md`](../../product/alex-workflow.md) — Phase 4 is load-bearing (drive + observe).

**Mockup:** [`../mockup/app-shell/index.html`](../mockup/app-shell/index.html) — interactive reference for the **workspace** variant only; resize the browser to verify breakpoint behavior. The workspace-settings and account variants have no canonical mockup yet — they are spec-only in §4 and §5.

---

## 1. Three shell variants by URL scope

The shell renders in three modes. The variant is selected by the URL scope; the user is told which scope they're in via the topbar's top-left zone.

| Scope | URL pattern | Shell |
|---|---|---|
| **Workspace** (resource pages) | `/:workspaceSlugOrId/{sandboxes, volumes, agent-drive, images, agents, jobs, mcp-servers, model-apis, network, custom-domains, api-keys, policies}` | Workspace shell — §2 baseline, §6–9 responsive |
| **Workspace settings** | `/:workspaceSlugOrId/settings/{general, team, sandbox-settings, usage-and-limits, danger-zone}` | Workspace settings shell — §4 |
| **Account** | `/account/{profile, preferences, billing, invoices}` | Account shell — §5 |

`:workspaceSlugOrId` accepts the workspace's URL slug (preferred for shareable links) or its UUID. The route normalizes to the canonical slug on render.

**Hard rule of separation.** When the user is inside the workspace-settings or account scope, **the main workspace resource sidebar (Sandboxes / Hosting / Security) is NEVER shown.** Each sub-shell replaces it with its own focused sub-sidebar. This stops users from conflating workspace meta with workspace resources, and gives a clear "I am in settings" / "I am in account" mode.

**Entry points into the sub-shells:**

- **Workspace settings**: workspace switcher dropdown (top-left) → "Workspace settings →" → `/:workspaceSlugOrId/settings/general` (from the workspace shell — see §2; the chip is not present inside settings itself, so the entry is one-way from workspace home).
- **Account**: avatar menu (top-right) → "Account & billing →" → `/account/billing` (or last-visited account sub-route).

**Exits back to the workspace shell:**

- **From workspace settings**: via the account-style sidebar header — `← Return to app` deep-links to `/:workspaceSlugOrId/sandboxes` for the most-recently-visited workspace. (The workspace switcher chip is no longer present in the workspace-settings topbar, so the return affordance lives in the sidebar header only.)
- **From account**: `← Return to app` link in the account sidebar's header (above the `ACCOUNT SETTINGS` section label — see §5) — deep-links to `/:workspaceSlugOrId/sandboxes` for the user's most-recently-visited workspace.

---

## 2. Canonical zones — workspace shell (baseline)

Four zones, fixed responsibilities. Same pattern across every breakpoint — only collapse rules differ. The workspace-settings and account variants reuse this four-zone skeleton with the sidebar (and, in account scope, the workspace context zone) substituted — see §4 and §5.

| Zone | Role | Holds |
|---|---|---|
| **Top-left** | Workspace context | Brand · workspace switcher (dropdown: Switch · Create · **Workspace settings →** deep-links to `/:workspaceSlugOrId/settings/general`) |
| **Top-right** | Identity utility | **Search icon (⌘K) · Notifications bell · Help (?) · Avatar (Personal scope, focused menu — see §12)** |
| **Left sidebar** | Workspace resources | Sandboxes / Hosting / Security groups (per §13) |
| **Main content** | Page | Selected resource / page (breadcrumb stack + title + actions + content bands) |

## 3. Hard rules

These are non-negotiable across every breakpoint, every shell variant, and every page.

1. **Workspace context is never hidden in workspace scope.** When inside the **workspace** shell, the workspace switcher is visible in the topbar's top-left. In both sub-shells (workspace settings §4, account §5), the sub-shell sidebar's header carries a "Return to workspace" affordance (the literal user-facing label is `Return to app`; see §4/§5), and the topbar's top-left zone shows brand only — the workspace switcher chip lives only in the workspace shell.
2. **Search is keyboard-first.** Search is rendered as an icon button in the identity cluster at every breakpoint. The icon never collapses, never moves to its own row, never has a placeholder. `⌘K` (`Ctrl+K` on non-mac) opens the command palette — see §17. The icon is a redundant affordance for users who don't know the shortcut.
3. **Sidebar labels collapse before sidebar disappears.** Progression: 248 → 220 → 64 (icon rail) → 0 (drawer). Avoid jumping from full sidebar to no sidebar. Applies to all three variants — the sub-shells collapse via the same rules with their own item set.
4. **Page actions remain visible.** Primary action (e.g., `Open Playground`, `Save changes`) stays in the title row on desktop; stacks vertically on mobile with primary at top.
5. **Tier badge lives with Account, not Workspace.** Tier is account-scoped — appears inside the avatar menu's Account header and on the Account / Billing page, never on the workspace switcher chip.
6. **Theme is 1 click after the menu opens.** Avatar → Theme row (inline segmented control: System · Light · Dark) → segment click applies immediately. No submenu navigation; no confirmation step.
7. **Workspace settings has one entry point.** Workspace switcher dropdown (top-left) **in the workspace shell only** — the chip is not present inside the settings shell itself. NOT also in the avatar menu.
8. **Single avatar.** No double-identity-zone conflation. The top-right avatar is the only user-shaped affordance.
9. **Sub-shells hide the workspace resource sidebar.** Workspace-settings shell shows its own sub-sidebar (§4). Account shell shows its own sub-sidebar (§5). No surface ever shows both the workspace resource sidebar AND a sub-shell sidebar.

## 4. Workspace settings shell — sub-spec

The user is **still inside the workspace** but operating on workspace meta (team membership, billing scope, policy, danger zone). The topbar's workspace context zone shows the Blaxel brand only — the workspace switcher chip is hidden here (same as the account shell); the return affordance lives in the sidebar header instead (see below). The resource sidebar is replaced by the workspace-settings sub-sidebar.

**Zones — what changes from the workspace shell:**

| Zone | Workspace shell content | Workspace settings shell content |
|---|---|---|
| Top-left | Brand + workspace switcher | **Unchanged shape — brand only** (workspace switcher hidden — see §4 sidebar header for the return affordance) |
| Top-right | Identity utility | **Unchanged** — search icon (⌘K) · bell · ? · avatar present identically |
| Left sidebar | Workspace resources (Sandboxes / Hosting / Security) | **Replaced — Workspace Settings sub-sidebar** (see items below) |
| Main content | Page | **Same shape** — breadcrumb stack ("Workspace settings / Team") + title + actions + content bands |

**Sidebar header** (above the `WORKSPACE SETTINGS` section label):

- **Position:** top of the workspace-settings sidebar, rendered before the section label and any nav items.
- **Composition:** chevron-back icon (`←`) + label **"Return to app"** — static string, does not track the workspace name.
- **Behavior:** deep-links to `/:workspaceSlugOrId/sandboxes` for the user's most-recently-visited workspace (destination is dynamic; label is static).
- **Tablet collapse:** at the 64px icon-rail breakpoint the header collapses to a `←` icon-only button at the top of the rail, with a "Return to app" tooltip on hover (tooltip renders in collapsed/rail mode only — see §13c).

**Sub-sidebar items (in display order):**

1. **General** — workspace name, slug, default region, default time zone
2. **Team** — members, invites, roles, SSO
3. **Sandbox settings** — workspace-wide sandbox defaults (idle timeout, max concurrency, base image)
4. **Usage & limits** — quotas, soft limits, current usage rollup with drill-down to billing
5. **Danger zone** — archive workspace, transfer ownership, delete workspace

**Return to workspace shell:** the return affordance lives in the sidebar header (see above), not in the topbar. The workspace-settings topbar's top-left zone shows the Blaxel brand only — the workspace switcher chip is absent inside this shell. The workspace switcher dropdown (Switch / Create / **Workspace settings →** active state) is a workspace-shell affordance only and lives in the workspace shell (§2); when the user enters workspace settings, that chip is not present.

**Active state.** The current sub-route is highlighted in the sub-sidebar with the same accent token used in the workspace shell.

## 5. Account shell — sub-spec

The user has **left workspace scope**. Account is account-scoped — settings here apply to the user's identity across every workspace they belong to. No workspace context is visible. No workspace resource sidebar. No search.

**Zones — what changes from the workspace shell:**

| Zone | Workspace shell content | Account shell content |
|---|---|---|
| Top-left | Brand + workspace switcher | **Unchanged shape — brand only** (workspace switcher hidden — see §5 sidebar header for the return affordance) |
| Top-right | Identity utility | **Unchanged** — bell · ? · avatar (no search icon; account scope has nothing workspace-side to search) |
| Left sidebar | Workspace resources | **Replaced — Account sub-sidebar** (see items below) |
| Main content | Page | **Same shape** — breadcrumb stack ("Account / Profile") + title + actions + content bands |

**Sidebar header** (above the `ACCOUNT SETTINGS` section label):

- **Position:** top of the account sidebar, rendered before the section label and any nav items.
- **Composition:** chevron-back icon (`←`) + label **"Return to app"** — static string, does not track the workspace name.
- **Behavior:** deep-links to `/:workspaceSlugOrId/sandboxes` for the user's most-recently-visited workspace (destination is dynamic; label is static). For users belonging to multiple workspaces, this is the last workspace the user viewed before entering account scope. For users who land on `/account/*` from an external link (email, support) without an active session workspace, fall back to the first workspace in their membership list (alphabetical order).
- **Zero-workspace fallback:** if the user has zero workspaces (rare — see onboarding flow), the header shows "Return to app" but click takes the user to the workspace-create flow.
- **Tablet collapse:** at the 64px icon-rail breakpoint the header collapses to a `←` icon-only button at the top of the rail, with a "Return to app" tooltip on hover (tooltip renders in collapsed/rail mode only — see §13c).

**Sub-sidebar items (in display order):**

1. **Profile** — name, email, avatar, password, 2FA, connected identities
2. **Preferences** — density, locale, notification rules, default theme
3. **Billing** — subscription tier (Tier 1 badge here), payment method, usage charges, upgrade
4. **Invoices** — invoice history, download PDF

**Return to workspace shell:** the return affordance lives in the sidebar header (see above), not in the topbar. The account shell topbar's top-left zone shows the Blaxel brand only — the workspace switcher chip is absent because account is explicitly cross-workspace (see §3 rule 1 and the "Why no workspace switcher here?" note below).

**Why no workspace switcher here?** Account is the one scope where workspace identity is intentionally absent — these settings apply to the user, not a workspace. Showing the workspace switcher would invite the user to think a setting on this page applies to a single workspace; it does not. The Return-to-workspace link signals "this is your account; click here to go back to a workspace" without implying that the workspace context applies to the page.

**Active state.** The current sub-route is highlighted in the sub-sidebar.

---

## 6. Desktop wide (≥1280px) — workspace shell

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ ⌂ Blaxel  webflow-prod ▾                                            🔍  🔔3  ?  k    │  64px topbar
├──────────────┬───────────────────────────────────────────────────────────────────────┤
│ SANDBOXES    │  Model APIs / prod-openai-chat                                         │
│   Sandboxes  │                                                                        │
│   Volumes    │  prod-openai-chat                       ● active  [Playground] [⟳] [⋯]│
│   Agent Drive│  mdl-7a3f · OpenAI · gpt-4o · …                                        │
│   Images     │  ────────                                                              │
│ HOSTING      │  ╔════════════════════════════════════════════════════════════════╗  │
│   Agents     │  ║ Operational                                                    ║  │
│   Jobs       │  ║ Endpoint · Requests · Errors · Latency · Tokens MTD            ║  │
│   MCP Servers│  ╚════════════════════════════════════════════════════════════════╝  │
│ ▸ Model APIs │  ╔════════════════════════════════════════════════════════════════╗  │
│   Network    │  ║ Configuration · Policy & Budget · Forensic                     ║  │
│   Custom Doms│  ╚════════════════════════════════════════════════════════════════╝  │
│ SECURITY     │                                                                        │
│   API Keys   │                                                                        │
│   Policies   │                                                                        │
└──────────────┴───────────────────────────────────────────────────────────────────────┘
   248px              fluid main, content padding 32px
```

**Settings:**
- Sidebar: 248px (full labels visible)
- Topbar: 64px
- Content padding: 32px
- Grids: 3-col where applicable

## 7. Desktop compact (1024–1279px) — workspace shell

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ⌂ Blaxel  webflow-prod ▾                             🔍  🔔3  ?  k        │  64px
├──────────────┬───────────────────────────────────────────────────────────┤
│ SANDBOXES    │                                                            │
│   Sandboxes  │  (same shell, tighter spacing)                             │
│   …          │                                                            │
└──────────────┴───────────────────────────────────────────────────────────┘
   220px           main content, padding 28px
```

**Changes from wide:**
- Sidebar: 220px (full labels still visible)
- Content padding: 28px
- Card grids: 3-col → 2-col
- Sidebar does NOT collapse yet — users still operating at this width

## 8. Tablet (768–1023px) — workspace shell — icon rail + hamburger

```
┌─────────────────────────────────────────────────────────────┐
│ ☰  ⌂ Blaxel  webflow-prod ▾                  🔍  🔔3  ?  k  │  64px
├──────┬──────────────────────────────────────────────────────┤
│ sb   │                                                      │
│ vl   │  Model APIs / prod-openai-chat                       │
│ dr   │                                                      │
│ im   │  (page content, padding 24px)                        │
│ ────  │                                                      │
│ ag   │                                                      │
│ jb   │                                                      │
│ mc   │                                                      │
│ md ▸ │   ← active                                            │
│ nt   │                                                      │
│ cd   │                                                      │
│ ────  │                                                      │
│ ak   │                                                      │
│ po   │                                                      │
└──────┴──────────────────────────────────────────────────────┘
   64px        main content, padding 24px
```

The `sb` / `vl` / etc. tokens in this ASCII represent the lucide icons (Container / HardDrive / FolderOpen / Package / Bot / Workflow / Plug / BrainCircuit / Network / Link2 / KeyRound / ShieldCheck) from §13 — they're abbreviations for visual clarity, not literal label text. Tooltips on rail icons render the full label per §13c — in expanded mode (≥1024px), no tooltips.

**Changes from compact:**
- Sidebar: 64px icon rail (labels hidden, group labels hidden, icons centered)
- **Hamburger trigger (`☰`) appears in topbar-left** — opens a drawer with full labels
- Workspace switcher stays in topbar (not collapsed)
- Group dividers replace text labels in sidebar
- Tooltip on hover shows full label for each rail icon

**Drawer (opened from `☰`):**
- Slides in from the left, overlays main content
- Width: 280px
- Contents: full nav with labels + group headers (same as wide sidebar)
- Dismiss: click outside, Esc, or click `☰` again
- The icon rail stays visible behind the drawer

## 9. Mobile (<768px) — workspace shell

```
┌──────────────────────────────────────┐
│ ☰  ⌂ Blaxel         🔍  🔔3  ?  k   │  row 1: hamburger · brand · identity-cluster (incl. search icon)
│ webflow-prod ▾                       │  row 2: workspace switcher (full width)
├──────────────────────────────────────┤
│  Model APIs / prod-openai-chat       │
│                                      │
│  prod-openai-chat       ● active     │
│  mdl-7a3f · OpenAI · gpt-4o          │
│                                      │
│  [Open Playground]                   │  ← primary, full width
│  [⟳ Rotate provider key]            │
│  [⋯ More]                            │
│                                      │
│  ─── Operational ───                 │
│  Endpoint  https://run.blaxel.ai/…  │
│  Requests  8,512                     │
│  Errors    26                        │
│  Latency   412 ms                    │
│  Tokens    18M / 30M  ● 60%          │
│                                      │
│  ─── Forensic ───                    │
│  200  POST /v1/chat/completions      │
│  ...                                 │
└──────────────────────────────────────┘
   no sidebar; nav opens from ☰        content padding 16px
```

**Changes from tablet:**
- Sidebar: hidden entirely (only reachable via `☰` hamburger which opens a drawer)
- Topbar wraps to **2 rows**:
  - Row 1: hamburger · brand · identity-cluster (🔍 🔔 ? avatar)
  - Row 2: workspace switcher full-width
- Workspace remains visible at top
- Page actions stack vertically; primary on top, secondary below
- Metric cells stack 1-col (no horizontal grid)
- Tables collapse to **cards** (key data per row in a card; horizontal scroll forbidden for primary data)
- Content padding: 16px
- Demo annotations (red callouts) hidden on mobile — they overlap awkwardly

> **Sub-shells responsive behavior.** Workspace-settings and account shells follow the same breakpoint rules. Their sub-sidebars collapse to icon rail at tablet and disappear behind the hamburger drawer at mobile, exactly like the workspace sidebar. The drawer contents at tablet/mobile show the active variant's sub-sidebar items with full labels. **All shells' mobile topbar = 2 rows** (row 1: hamburger · brand · identity-cluster; row 2: workspace switcher — sub-shells show brand-only in row 1 with no workspace switcher chip, so they effectively use 1 row, but the row-1 structure is identical). The return-to-workspace affordance lives at the top of each sub-shell sidebar — at mobile breakpoint it appears as the first item inside the hamburger drawer (above the respective section header: `WORKSPACE SETTINGS` or `ACCOUNT SETTINGS`). Tablet (icon-rail) collapses the return header to a `←` icon-only button at the top of the rail with a tooltip showing the full label.

## 10. CSS variable map

```css
:root {
  --topbar-h: 64px;
  --sidebar-w: 248px;
  --content-px: 32px;
}

@media (max-width: 1279px) {
  :root { --sidebar-w: 220px; --content-px: 28px; }
}

@media (max-width: 1023px) {
  :root { --sidebar-w: 64px; --content-px: 24px; }
  /* + show .mobile-nav-trigger, hide .nav-label + .group-label */
}

@media (max-width: 767px) {
  :root { --topbar-h: auto; --content-px: 16px; }
  /* + topbar grid to 2-row across all shells (workspace row + brand/identity row), hide sidebar, stack page-actions */
}
```

Applies to all three shell variants.

## 11. Responsive priority — what collapses, in order

From least likely to disappear → most likely to disappear:

1. **Workspace switcher** (workspace shell only) / **Sub-shell sidebar return header** (workspace settings + account sub-shells) — never disappears; workspace switcher only changes position (top-left → its own row on mobile); sub-shell sidebar return header collapses to icon-only at tablet, moves into hamburger drawer at mobile
2. **Page identity** (breadcrumb + title + state pill) — always visible
3. **Primary action** (e.g., Open Playground, Save changes) — always visible, may resize / stack
4. **Search icon (⌘K palette trigger)** — visible in identity cluster at every breakpoint for workspace + workspace-settings shells (account shell omits it — see §5). Never collapses, never resizes, never moves. The palette modal itself is breakpoint-responsive — see §17.
5. **Identity cluster** (🔔 ? avatar) — visible at every breakpoint; never collapses
6. **Sidebar labels + group headers** — collapse first at tablet (all variants)
7. **Sidebar shape** — collapses next (full → rail → hidden)
8. **Secondary actions** — present on desktop; stack below primary on mobile
9. **Demo annotations / popovers** — hidden on mobile

## 12. Avatar menu (Personal scope, focused)

Six interactive items + theme sub-menu. Workspace settings NOT here.

```
👤 Kate
   katexuzy@gmail.com
   Tier 1
─────────────────────
Profile               ← /account/profile
Preferences           ← /account/preferences  (density, notification rules, locale)
Theme    [ System | Light · Dark ]   ← inline segmented control; clicking a segment applies the theme immediately, no submenu
─────────────────────
Account & billing   →       ← /account/billing  (deep-link to account shell)
─────────────────────
Help & shortcuts   ?
Log out
```

**Header — three lines:** name (`Kate`) · email (`katexuzy@gmail.com`) · tier badge (`Tier 1`). The name carries human identity; the email is the disambiguator; the tier sits with Account (where it belongs semantically).

**Profile / Preferences / Account & billing** all deep-link to the **account shell** (§5). The avatar menu is the entry point into account scope. Once the user clicks any of those items, the chrome switches to the account shell — the workspace switcher chip is replaced by a Return-to-workspace link, and the resource sidebar is replaced by the account sub-sidebar.

**Preferences vs Theme — distinct items.** Preferences holds density, notification rules, locale — settings that benefit from a dedicated page. Theme is rendered as an inline 3-segment control (System · Light · Dark) on its own row in the avatar menu — a single click applies the theme, no submenu navigation. Listing them as siblings matches Linear / GitHub patterns.

### Segmented control — state spec

- **Segments**: `System` · `Light` · `Dark`, in that order, left to right.
- **Active segment**: the resolved theme (if user selected System, active is whichever System resolves to currently — but the visual highlight stays on `System` because that's the user's choice; if user selected Light or Dark, the active highlight is on that segment).
- **Click**: applies the theme via `next-themes`'s `setTheme()`, optimistic — no loading state, no confirmation.
- **Keyboard**: ← / → arrow keys navigate within the segment group; Enter / Space activates focused segment; Esc closes the avatar menu without affecting theme.
- **Affordance**: the row is no longer click-through — clicking the row body outside a segment does NOT close the menu (the user is interacting with the control, not navigating).

Theme reachable in 1 click after the menu opens (avatar → segment click).

## 13. Sidebar nav items — icon vocabulary (workspace shell)

Icons are `lucide-react` SVGs rendered at 16×16 next to the label in the full sidebar and at 20×20 centered in the icon rail. Active item highlighted via accent token; default state uses muted-foreground. Stroke width 1.75 (lucide default) keeps weight consistent across all icons.

| Group | Item | Icon (`lucide-react`) | Route |
|---|---|---|---|
| Sandboxes | Sandboxes | `Container` | `/:workspaceSlugOrId/sandboxes` |
| Sandboxes | Volumes | `HardDrive` | `/:workspaceSlugOrId/volumes` |
| Sandboxes | Agent Drive | `FolderOpen` | `/:workspaceSlugOrId/agent-drive` |
| Sandboxes | Images | `Package` | `/:workspaceSlugOrId/images` |
| Hosting | Agents | `Bot` | `/:workspaceSlugOrId/agents` |
| Hosting | Jobs | `Workflow` | `/:workspaceSlugOrId/jobs` |
| Hosting | MCP Servers | `Plug` | `/:workspaceSlugOrId/mcp-servers` |
| Hosting | Model APIs | `BrainCircuit` | `/:workspaceSlugOrId/model-apis` |
| Hosting | Network | `Network` | `/:workspaceSlugOrId/network` |
| Hosting | Custom Domains | `Link2` | `/:workspaceSlugOrId/custom-domains` |
| Security | API Keys | `KeyRound` | `/:workspaceSlugOrId/api-keys` |
| Security | Policies | `ShieldCheck` | `/:workspaceSlugOrId/policies` |

> The picks lean on lucide's most specific shape per primitive:
> - **Container** for Sandboxes — containerized runtime is what a sandbox *is*; `Box` was too generic.
> - **HardDrive** for Volumes — mounted block storage; `Database` implied a SQL DB which Volumes aren't.
> - **FolderOpen** for Agent Drive — per-agent filesystem mount evokes hierarchy/files, not block storage.
> - **Package** for Images — container images are packaged runtime artifacts; `Layers` was abstract.
> - **Bot** for Agents — the AI-agent canonical glyph; unchanged.
> - **Workflow** for Jobs — scheduled async work pipelines; `Briefcase` read as office work.
> - **Plug** for MCP Servers — plug-in protocol; unchanged.
> - **BrainCircuit** for Model APIs — LLM compute; `Sparkles` was generic AI shimmer.
> - **Network** for Network — direct match; unchanged.
> - **Link2** for Custom Domains — explicit domain-linking glyph; `Globe` read as international.
> - **KeyRound** for API Keys — unchanged.
> - **ShieldCheck** for Policies — unchanged.

**Sub-shell icons** (when collapsed at tablet):

| Variant | Item | Icon (`lucide-react`) | Route |
|---|---|---|---|
| Workspace settings | General | `Settings` | `/:workspaceSlugOrId/settings/general` |
| Workspace settings | Team | `Users` | `/:workspaceSlugOrId/settings/team` |
| Workspace settings | Sandbox settings | `SlidersHorizontal` | `/:workspaceSlugOrId/settings/sandbox-settings` |
| Workspace settings | Usage & limits | `Gauge` | `/:workspaceSlugOrId/settings/usage-and-limits` |
| Workspace settings | Danger zone | `AlertOctagon` | `/:workspaceSlugOrId/settings/danger-zone` |
| Account | Profile | `User` | `/account/profile` |
| Account | Preferences | `Settings2` | `/account/preferences` |
| Account | Billing | `CreditCard` | `/account/billing` |
| Account | Invoices | `Receipt` | `/account/invoices` |

> `AlertOctagon` for Danger zone (octagon = stop sign affordance, harder visual signal than `AlertTriangle`). `Settings2` for Preferences gives account-shell its own settings glyph distinct from workspace-settings' `Settings`. Other picks unchanged.

**Sub-shell sidebar header**

Both sub-shells render their respective sidebar with a return-to-parent header above the section label, with identical composition (`← Return to app`, returns to `/:workspaceSlugOrId/sandboxes`):

- **Account shell**: header is the only entry point back to a workspace (no workspace switcher chip in the account topbar).
- **Workspace settings shell**: header replaces the previous workspace-switcher-chip return path (the chip is no longer present in the workspace-settings topbar).

The return header is composed of `<ArrowLeft />` (lucide-react, 16×16) + the static label **"Return to app"**. Same visual weight as a nav item but no active state and no rail-icon fallback. At tablet icon-rail breakpoint, the label collapses; only the `ArrowLeft` glyph remains with a tooltip showing "Return to app" — tooltip renders in collapsed/rail mode only per §13c (the label is visible in expanded mode and needs no tooltip there).

**§13c — Tooltip rule.** In the expanded sidebar (label visible), nav rows do **NOT** render a tooltip on hover — the label is the affordance. In the collapsed icon-rail (label hidden), each nav row renders a tooltip showing the full label. The tooltip is bound to the sidebar's collapsed state, not the row itself — when the sidebar expands at the tablet→desktop breakpoint, the tooltip is unmounted. This applies to all nav items and to the sub-shell return header.

Sidebar nav icons concretized to lucide-react components on 2026-06-18 per operator's directive — the two-letter fallback is closed.

## 17. Command palette (`⌘K`) anatomy

Triggered by:
- Click on the search icon (top-right identity cluster, all breakpoints, workspace + workspace-settings shells).
- Keyboard shortcut `⌘K` (mac) / `Ctrl+K` (other). Active on every route, including account shell (so users can jump back into workspace context via a recent-workspace command).

The modal is a centered overlay (max-width 640px, top offset ~80px). Backdrop dims the page. Dismiss: Esc, backdrop click, or the `×` close button in the modal's header.

### 17.1 Anatomy

| Row | Holds |
|---|---|
| Header | `🔍` (lucide `Search`) · input "Type a command or search…" · `×` close button |
| Divider | 1px |
| Section label | small caps "SUGGESTIONS" (or context-specific section title) |
| Suggestion items | icon + label · optional `⌘⇧A`-style keyboard shortcut hint on right |
| (more sections as needed) | |
| Empty state | When the input has text but no matches: "No results for '<query>'." |

Items are keyboard-navigable: ↑ / ↓ move, Enter activates, Esc dismisses.

### 17.2 Default suggestions (no query)

Out of scope for the app-shell wireframe — the command palette's content schema (which commands appear, search providers, scopes, etc.) is its own wireframe pass. For the implementation pass, use placeholder items:

- **All resources** (icon `Grid`, shortcut `⌘⇧A`) — opens a (TBD) listing.
- **How to get started?** (icon `HelpCircle`) — opens the help panel.

Real commands land in a follow-up. The pattern is what this wireframe pins: input + suggestions + shortcut hints + keyboard navigation.

### 17.3 Responsive

- Desktop: centered modal, 640px wide.
- Tablet: centered modal, ~90vw.
- Mobile: full-screen sheet (no centered modal — finger-target reach matters more than aesthetics).

### 17.4 Out of scope (deferred to a follow-up wireframe)

- Default suggestion set (which commands surface for which routes).
- Search provider architecture (resources / settings / docs / agents / etc.).
- Recent commands persistence.
- Per-section filtering UX.

## 15. Open questions for implementation

1. **Drawer interaction.** Tablet/mobile hamburger opens the drawer how — overlay with backdrop dismiss (click outside), or push-aside (content shifts)? Recommendation: overlay with backdrop dismiss, matches Linear/Datadog.
2. **Sidebar rail hover behavior.** On tablet icon rail, does hovering an icon expand a flyout (Slack-style) or just show a tooltip? Recommendation: tooltip on hover, click to navigate. Drawer for full labels.
3. **Workspace switcher on mobile.** Tapping `webflow-prod ▾` opens a full-screen sheet (mobile pattern) or a regular dropdown? Recommendation: full-screen bottom sheet on mobile — finger-target friendly.
4. **Tables → cards on mobile.** Concrete card anatomy per resource type is a separate wireframe pass (per-surface). Out of scope for the app-shell wireframe.
5. **Notifications panel.** Click `🔔` opens a panel/dropdown of recent notifications. Anatomy of that panel is a separate wireframe.
6. **Help panel.** Click `?` opens what — a keyboard-shortcut sheet, a docs jump list, both? Recommendation: docked panel with shortcuts on top, docs links below.
7. **Account shell on multi-workspace users.** The `← Return to app` link resolves to the most-recently-visited workspace's `/:workspaceSlugOrId/sandboxes`. For users who land on `/account/*` from an external link (email, support) and have not yet visited a workspace this session, fall back to the first workspace in their membership list, alphabetically. Confirm with operator.
8. **Default landing for `/:workspaceSlugOrId` (no resource segment).** Recommend redirect to `/:workspaceSlugOrId/sandboxes` (first nav item).
9. **Default landing for `/account` (no sub-route).** Recommend redirect to `/account/profile`.
10. **Default landing for `/:workspaceSlugOrId/settings` (no sub-route).** Recommend redirect to `/:workspaceSlugOrId/settings/general`.

## 16. What this wireframe does NOT cover

- **Notifications panel anatomy** (its own wireframe in a follow-up).
- **Help panel anatomy** — keyboard shortcuts sheet + docs jumps; deferred.
- **Workspace-settings sub-page anatomies** — General / Team / Sandbox settings / Usage & limits / Danger zone — each has its own per-page wireframe pass (deferred).
- **Account sub-page anatomies** — Profile / Preferences / Billing / Invoices — each has its own per-page wireframe pass (deferred).
- **Drawer animation specs** — motion phase.
- **Specific token values** (hex, font-family, exact font-size) — design-tokens phase.
- **Per-resource page wireframes** — those live in `.intermediate/design/wireframes/<resource>/`.
- **Onboarding / first-workspace-create flow** — separate wireframe; the account shell's "Create your first workspace →" link is the only touchpoint here.
- **Command palette content schema** (commands, search providers, scopes) — see §17.4.

## 18. References

- Pattern: GitHub, Jira, Vercel dashboard, Stripe dashboard (sidebar + topbar combined per guideline §1).
- Lean top-right with notifications + help + small avatar: Linear, Datadog, W&B, Grafana.
- Bi-row mobile topbar (brand+actions / workspace): Vercel mobile, Linear mobile.
- Drawer-from-hamburger on tablet/mobile: Atlassian, Notion, Linear.
- 2-click theme: Linear (avatar → theme sub-menu).
- Workspace-settings shell with sub-sidebar that hides the main nav: Vercel project settings, Stripe workspace settings, Linear workspace settings.
- Account shell that hides workspace context: Linear account settings, Vercel account settings, GitHub user settings, Stripe account settings.

## Provenance

Drafted 2026-06-18 after the operator's spec on responsive behavior. Extended 2026-06-18 with three shell variants (workspace / workspace settings / account) after the operator's spec on dedicated sub-app pages with their own sub-sidebars and on hiding the main workspace sidebar in those sub-shells. Supersedes earlier shell variants explored in `.intermediate/design/mockups/models/shell-proposal.html` (distributed-chrome experiment) and the tri-section identity-menu version. Canonical mockup at [`../mockup/app-shell/index.html`](../mockup/app-shell/index.html) covers the **workspace variant only**; sub-shells are spec-only in this revision and get their own mockup passes when their per-page wireframes land. Account shell return-affordance moved from topbar to sidebar header on 2026-06-18 per operator's directive (← Manage pattern reference). Workspace-settings shell return-affordance moved to sidebar header on 2026-06-18 (symmetric to the account-shell move earlier same day). Sidebar nav icons concretized to lucide-react components on 2026-06-18 per operator's directive — the two-letter fallback is closed. Search moved from top-center zone into the identity cluster as an icon-only `⌘K` palette trigger on 2026-06-18 (top-center zone deleted); command palette anatomy specified in new §17. Avatar-menu theme row collapsed from submenu to inline 3-segment control on 2026-06-18 (1-click apply); hard rule 6 updated. Sidebar icons refined and sub-shell return label changed from dynamic '<workspace name>' to static 'Return to app' on 2026-06-18; tooltip rule clarified to render only in collapsed/rail mode.
