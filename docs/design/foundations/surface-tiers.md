# Surface Tiers

Single source of truth for the platform's neutral surface system. Five layers, two scopes. Every background token decision routes through this doc.

---

## Overview

The platform uses five neutral surface tiers. Workspace is the brightest reading surface in dark mode and pure white in light. Cards are framed regions of the workspace — distinguished by border and shadow, not tonal contrast. Muted strips are the deepest tier, used for sunken sub-sections.

Two scopes govern these tokens:

- **Design system (DS)** — `packages/ui/src/styles/theme.css`. Portable across any consumer that builds its own shell. Chrome-free by design. The three DS surfaces (`bg-background`, `bg-card`, `bg-muted`) assume nothing about the sidebar or topbar.
- **App-local** — `apps/portal/src/app/globals.css @theme`. Shell-specific tokens that are intentionally not part of the DS because they encode portal-specific chrome decisions. Portals built on a different shell structure would override or omit these.

---

## Token reference

| Layer | Token | Scope | Dark | Light |
|---|---|---|---|---|
| Sidebar | `bg-sidebar` | app-local | `#09090A` | `#F9F9F8` |
| Topbar | `bg-topbar` | app-local | `#09090A` | `#F9F9F8` |
| Workspace base | `bg-background` | DS | `#1A1A19` | `#FFFFFF` |
| Card | `bg-card` | DS | `#1A1A1A` | `#FFFFFF` |
| Popover / dropdowns | `bg-popover` | DS | `#131313` | `#FFFFFF` |
| Muted strip | `bg-muted` | DS | `#111111` | `#F0F0EE` |

**Depth order (dark mode, darkest to lightest):** muted `#111111` → popover/dropdowns `#131313` → sidebar/topbar `#09090A` → background `#1A1A19` ≈ card `#1A1A1A`

Note: `bg-card` (`#1A1A1A`) and `bg-background` (`#1A1A19`) differ by a single blue-channel unit in dark mode — perceptually identical. In light mode, `bg-card` (`#FFFFFF`) equals `bg-background` (`#FFFFFF`) exactly. Cards in both modes have **no effective surface delta** — they are framed regions of the workspace. Border and shadow (`shadow-card`) carry the card boundary entirely. The `bg-card` token exists for semantic clarity so consumers can theme it independently if needed, but its default value matches the workspace base. Surface delta between card and workspace is **intentionally near-zero in both modes**. The sidebar and topbar (`#09090A`) remain darker than the workspace — shell chrome recedes behind content, unchanged.

**Contrast vs `--color-foreground` (primary text, approx `#FAFAFA` dark / `#0A0A09` light):**

| Token | Dark mode contrast | Light mode contrast |
|---|---|---|
| `bg-sidebar` | ~18.5:1 | ~17.8:1 |
| `bg-topbar` | ~18.5:1 | ~17.8:1 |
| `bg-background` | ~14.2:1 | ~21:1 |
| `bg-card` | ~14.2:1 (≈ background) | ~21:1 |
| `bg-popover` | ~17.1:1 | ~21:1 |
| `bg-muted` | ~17.8:1 | ~16.5:1 |

All tiers clear WCAG AA (4.5:1) and AAA (7:1) for body text. Verify at implementation time against the actual `--color-foreground` value in theme.css — the contrast ratios above are derived from the hex values and a standard foreground approximation.

---

## Where to use which

| Surface element | Token |
|---|---|
| Sidebar navigation rail | `bg-sidebar` |
| Top navigation bar | `bg-topbar` |
| `<main>`, page content wrapper, error pages, full-page layouts | `bg-background` |
| Cards, panels wrapping tables, section containers | `bg-card` |
| Popovers, dropdowns, dialogs, command palette | `bg-popover` |
| Focused form-field backgrounds, switch raised state | `bg-card` (via `--color-control-raised` → `--surface-popover-dark` in dark) |
| Table `<thead>` band, code blocks, sunken sub-sections, inline metadata strips | `bg-muted` |

