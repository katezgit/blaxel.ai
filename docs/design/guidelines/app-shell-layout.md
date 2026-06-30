# App Shell Layout — Sidebar, Topbar, Content Widths

**Scope:** Project-agnostic guidelines for B2B / enterprise SaaS dashboards. Token values, font choices, and exact colors are NOT here — those live in the implementation spec for each project. When forking this repo, update the project-specific spec but keep this file intact.

**Peer set studied:** Linear, Vercel, Stripe, GitHub, Atlassian (Jira / Confluence), Notion, Ant Design Pro, MUI, Carbon, shadcn dashboard blocks, W&B, Datadog, Grafana.

---

## 1. Decision tree — which shell to use

Start at the top. Use the first match.

```
Does the product have ≥4 top-level destinations
  that users switch between many times per session?
  YES → Left sidebar (primary nav)

Is the product a single-purpose tool with ≤3 top-level destinations,
  or marketing-adjacent (landing, docs, billing-only)?
  YES → Topbar only

Does the product have deep hierarchy (workspace > project > resource)
  AND need a persistent global utility bar (account, search, env switcher)?
  YES → Sidebar + topbar (combined)

Is the primary surface a single document / canvas with peripheral tools?
  YES → Topbar + right inspector (no left sidebar)
```

### Summary

| Shell | Use when | Peer examples |
|---|---|---|
| **Left sidebar only** | Many top-level destinations; nav is the dominant action | Linear, Notion, Slack, VS Code |
| **Topbar only** | ≤3 destinations; marketing-adjacent; or org-level pages | Stripe (top-level), Vercel (marketing) |
| **Sidebar + topbar** | Enterprise SaaS with workspace switcher, search, account in topbar AND deep nav in sidebar | GitHub, Jira, Vercel dashboard, Stripe dashboard |
| **Topbar + right inspector** | Document / canvas tools where the artifact is primary | Figma, Notion (page view), Linear (issue detail) |

**Anti-patterns:**
- Sidebar with <4 entries → use topbar; the sidebar is dead weight.
- Topbar with >7 entries → switch to sidebar; topbar overflows on narrow viewports.
- Sidebar + topbar with duplicate destinations in both → pick one home for each destination.

---

## 2. Widths — the canonical values

All values in `px`. Tailwind utility shown where the value matches a default scale stop.

### Left sidebar (primary nav)

| State | Width | Notes |
|---|---|---|
| **Expanded (default)** | **240–280** (`w-60` to `w-72`) | 256 (`w-64`) is the modal value (Linear, Vercel, Stripe, Ant, shadcn). |
| **Collapsed (icon rail)** | **56–64** (`w-14` to `w-16`) | 56 fits a 40px icon button + 8px gutters. |
| **Wide (file tree / deep hierarchy)** | **280–320** (`w-72` to `w-80`) | Use only when the sidebar contains a tree, not a flat list. |

**Resizable?** Optional. If yes: persist per-user; clamp to [200, 400]. Most products don't bother.

### Topbar

Height is **breakpoint-driven**, not variant-driven. Declare one value per breakpoint explicitly — do not let mobile collapse to `auto` or tablet inherit silently, because sticky layouts below the topbar need a known reserved height at every viewport.

| Breakpoint | Width | Height | Notes |
|---|---|---|---|
| **Desktop** | ≥1024px | **48** (`h-12`) | Dense developer-tools floor (Grafana 48, IBM Carbon 48, shadcn dashboard-01 48). Pairs with a `size-md` (32px) IconButton row: 8px breathing room top + bottom is the tightest value that avoids collision (`docs/design/foundations/header-rhythm.md`). |
| **Tablet** | 768–1023px | **48** | Same value as desktop — no jarring shift at the 1024px breakpoint. Still pointer-driven (iPad in desktop Safari, foldables). WCAG 2.5.8 AA (24×24 minimum) trivially met. |
| **Mobile** | <768px | **56** (`h-14`) | Thumb-operated. WCAG 2.5.5 AAA (44×44 minimum) — a 44px hit area inside a 56px bar with 6px padding meets that target exactly. Matches Vercel / Stripe / Datadog mobile. Must be explicit, never `auto`. |

