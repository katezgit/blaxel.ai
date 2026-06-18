# App Shell — wireframe (canonical)

**Status:** canonical · promoted 2026-06-18 from `.intermediate/design/wireframes/app-shell/`.

**Anchors:**
- [`docs/design/guidelines/app-shell-layout.md`](../guidelines/app-shell-layout.md) — decision-tree branch 3 (sidebar + topbar combined).
- [`.intermediate/design/ia/proposal-v1.md`](../../../.intermediate/design/ia/proposal-v1.md) — IA scopes (Personal / Account / Workspace).
- [`docs/product/personas.md`](../../product/personas.md) — Alex (primary persona), Sam (sanity gate).
- [`docs/product/alex-workflow.md`](../../product/alex-workflow.md) — Phase 4 is load-bearing (drive + observe).

**Mockup:** [`./mockup/index.html`](./mockup/index.html) — interactive reference; resize the browser to verify breakpoint behavior.

---

## 1. Canonical zones

Five zones, fixed responsibilities. Same pattern across every breakpoint — only collapse rules differ.

| Zone | Role | Holds |
|---|---|---|
| **Top-left** | Workspace context | Brand · workspace switcher (dropdown: Switch · Create · Workspace settings →) |
| **Top-center** | Search | Cmd-K palette trigger (visible input on desktop; collapses to icon on mobile would lose discoverability — keep visible) |
| **Top-right** | Identity utility | Notifications bell · Help (?) · Avatar (Personal scope, focused menu) |
| **Left sidebar** | Workspace resources | Sandboxes / Hosting / Security groups |
| **Main content** | Page | Selected resource / page (breadcrumb stack + title + actions + content bands) |

## 2. Hard rules

These are non-negotiable across every breakpoint and every page.

1. **Workspace context is never hidden.** The workspace switcher is visible at every breakpoint. Workspace is the operational boundary, not navigation decoration.
2. **Search collapses AFTER nav, not before workspace.** Responsive priority: workspace → page identity → primary action → search → identity-cluster. Sidebar labels collapse first; sidebar shape collapses second; workspace collapses never.
3. **Sidebar labels collapse before sidebar disappears.** Progression: 248 → 220 → 64 (icon rail) → 0 (drawer). Avoid jumping from full sidebar to no sidebar.
4. **Page actions remain visible.** Primary action (e.g., `Open Playground`) stays in the title row on desktop; stacks vertically on mobile with primary at top.
5. **Tier badge lives with Account, not Workspace.** Tier is account-scoped — appears inside the avatar menu's Account header, never on the workspace switcher chip.
6. **Theme is reachable in ≤2 clicks.** Avatar → Theme (sub-menu) → option.
7. **Workspace settings has one home.** Top-left workspace switcher dropdown. NOT also in the avatar menu.
8. **Single avatar.** No double-identity-zone conflation. The top-right avatar is the only user-shaped affordance.

## 3. Desktop wide (≥1280px) — default

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ ⌂ Blaxel  webflow-prod ▾          🔍 Search Sandboxes, Models…  ⌘K     🔔3  ?  k    │  64px topbar
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
- Search input: ~360px in the optical center
- Content padding: 32px
- Grids: 3-col where applicable

## 4. Desktop compact (1024–1279px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ⌂ Blaxel  webflow-prod ▾    🔍 Search workspace… ⌘K    🔔3  ?  k         │  64px
├──────────────┬───────────────────────────────────────────────────────────┤
│ SANDBOXES    │                                                            │
│   Sandboxes  │  (same shell, tighter spacing)                             │
│   …          │                                                            │
└──────────────┴───────────────────────────────────────────────────────────┘
   220px           main content, padding 28px
```

**Changes from wide:**
- Sidebar: 220px (full labels still visible)
- Search input: ~320px
- Content padding: 28px
- Card grids: 3-col → 2-col
- Sidebar does NOT collapse yet — users still operating at this width

## 5. Tablet (768–1023px) — icon rail + hamburger

```
┌─────────────────────────────────────────────────────────────┐
│ ☰  ⌂ Blaxel  webflow-prod ▾  🔍 Search ⌘K     🔔3  ?  k     │  64px
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

**Changes from compact:**
- Sidebar: 64px icon rail (labels hidden, group labels hidden, icons centered)
- **Hamburger trigger (`☰`) appears in topbar-left** — opens a drawer with full labels
- Workspace switcher stays in topbar (not collapsed)
- Search input: ~240px (placeholder shortens)
- Group dividers replace text labels in sidebar
- Tooltip on hover shows full label for each rail icon

**Drawer (opened from `☰`):**
- Slides in from the left, overlays main content
- Width: 280px
- Contents: full nav with labels + group headers (same as wide sidebar)
- Dismiss: click outside, Esc, or click `☰` again
- The icon rail stays visible behind the drawer

## 6. Mobile (<768px)

```
┌──────────────────────────────────────┐
│ ☰  ⌂ Blaxel             🔔3  ?  k    │  row 1: brand + identity
│ webflow-prod ▾                       │  row 2: workspace (full width)
│ 🔍 Search workspace…  ⌘K            │  row 3: search (full width)
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
- Topbar wraps to **3 rows**:
  - Row 1: hamburger · brand · identity-cluster (🔔 ? avatar)
  - Row 2: workspace switcher full-width
  - Row 3: search full-width
- Workspace remains visible at top
- Page actions stack vertically; primary on top, secondary below
- Metric cells stack 1-col (no horizontal grid)
- Tables collapse to **cards** (key data per row in a card; horizontal scroll forbidden for primary data)
- Content padding: 16px
- Demo annotations (red callouts) hidden on mobile — they overlap awkwardly

## 7. CSS variable map

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
  /* + topbar grid to 3-row, hide sidebar, stack page-actions */
}
```

