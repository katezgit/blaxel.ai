# Surface Tiers

Single source of truth for the platform's neutral surface system. Five layers, two scopes. Every background token decision routes through this doc.

---

## Overview

The platform uses five neutral surface tiers. They are ordered by visual depth — workspace is the brightest surface in both modes; each tier below it recesses further into shadow. The mental model is wells cut into a desk, not cards floating above one. Cards are darker than the workspace they sit on; muted strips are darker still inside the card.

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
| Card / popover | `bg-card` | DS | `#131313` | `#F7F7F5` |
| Muted strip | `bg-muted` | DS | `#111111` | `#F0F0EE` |

**Depth order (dark mode, darkest to lightest):** muted `#111111` → card `#131313` → sidebar/topbar `#09090A` → background `#1A1A19`

Wait — sidebar and topbar (`#09090A`) are darker than card (`#131313`) in dark mode. That is intentional: shell chrome recedes behind the workspace. The workspace (`bg-background`, `#1A1A19`) is the brightest tier because it is the primary reading surface. Card and muted sit below it to create the recessed-well effect.

**Contrast vs `--color-foreground` (primary text, approx `#FAFAFA` dark / `#0A0A09` light):**

| Token | Dark mode contrast | Light mode contrast |
|---|---|---|
| `bg-sidebar` | ~18.5:1 | ~17.8:1 |
| `bg-topbar` | ~18.5:1 | ~17.8:1 |
| `bg-background` | ~14.2:1 | ~21:1 |
| `bg-card` | ~17.1:1 | ~19.3:1 |
| `bg-muted` | ~17.8:1 | ~16.5:1 |

All tiers clear WCAG AA (4.5:1) and AAA (7:1) for body text. Verify at implementation time against the actual `--color-foreground` value in theme.css — the contrast ratios above are derived from the hex values and a standard foreground approximation.

---

## Where to use which

| Surface element | Token |
|---|---|
| Sidebar navigation rail | `bg-sidebar` |
| Top navigation bar | `bg-topbar` |
| `<main>`, page content wrapper, error pages, full-page layouts | `bg-background` |
| Cards, popovers, dialogs, command palette, focused form-field backgrounds | `bg-card` |
| Table `<thead>` band, code blocks, sunken sub-sections, inline metadata strips | `bg-muted` |

**Modals and dialogs** use `bg-card`, not `bg-background`. They sit above the workspace — physically in the DOM, semantically as a layer the user has entered — and `bg-card` makes that layer boundary visible.

**Form fields** that are "focused" or "elevated" from the surrounding page use `bg-card`. Fields that sit inside a card (the common case) do not add another background layer — they inherit or use a border to delineate.

---

## Anti-patterns

**`bg-background` is not chrome.** Never apply it to the sidebar or topbar. Chrome that uses `bg-background` visually merges with the page content, collapsing the shell boundary. The app-local `bg-sidebar` and `bg-topbar` tokens exist precisely to hold a distinct chrome treatment — in dark mode they are darker than the workspace, which is the correct inversion.

**`bg-card` is not for chrome elements.** The sidebar nav items, topbar actions, and breadcrumb rows are not cards. Applying `bg-card` to chrome elements flattens the surface hierarchy — chrome reads as content, and the workspace loses its base-layer role.

**Do not introduce `bg-panel`, `bg-elevated-surface`, or `bg-page`.** These tokens were collapsed in this refactor because they were redundant with `bg-background` and `bg-card`. Recreating them re-introduces the ambiguity the system is solving. If you believe a new tier is needed, surface the specific rendering problem first — do not add a token speculatively.

**Do not use `bg-muted` as a generic section divider.** Muted strips carry a specific semantic: a recessed band inside or adjacent to a card. Using them between two sections of a page (as a horizontal rule substitute) misreads the depth metaphor and flattens the hierarchy.

---

## Why this shape

**DS is chrome-free by design.** `bg-background`, `bg-card`, and `bg-muted` make no assumption about what surrounds them. A consumer that ships a different shell — different sidebar width, a floating topbar, no chrome at all — can import the DS surfaces and build its own shell tokens independently. Baking sidebar and topbar values into the DS would couple the shell decisions to every downstream consumer.

**Recessed metaphor, not lifted.** Conventional elevation systems treat cards as objects floating above a base: the card is lighter than the background in light mode, higher z, shadow increasing with altitude. This platform inverts the metaphor: cards are wells. The workspace is the desk; cards are pockets cut into it. The card is slightly off-white (light) or slightly darker (dark) relative to the bright workspace beneath. This keeps the workspace dominant — it is the reading surface — and makes card boundaries legible through depth, not shadow accumulation. Shadow and border reinforce the boundary; they do not carry it alone.

**Five tiers, not more.** Blaxel's personality is lean and restrained — Disciplined on the tonal axis, Composed on the structural axis (see `docs/product/personality.md`). A denser tier ladder (six, seven, eight surfaces with fine-grained altitude steps) would be louder than the personality allows. Every additional neutral surface tier is a decision the engineer has to make ("which of these do I use?") and a visual layer the user has to parse. The five-tier system resolves the real distinctions — chrome vs workspace vs card vs sunken — without manufacturing distinctions that have no semantic weight.