**Cards in both modes** have no effective surface color delta against the workspace. `bg-card` (`#1A1A1A`) is perceptually identical to `bg-background` (`#1A1A19`) in dark mode; `bg-card` equals `bg-background` (`#FFFFFF`) exactly in light mode. Border and shadow (`shadow-card`) carry the card boundary in both modes. This is the intentional default — the `bg-card` token exists for semantic clarity, not tonal differentiation.

**Popovers and dialogs** use `bg-popover`, which resolves to `#131313` in dark mode — a slight recess vs the `#1A1A19` workspace that reads as elevation when combined with `shadow-popover`. These are floating surfaces; they must remain visually distinct from the page background.

**Form fields** that are "focused" or "elevated" from the surrounding page use `--color-control-raised`, which points to `--surface-popover-dark` in dark mode for the same reason — the field surface needs a visible sink below the workspace to be legible.

---

## Anti-patterns

**`bg-background` is not chrome.** Never apply it to the sidebar or topbar. Chrome that uses `bg-background` visually merges with the page content, collapsing the shell boundary. The app-local `bg-sidebar` and `bg-topbar` tokens exist precisely to hold a distinct chrome treatment — in dark mode they are darker than the workspace, which is the correct inversion.

**`bg-card` is not for chrome elements.** The sidebar nav items, topbar actions, and breadcrumb rows are not cards. Applying `bg-card` to chrome elements flattens the surface hierarchy — chrome reads as content, and the workspace loses its base-layer role.

**Do not introduce `bg-panel`, `bg-elevated-surface`, or `bg-page`.** These tokens were collapsed in this refactor because they were redundant with `bg-background` and `bg-card`. Recreating them re-introduces the ambiguity the system is solving. If you believe a new tier is needed, surface the specific rendering problem first — do not add a token speculatively.

**Do not use `bg-muted` as a generic section divider.** Muted strips carry a specific semantic: a recessed band inside or adjacent to a card. Using them between two sections of a page (as a horizontal rule substitute) misreads the depth metaphor and flattens the hierarchy.

---

## Why this shape

**DS is chrome-free by design.** `bg-background`, `bg-card`, and `bg-muted` make no assumption about what surrounds them. A consumer that ships a different shell — different sidebar width, a floating topbar, no chrome at all — can import the DS surfaces and build its own shell tokens independently. Baking sidebar and topbar values into the DS would couple the shell decisions to every downstream consumer.

**Symmetric metaphor — framed regions in both modes.** Cards are framed regions of the workspace in light and dark alike. The surface delta between card and workspace is intentionally near-zero in both modes:

- **Light mode:** `bg-card` (`#FFFFFF`) equals `bg-background` (`#FFFFFF`) — identical surface. Border and shadow carry the card boundary entirely.
- **Dark mode:** `bg-card` (`#1A1A1A`) and `bg-background` (`#1A1A19`) differ by a single blue-channel unit — perceptually identical. Border and shadow carry the card boundary entirely. Alpha-on-near-black tonal mixes produce muddy results; a recessed card pocket on a near-black background reads as a defect rather than a clean boundary.

**Floating surfaces (popovers, dropdowns) remain recessed in dark.** `bg-popover` resolves to `#131313` in dark — the old `bg-card` value, now repurposed as the floating-surface primitive. Popovers must be distinguishable from the background they overlay; the slight recess + `shadow-popover` provides that separation without requiring a lift above the workspace. This is a narrow exception to card-flat, documented in `--surface-popover-dark` in `primitive.css`.

**Five tiers, not more.** Blaxel's personality is lean and restrained — Disciplined on the tonal axis, Composed on the structural axis (see `docs/product/personality.md`). A denser tier ladder (six, seven, eight surfaces with fine-grained altitude steps) would be louder than the personality allows. Every additional neutral surface tier is a decision the engineer has to make ("which of these do I use?") and a visual layer the user has to parse. The five-tier system resolves the real distinctions — chrome vs workspace vs card vs sunken — without manufacturing distinctions that have no semantic weight.