## 8. Responsive priority — what collapses, in order

From least likely to disappear → most likely to disappear:

1. **Workspace switcher** — never disappears, only changes position (top-left → its own row on mobile)
2. **Page identity** (breadcrumb + title + state pill) — always visible
3. **Primary action** (e.g., Open Playground) — always visible, may resize / stack
4. **Search input** — visible at every breakpoint; resizes (full → 320 → 240 → full-width on its own row)
5. **Identity cluster** (🔔 ? avatar) — visible at every breakpoint; never collapses
6. **Sidebar labels + group headers** — collapse first at tablet
7. **Sidebar shape** — collapses next (full → rail → hidden)
8. **Secondary actions** (Rotate, More) — present on desktop; stack below primary on mobile
9. **Demo annotations / popovers** — hidden on mobile

## 9. Avatar menu (Personal scope, focused)

Five interactive items + theme sub-menu. Workspace settings NOT here.

```
👤 katexuzy@gmail.com
   Account · Tier 1
─────────────────────
Profile
Theme            ● Dark ▸   ← sub-menu: Light / Dark / System
─────────────────────
Account settings    →       ← deep-link to /settings/account sub-app
─────────────────────
Help & shortcuts   ?
Log out
```

Theme reachable in 2 clicks (avatar → theme option). Account settings opens a dedicated `/settings/account` sub-app with its own internal sub-sidebar (Personal / Account sections — Workspace's settings live in its own switcher dropdown).

## 10. Sidebar nav items — icon vocabulary

Two-letter lowercase icons used in icon-rail mode. Active item highlighted via accent token.

| Group | Item | Icon (rail) | Icon (label-visible) |
|---|---|---|---|
| Sandboxes | Sandboxes | `sb` | none |
| Sandboxes | Volumes | `vl` | none |
| Sandboxes | Agent Drive | `dr` | none |
| Sandboxes | Images | `im` | none |
| Hosting | Agents | `ag` | none |
| Hosting | Jobs | `jb` | none |
| Hosting | MCP Servers | `mc` | none |
| Hosting | Model APIs | `md` | none |
| Hosting | Network | `nt` | none |
| Hosting | Custom Domains | `cd` | none |
| Security | API Keys | `ak` | none |
| Security | Policies | `po` | none |

Icons are visible at every breakpoint (left of label in full sidebar; centered in rail). Two-letter abbreviations chosen for distinguishability — single-letter would collide (e.g., Agents/Agent Drive both start with A).

Future: swap two-letter abbreviations for SVG icons in design-tokens phase. The DOM structure (`<span class="nav-icon">…</span><span class="nav-label">…</span>`) accommodates either.

## 11. Open questions for implementation

1. **Drawer interaction.** Tablet/mobile hamburger opens the drawer how — overlay with backdrop dismiss (click outside), or push-aside (content shifts)? Recommendation: overlay with backdrop dismiss, matches Linear/Datadog.
2. **Sidebar rail hover behavior.** On tablet icon rail, does hovering an icon expand a flyout (Slack-style) or just show a tooltip? Recommendation: tooltip on hover, click to navigate. Drawer for full labels.
3. **Search behavior on mobile.** Tapping the search input opens the Cmd-K palette modal? Or focuses an inline input? Recommendation: opens the full Cmd-K palette as a modal — same behavior as desktop ⌘K.
4. **Workspace switcher on mobile.** Tapping `webflow-prod ▾` opens a full-screen sheet (mobile pattern) or a regular dropdown? Recommendation: full-screen bottom sheet on mobile — finger-target friendly.
5. **Tables → cards on mobile.** Concrete card anatomy per resource type is a separate wireframe pass (per-surface). Out of scope for the app-shell wireframe.
6. **Notifications panel.** Click `🔔` opens a panel/dropdown of recent notifications. Anatomy of that panel is a separate wireframe.
7. **Help panel.** Click `?` opens what — a keyboard-shortcut sheet, a docs jump list, both? Recommendation: docked panel with shortcuts on top, docs links below.

## 12. What this wireframe does NOT cover

- **Notifications panel anatomy** (its own wireframe in a follow-up).
- **Settings sub-app anatomy** — `/settings/account` and `/settings/personal` have their own sub-sidebar wireframes; deferred.
- **Help panel anatomy** — keyboard shortcuts sheet + docs jumps; deferred.
- **Drawer animation specs** — motion phase.
- **Specific token values** (hex, font-family, exact font-size) — design-tokens phase.
- **Per-resource page wireframes** — those live in `.intermediate/design/wireframes/models/`, `…/agents/`, etc.

## 13. References

- Pattern: GitHub, Jira, Vercel dashboard, Stripe dashboard (sidebar + topbar combined per guideline §1).
- Lean top-right with notifications + help + small avatar: Linear, Datadog, W&B, Grafana.
- Tri-row mobile topbar (brand+actions / workspace / search): Vercel mobile, Linear mobile.
- Drawer-from-hamburger on tablet/mobile: Atlassian, Notion, Linear.
- 2-click theme: Linear (avatar → theme sub-menu).

## Provenance

Drafted 2026-06-18 after the operator's spec on responsive behavior. Supersedes earlier shell variants explored in `.intermediate/design/mockups/models/shell-proposal.html` (distributed-chrome experiment) and the tri-section identity-menu version. Canonical mockup co-located at [`./mockup/index.html`](./mockup/index.html).