**Why not one universal value.** A flat 48 fails AAA touch-target on mobile; a flat 56 wastes 8px of vertical content on every desktop and tablet view. The 8px desktop→mobile step matches the persona split: dense laptop sessions benefit from density; on-the-go mobile triage benefits from headroom.

**No tall variant.** The earlier "compact 48 / standard 56 / tall 64–96" tier is retired. 64–96px topbars belong to page section headers and marketing hero zones, not the persistent app-shell topbar. If a project needs breadcrumbs / tabs in the chrome, render them as a *second row* below the topbar (each row still 48 / 56), not by stretching the topbar.

### Main content region (between sidebar and right inspector)

| Pattern | Max width | Use for |
|---|---|---|
| **Standard cap** | **1200–1280** (`max-w-7xl`) | Default for dashboards. Modal value across peer set (Vercel, Stripe, Ant, shadcn, GitHub). |
| **Wide cap** | **1440** | Boards, timelines, Gantt views (Jira). |
| **Fluid (no cap)** | full available width | Data-dense surfaces: tables with many columns, traces, observability, log views. Linear lists, W&B, Datadog, Grafana. |
| **Reading cap (nested inside above)** | **768** (`max-w-3xl`) | Forms, settings panes, long-form docs. Apply as an *inner* cap, not as the page cap. |

**Cap value: `1536px`, declared as `--page-max-width` in app-level globals.** The token name is the source of truth; references in markup use the utility class below.

**Centering:** center the content region inside its container (`mx-auto`) so the cap behaves predictably on ultrawide monitors. Do not left-align against the sidebar — text drifts away from the user's cursor as viewport widens.

**Implementation:** Wrap page content in a container with a `page-shell` utility class. `page-shell` packs the centered cap + responsive horizontal padding ladder + default `gap-8 py-6` vertical layout. Pages override `gap-` / `py-` / `pt-` as needed by appending Tailwind utilities.

**Padding ladder inside `page-shell`:**

| Breakpoint | Horizontal padding | Note |
|---|---|---|
| default (`<768px`) | `px-4` (16px) | |
| `md` (768px+) | `px-6` (24px) | |
| `lg` (1024px+) | `px-8` (32px) | |
| `xl` (1280px+) | `px-20` (80px) | |

These values are baked into `page-shell`'s internal media queries — do not list the responsive Tailwind classes on each wrapper directly.

**Where the utility lives:** app-level globals, not your shared design-system package. `page-shell` is app chrome — design-system primitives have no opinion on page layout.

**Sticky-header carve-out pattern** (for pages with a sticky filter/toolbar row):

```jsx
{/* Outer: full-height scroll region, no padding */}
<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
  {/* Sticky header: inherits page-shell horizontal padding but no vertical */}
  <div className="page-shell sticky top-0 z-10 py-0 border-b">
    <FilterBar />
  </div>
  {/* Body: page-shell with override for top padding already consumed above */}
  <div className="page-shell flex-1 overflow-y-auto pt-4">
    <ContentGrid />
  </div>
</div>
```

The `py-0` / `pt-4` appended utilities show the override pattern — append after `page-shell`, never replace it.

### Right inspector / content sidebar

| State | Width | Notes |
|---|---|---|
| **Standard** | **320–400** (`w-80` to `w-96`) | Properties panel, filters, activity feed. |
| **Wide** | **480–560** | Issue detail, document inspector with rich content. |
| **Drawer (overlay, modal)** | **400–720** | Slide-over from right; up to 720 for editing-heavy flows. Atlassian-style. |

**Resizable?** Common for inspectors. Persist per-user; clamp to [280, 600].

---

## 3. Combined layouts — total width math

Use these to sanity-check that the shell fits at common breakpoints.

| Layout | Sidebar | Content cap | Inspector | Min viewport |
|---|---|---|---|---|
| Sidebar + content | 256 | 1280 | — | 1536 |
| Sidebar + content + inspector | 256 | 1024 | 360 | 1640 |
| Sidebar + topbar + content | 256 | 1280 | — | 1536 (same; topbar steals height not width) |
| Sidebar + content (fluid) | 256 | — | — | 1024 (sidebar collapses below this) |

**Collapse rules:**
- Below **1024px**: collapse left sidebar to icon rail OR hide behind a hamburger.
- Below **768px**: hide sidebar entirely; switch to topbar + mobile drawer.
- Below **640px**: collapse right inspector behind a tab/drawer.

---

## 4. Density — when to tighten

Default values above target a 14px base font and standard density. For data-dense surfaces (telemetry, log views, dense tables):

- Sidebar: same width (240–280).
- Topbar: drop to compact (48).
- Content padding: 16 horizontal, 16 vertical.
- Content cap: fluid.
- Inspector: same width (320–400).

Do not narrow the sidebar to gain content width — users perceive narrower nav as "less product," and the saved pixels rarely matter at the content cap.

---

## 5. Quick reference — picking a width fast

| Question | Answer |
|---|---|
| Sidebar width? | **256** unless deep tree (then 280–320) |
| Sidebar collapsed? | **56–64** |
| Topbar height? | **48** desktop + tablet · **56** mobile (≥1024 / 768–1023 / <768) |
| Content cap on dashboards? | **1536px** — token `--page-max-width`, utility `page-shell` |
| Content cap on tables / traces? | **Fluid** |
| Content cap on forms / settings? | **768** (`max-w-3xl`) nested inside the dashboard cap |
| Horizontal padding ladder? | 16 / 24 / 32 / 80 (default / md / lg / xl) — baked into `page-shell`; do not list responsive classes on wrappers directly |
| Right inspector width? | **360** standard, **480–560** for rich detail |
| When to use sidebar + topbar? | Enterprise SaaS with workspace switcher in topbar + deep nav in sidebar |
| When to drop the sidebar? | ≤3 destinations, or single-canvas tools |

---

## 6. Anti-patterns

- **Stretching content to full viewport on ultrawide monitors.** Line lengths exceed 120 characters; forms become unscannable. Cap at 1280 and center.
- **Applying the form cap (640) at the page level.** Wastes screen real estate; tables and dashboards need the 1280 container with the form cap nested inside.
- **Mixing fluid and capped content within the same screen without a clear hierarchy.** Pick one; nest the other.
- **Narrowing the sidebar to <200px to "save space."** Truncates labels; users misclick. If you need more content width, collapse the sidebar entirely (icon rail).
- **Topbar taller than 56px on desktop.** Wastes vertical space on laptop screens. Multi-row chrome (breadcrumbs / tabs) renders as additional 48px rows below the topbar, not a stretched single row.
- **`--topbar-h: auto` at mobile.** Sticky layouts below the topbar (filter bars, sub-headers) need a known reserved height to compute scroll offsets; `auto` makes that height content-dependent and unstable across routes.
- **Right inspector wider than the main content.** Reverses the visual hierarchy; the inspector should always be secondary.

---

## 7. References

- Linear — sidebar 240, content fluid (lists) / ~1024 (settings)
- Vercel dashboard — sidebar 256, content 1200 (`max-w-screen-xl`)
- Stripe dashboard — sidebar 240, content ~1200
- GitHub — sidebar ~296 (repo nav), content 1280 (`xl` container)
- Ant Design Pro — sidebar 256, content 1200
- shadcn dashboard blocks — sidebar 256, content 1280 (`max-w-7xl`)
- Atlassian (Jira / Confluence) — sidebar 240–280, content 1440 (boards) / ~1024 (issue view)
- Notion — sidebar 240, page content 708 default
- MUI / Carbon — drawer 240–256, content fluid (recommend ≤1440)
- W&B / Datadog / Grafana — sidebar 240, content fluid (dense telemetry)
