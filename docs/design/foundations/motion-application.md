# Motion Application Spec

_Companion to `motion.md` (foundation). This file is the per-touchpoint work order for engineers.
All token references resolve to values defined in `motion.md` → `primitive.css` / `theme.css`.
No new tokens are introduced here._

_Owner map: rows marked `[DSA]` → `design-system-architect` (`packages/ui/**`);
rows marked `[SFE]` → `staff-frontend-engineer` (`apps/portal/**`)._

_Swift recalibration (2026-06-28): `--motion-exit` value changed from `var(--duration-fast)
var(--ease-in-accelerated)` (120ms) to `var(--duration-instant) var(--ease-in-accelerated)` (80ms).
All entries that reference `--motion-exit` are affected. Entries not referencing `--motion-exit`
are unaffected; each is explicitly marked Swift-compliant or Swift-flagged below._

---

## How to read this table

- **Catalog ref** — file:line from `.intermediate/discovery/motion-audit/catalog.md`
- **Action** — what the engineer must do (add / tune / remove)
- **Declaration** — the exact CSS property value to apply, using token names
- **Reduced-motion** — what happens automatically (token collapse) or what the engineer must add

Entries are grouped by owner so each engineer can scan their slice without cross-referencing.

---

## Group A — `design-system-architect` owns (`packages/ui/**`)

### A1 — Button hover color transition (all variants)

**Catalog ref:** `packages/ui/src/components/button.tsx:16-86` · verdict: motion-subtle  
**Action:** Add `transition-colors` with `--motion-state-change` to all button variant hover states. Currently no transition is set; color shifts snap.

**Declaration:**
```
transition: background-color var(--motion-state-change),
            color            var(--motion-state-change),
            border-color     var(--motion-state-change);
```

**What this covers:** primary, secondary, ghost, destructive, and destructive-ghost variants. All use color-only hover changes; no spatial motion is needed.

**Swift compliance:** UNCHANGED — color transition completes in 120ms, within the Swift ceiling. No exit motion involved.

**Reduced-motion:** Handled automatically — `--duration-fast` collapses to 0ms. No extra work.

---

### A2 — Tooltip appear/disappear

**Catalog ref:** `packages/ui/src/components/tooltip.tsx` · verdict: motion-subtle  
**Action:** Verify Radix Tooltip default enter/exit is using `--motion-state-change` or equivalent. If no duration is applied, add:

**Declaration (enter):**
```
animation: var(--animate-fade-in);
```
**Declaration (exit):**
```
animation: var(--animate-fade-out);
```

**No translate on tooltips.** Tooltips anchor to the trigger element and appear in place — they must not slide. Fade only.

**Swift compliance:** CHANGED (token cascade) — `--animate-fade-out` references `--motion-exit`, which now resolves to 80ms. Tooltip dismissal becomes faster without any code change in `tooltip.tsx`. This is correct: a tooltip disappearing faster clears visual noise without any perceptibility concern (tooltips are informational, not interactive, so the user is never mid-reading when hover ends). No code action required beyond the `--motion-exit` value change in `primitive.css` / `theme.css`.

**Reduced-motion:** Token collapse handles it.

---

### A3 — Popover item hover background

**Catalog ref:** `packages/ui/src/components/popover.tsx:146-164` · verdict: motion-subtle  
**Action:** Confirm `transition-colors` uses `--motion-state-change`. The catalog notes no explicit duration is set. Add if missing:

**Declaration:**
```
transition: background-color var(--motion-state-change);
```

**Swift compliance:** UNCHANGED — popover item hover is a pure color shift at 120ms, within the Swift ceiling.

**Reduced-motion:** Token collapse handles it.

---

### A4 — Badge state color transition

**Catalog ref:** `packages/ui/src/components/badge.tsx` · verdict: motion-subtle  
**Action:** Confirm badge color transitions use `--motion-state-change`. If not set, add:

**Declaration:**
```
transition: background-color var(--motion-state-change),
            color            var(--motion-state-change);
```

**Scope note:** This covers semantic state badges only (Sandbox warm/cold/errored, Job outcome, etc.). It does NOT animate the state value itself — the color change acknowledges that the state changed. The state snap is intentional; only the color acknowledgment transitions.

**Swift compliance:** UNCHANGED — badge color acknowledgment at 120ms is within the Swift ceiling. Note: the badge does NOT use `--motion-exit` (there is no badge dismiss); the Swift recalibration does not affect this entry.

**Reduced-motion:** Token collapse handles it — badge snaps to new color at 0ms, which is identical to the current behavior.

---

### A5 — Checkbox check-mark appear

**Catalog ref:** `packages/ui/src/components/checkbox.tsx` · verdict: motion-subtle  
**Action:** Confirm Radix Checkbox check-mark render uses `--duration-fast` or faster. If Radix's internal animation is on a raw ms value, override:

**Declaration:**
```
transition: opacity var(--motion-state-change);
```

Applied to the check indicator element. Check-mark should appear in 120ms, not instantly and not slower.

**Swift compliance:** UNCHANGED — check-mark appear at 120ms is within the Swift ceiling. No exit motion on checkboxes.

**Reduced-motion:** Token collapse handles it.

---

### A6 — Form field focus lift

**Catalog ref:** `packages/ui/src/components/input.tsx:39-87` · verdict: motion-subtle  
**Action:** Verify focus-ring transition. The catalog notes focus is instant (no transition class). The focus ring (`box-shadow`) should transition to avoid a jarring flash on keyboard navigation:

**Declaration:**
```
transition: box-shadow var(--motion-state-change),
            background-color var(--motion-state-change);
```

**Do not add duration to the focus ring appearance itself** — keyboard users rely on instant visual confirmation that focus landed. Apply `--motion-state-change` (120ms) only, never `--motion-enter`. If 120ms feels laggy in testing, drop to `--duration-instant` (80ms).

**Swift compliance:** UNCHANGED — focus ring at 120ms is within the Swift ceiling. Focus ring is a keyboard-navigation aid, not an action affordance onset; the ring appears as the user lands on the control.

**Reduced-motion:** Token collapse handles it.

---

### A7 — Dialog close button hover

**Catalog ref:** `packages/ui/src/components/dialog.tsx:155-176` · verdict: motion-subtle  
**Current behavior:** `transition-colors prop-(--motion-state-change)` — this is already applied.  
**Action:** VERIFY that `prop-(--motion-state-change)` resolves correctly in the Tailwind v4 utility chain. If it resolves to `transition-colors` with `var(--motion-state-change)`, no change needed. If it does not resolve or uses a raw value, normalize to:

**Declaration:**
```
transition: background-color var(--motion-state-change);
```

**Swift compliance:** UNCHANGED — dialog close button hover is a color-only state change at `--motion-state-change` (120ms). No exit motion.

**Reduced-motion:** Token collapse handles it.

---

### A8 — Drawer scroll border reveal (DrawerHeader)

**Catalog ref:** `packages/ui/src/components/drawer.tsx` · verdict: motion-subtle  
**Action:** Confirm `DrawerHeader` follows the same scroll-border pattern as `DialogHeader` (catalog lines 184-204). If the pattern is not applied to `DrawerHeader`, add:

**Declaration:**
```
transition: border-color var(--motion-state-change),
            box-shadow   var(--motion-state-change);
```

On the `scrolled` state toggle (same `useScrolled` hook pattern as dialog). Border reveals from `border-transparent` to `border-border` with shadow `shadow-scroll-cue`.

**Swift compliance:** UNCHANGED — scroll border reveal is triggered by scroll position, not by a user signal seeking an action affordance. The border transition at 120ms acknowledges the scroll state; it does not gate any action. No exit motion involved.

**Reduced-motion:** Token collapse handles it — the border/shadow snap appears at frame 0, which is fine (the scroll position is still communicated by the border presence).

---

### A9 — Remove `copy-confirm-pulse` keyframe

**Catalog ref:** `packages/ui/src/styles/primitive.css:273-280` · anti-pattern  
**Action (two steps):**

1. In `packages/ui/src/components/code-block.tsx`: remove the `copy-confirm-pulse` animation reference. Replace with a CSS class applied on `copied` state that sets `color: var(--color-state-scored-text)` with no animation. The icon swap (CopyIcon → CheckIcon) already happens via React state — no additional motion needed.

2. In `packages/ui/src/styles/primitive.css`: delete the `@keyframes copy-confirm-pulse` block (lines 276–280) and the TODO comment above it (lines 273–275). Also remove `--animate-copy-confirm-pulse` from `@theme inline` in `theme.css` if it exists (check before deleting).

**Swift compliance:** UNCHANGED — the replacement (icon swap + color) is instant, zero duration. Well within Swift ceiling.

**Reduced-motion:** N/A — the replacement has no animation.

---

### A10 — Segmented control state change

**Catalog ref:** `packages/ui/src/components/segmented-control.tsx` · verdict: motion-subtle  
**Action:** Confirm indicator slide and text color transition use `--motion-state-change` (same pattern as tabs). If tabs and segmented-control share a component or the same `useSlideIndicator` hook, this may already be covered. Verify; add if missing:

**Declaration (indicator):**
```
transition: transform var(--motion-state-change),
            width     var(--motion-state-change);
```
**Declaration (text):**
```
transition: color var(--motion-state-change);
```

**Swift compliance:** UNCHANGED — indicator slide and text color change at `--motion-state-change` (120ms), within Swift ceiling. No exit motion.

**Reduced-motion:** Token collapse handles it.

---

### A11 — Progress bar fill

**Catalog ref:** `packages/ui/src/components/progress.tsx` · verdict: motion-subtle  
**Action:** Confirm progress bar fill width transition uses a token. If it uses a raw ms value or no transition, normalize to:

**Declaration (determinate):**
```
transition: width var(--motion-state-change);
```
**Declaration (indeterminate / loop):**
```
animation: var(--animate-shimmer);
```
_(Indeterminate progress reuses shimmer keyframe — same "ongoing process" semantic.)_

**Swift compliance:** UNCHANGED — progress bar fill transition at `--motion-state-change` (120ms) is within the Swift ceiling. The progress bar itself communicates ongoing process (indeterminate) or completion (determinate); it is not the action affordance. No exit motion involved.

**Reduced-motion:** Token collapse handles determinate. Indeterminate loop: `--motion-continuous` → `none` suppresses shimmer; render a static filled bar at an intermediate width (e.g., 40%) or a static color block to communicate "loading" without motion.

---

## Group B — `staff-frontend-engineer` owns (`apps/portal/**`)

### B1 — Sidebar workspace rail collapse/expand

**Catalog ref:** `apps/portal/src/components/shell/unified-shell.tsx:99-127` · verdict: motion-needed  
**Action:** Add CSS transition to the `[--shell-left-w]` CSS custom property change so the sidebar width animates instead of snapping.

**Declaration (on the sidebar container element or the CSS var itself via transition):**
```
transition: width var(--motion-enter);   /* collapse AND expand — symmetric */
```

Use `--motion-enter` (`var(--duration-base) var(--ease-out-emphasized)` = 220ms emphasized) in **both directions**. The sidebar is a structural-continuity surface — see "Surface-class taxonomy" section below. It reshapes layout rather than vanishing. The Swift exit cascade (80ms `--motion-exit`) does NOT apply here; it applies to dismissal surfaces (dialog, popover, menu, tooltip, drawer) that vanish from the viewport entirely. A sidebar that collapses asymmetrically at 80ms while expanding at 220ms felt abrupt in testing (operator report, 2026-06-28) — the asymmetry was a misclassification, not a design intent.

**Surface class:** STRUCTURAL-CONTINUITY (Perpetual axis) — symmetric `--motion-enter` both directions.  
**Swift compliance:** EXCEPTION — Swift exit cascade does not apply. See "Surface-class taxonomy" below.

If `[--shell-left-w]` is driven by a CSS custom property rather than a `width` property directly, the transition must be applied to `width` on the element that visually resizes. Verify the architecture before implementation — CSS custom property transitions require `@property` registration or a computed `width` to be transitionable.

**Reduced-motion:** Token collapse handles it (duration → 0ms). Sidebar snaps to new width, which is the correct fallback.

---

### B2 — Sub-pane sidebar collapse/expand (settings rail)

**Catalog ref:** `apps/portal/src/components/shell/unified-shell.tsx:107-127` · verdict: motion-needed  
**Action:** Same pattern as B1 — same CSS var mechanism, same transition declaration. Verify both the workspace rail (B1) and settings sub-pane rail share the same CSS transition rule so they feel identical on toggle.

**Declaration:** Identical to B1 — `transition: width var(--motion-enter)` in both collapse and expand directions. Symmetric.

**Surface class:** STRUCTURAL-CONTINUITY (Perpetual axis) — same classification as B1.  
**Swift compliance:** EXCEPTION — Swift exit cascade does not apply (same rationale as B1).

**Reduced-motion:** Token collapse handles it.

---

### B3 — Sidebar nav link hover color

**Catalog ref:** `apps/portal/src/components/shell/sidebar-nav-link.tsx:29-71` · verdict: motion-subtle  
**Action:** The `.sidebar-row-hover` class does a color shift from `text-muted-foreground` to `text-foreground` with no transition. Add:

**Declaration:**
```
transition: color            var(--motion-state-change),
            background-color var(--motion-state-change);
```

Use `--duration-instant` (80ms) rather than the default `--duration-fast` (120ms) if testing reveals that 120ms creates perceptible lag when the user scans the sidebar quickly. Dense navigation items benefit from the faster instant-tier.

Revised declaration if instant is preferred:
```
transition: color            var(--duration-instant) var(--ease-out-standard),
            background-color var(--duration-instant) var(--ease-out-standard);
```

**Swift compliance:** UNCHANGED — sidebar nav hover color at `--duration-instant` (80ms) or `--duration-fast` (120ms), both within Swift ceiling. No exit motion on the hover highlight itself.

**Reduced-motion:** Token collapse handles either duration.

---

### B4 — Theme switcher menu fade

**Catalog ref:** `apps/portal/src/components/shell/theme-switcher.tsx` · verdict: motion-subtle  
**Action:** Confirm Radix DropdownMenu used here applies `fade-in` / `fade-out` on open/close. No translate — secondary preference menus appear in place. If Radix defaults include a slide that feels out of place for a small menu, scope it to fade-only:

**Declaration (open):**
```
animation: var(--animate-fade-in);
```
**Declaration (close):**
```
animation: var(--animate-fade-out);
```

**Swift compliance:** CHANGED (token cascade) — `--animate-fade-out` references `--motion-exit`, which now resolves to 80ms. Theme switcher menu dismissal becomes faster without code changes to the menu component itself. The user dismissed the menu to take a different action; 80ms exit is appropriate. Fade-in remains 220ms (`--motion-enter`), preserving asymmetry.

**Reduced-motion:** Token collapse handles it.

---

### B5 — Avatar/identity cluster dropdown menu fade

**Catalog ref:** `apps/portal/src/components/shell/avatar-menu.tsx` · verdict: motion-subtle  
**Action:** Same as B4. Radix DropdownMenu should use fade-in/fade-out with no translate for small contextual menus. Verify and align with B4 if they share a component.

**Declaration:** Identical to B4.

**Swift compliance:** CHANGED (token cascade) — same as B4. Avatar menu dismissal via `--animate-fade-out` now resolves to 80ms.

**Reduced-motion:** Token collapse handles it.

---

### B6 — Route change content area (workspace routes)

**Catalog ref:** `apps/portal/src/app/(app)/[workspaceSlugOrId]/layout.tsx` · verdict: motion-subtle  
**Action:** No motion to add. The shell persists across workspace route changes; the only visible transition is the skeleton shimmer on new data loading, which is already present. If the `#main-content` div receives a hard-cut content swap, do NOT add a fade — the shimmer is the continuity signal.

**This is a KEEP-INSTANT decision, not an omission.** Document it so future engineers don't add a route-change fade here under deadline pressure.

**Swift compliance:** UNCHANGED — no motion here is the Swift-correct answer. Route changes must feel instant; the skeleton shimmer on data load is the only continuity signal. Adding a fade-in would delay the user's first scan of the new content.

---

### B7 — Table row insertion (streaming lists)

**Catalog ref:** `apps/portal/src/app/(app)/_components/resource-table.tsx:56-73` · verdict: motion-subtle (but constrained — see below)  
**Action:** Do NOT apply `--animate-row-reveal` to rows in dense operational tables (Sandboxes, API Keys, Policies, Agents, Jobs). Row insertion must be instant in these contexts.

`--animate-row-reveal` (4px slide-up, 180ms) is reserved for contexts where arrival order matters and the table is sparse enough that animation adds clarity rather than noise — for example, a Job event timeline where each event's arrival is the signal itself.

**Implementation rule:**
- Dense operational tables: no animation on row insert.
- Job event timeline (if/when built): `--animate-row-reveal` is appropriate here.

**Swift compliance:** UNCHANGED — instant row insertion is the Swift-correct answer. Row animation in dense operational tables creates visual noise that delays Alex's next scan. No-animation is not an absence of Swift; it is Swift in context (the action affordance is the row's content, not its arrival).

**Reduced-motion:** N/A (no animation to suppress in the dense-table case).

---

## Surface-class taxonomy — dismissal vs structural-continuity

_This section is the hold-up test for engineers applying or reviewing motion. Apply it before assigning `--motion-exit` to any collapsing or closing surface._

### The test

Ask: **is this surface vanishing, or reshaping?**

- **Vanishing (dismissal class):** The surface leaves the viewport entirely. The user's attention moves to what was behind it. Examples: dialog close, popover dismiss, menu dismiss, tooltip hide, drawer close. Swift owns this class — `--motion-exit` (80ms accelerated) clears the stage so the user's next action is immediately available.

- **Reshaping (structural-continuity class):** The surface changes its spatial footprint but stays present in the layout. The user's attention follows the layout change; there is no "stage to clear." Examples: sidebar collapse, accordion expand/collapse, layout split resize. Perpetual owns this class — `--motion-enter` (220ms emphasized) symmetric on both directions. The surface is not departing; it is continuing in a new form.

### Assignment table

| Surface | Class | Token assignment |
|---|---|---|
| Dialog close | Dismissal | `--motion-exit` (80ms) |
| Popover dismiss | Dismissal | `--motion-exit` (80ms) |
| Menu dismiss | Dismissal | `--motion-exit` (80ms) |
| Tooltip hide | Dismissal | `--motion-exit` (80ms) |
| Drawer close | Dismissal | `--motion-exit` (80ms) |
| **Sidebar collapse (B1)** | **Structural-continuity** | **`--motion-enter` symmetric (220ms)** |
| **Sub-pane rail collapse (B2)** | **Structural-continuity** | **`--motion-enter` symmetric (220ms)** |
| Accordion collapse | Structural-continuity | `--motion-enter` symmetric (220ms) — see audit note below |

### Swift exit cascade scope

The Swift exit cascade (commit `8695b82`, `--motion-exit` 120ms → 80ms) propagates automatically to all entries that reference `--motion-exit` via token or keyframe. **It is scoped to the dismissal class only.** Structural-continuity surfaces that inherited `--motion-exit` via the cascade were misclassified — correct by assigning `--motion-enter` symmetric.

### Accordion audit note

Accordion expand/collapse is referenced in `motion.md` composite token table under `--motion-exit` for collapse. This is a **misclassification by the same logic as B1/B2**: accordion disclosure reshapes layout (content height changes), it does not dismiss a surface. Accordion collapse should use `--motion-enter` symmetric — consistent with sidebar. The `--motion-exit` use-case example in the composite token table has been corrected in `motion.md` to remove accordion from the dismissal examples. **This is a doc fix, not a behavior change** — accordion is not currently implemented with motion in this codebase; when it is, the correct token is `--motion-enter` symmetric.

No other surfaces in the current spec were found to be misclassified. B4 (theme switcher menu) and B5 (avatar menu) are correctly in the dismissal class — menus vanish, they do not reshape.

---

## Tuning recommendations for motion-already-present entries

These entries are correctly implemented but have notes for calibration verification.

### T1 — Drawer overlay duration mismatch

**Catalog ref:** `packages/ui/src/components/drawer.tsx:49-69`  
**Issue:** Overlay enter uses raw `duration-[200ms]` instead of a named token. 200ms is close to `--duration-base` (220ms) but not identical.  
**Recommendation:** Replace `duration-[200ms]` with `duration-base` (220ms) to keep the overlay in sync with the panel enter animation. If 200ms was intentional (slightly faster overlay so the panel "catches up" visually), document the decision inline. Currently undocumented.

**Swift compliance:** UNCHANGED in spirit — but verify the overlay exit also uses `--motion-exit` after the Swift recalibration. If the overlay exit was previously raw `duration-[200ms]` or `duration-fast`, it must now use `--motion-exit` (80ms) to match the Swift recalibration for all structural exits.

**Owner:** `[DSA]`

---

### T2 — Verify `--motion-state-change` propagation through `prop-(--motion-state-change)`

**Catalog ref:** Multiple entries in `packages/ui/src/components/dialog.tsx` and `packages/ui/src/components/table.tsx`  
**Issue:** The Tailwind v4 `prop-()` syntax (`transition-colors prop-(--motion-state-change)`) is used in several components. Verify this generates `transition-property: ...; transition-duration: var(--duration-fast); transition-timing-function: var(--ease-out-standard)` correctly. If the prop() utility does not expand the composite shorthand as expected, normalize affected declarations to explicit properties.

**Swift compliance:** UNCHANGED — `--motion-state-change` references `--duration-fast` (120ms), which is within the Swift ceiling. The Swift recalibration does not touch `--motion-state-change`.

**Owner:** `[DSA]`

---

### T3 — Switch toggle duration

**Catalog ref:** `packages/ui/src/components/switch.tsx`  
**Issue:** Radix Switch uses its own internal animation for the thumb slide. The catalog notes "typically 200–250ms with ease-out" which is not a Blaxel token. If the thumb uses a raw value, override to `--duration-base var(--ease-out-standard)` (220ms standard) — thumb slides are spatial micro-motions, not structural shifts, so `--motion-micro` (180ms) would also be acceptable if 220ms feels heavy.  
**Recommendation:** Try `--motion-micro` first (180ms standard). The thumb travel distance is short; the longer base duration may feel sluggish.

**Swift compliance:** UNCHANGED — switch thumb slide is not an action affordance onset; it acknowledges a toggle that already fired. 180ms is within the Swift ceiling. The Swift recalibration does not affect this entry.

**Owner:** `[DSA]`

---

## Summary counts

| Engineer | Entries to action |
|---|---|
| `design-system-architect` | A1–A11 (11 entries) + T1, T2, T3 tuning (3 entries) = 14 items |
| `staff-frontend-engineer` | B1–B7 (7 entries, B6 is a keep-instant doc note) = 6 actionable + 1 confirmation |

**Motion-already-present entries requiring no action: 30** (per catalog — correctly implemented).  
**Motion-forbidden entries: 9** (8 catalog + table row insertion in dense lists — see `motion.md` for rationale).  
**Deprecated: 1** (`copy-confirm-pulse` — see A9 and `motion.md` deprecation list).

### Swift recalibration impact summary (2026-06-28)

| Entry | Status | Mechanism |
|---|---|---|
| A1 Button hover | UNCHANGED | No exit motion |
| A2 Tooltip appear/disappear | CHANGED (token cascade) | `--animate-fade-out` → `--motion-exit` → 80ms |
| A3 Popover item hover | UNCHANGED | No exit motion |
| A4 Badge state color | UNCHANGED | No exit motion |
| A5 Checkbox check-mark | UNCHANGED | No exit motion |
| A6 Form field focus lift | UNCHANGED | No exit motion |
| A7 Dialog close button hover | UNCHANGED | No exit motion |
| A8 Drawer scroll border reveal | UNCHANGED | No exit motion |
| A9 Remove copy-confirm-pulse | UNCHANGED | No animation |
| A10 Segmented control | UNCHANGED | No exit motion |
| A11 Progress bar fill | UNCHANGED | No exit motion |
| B1 Sidebar rail collapse | EXCEPTION — structural-continuity | `--motion-exit` removed; symmetric `--motion-enter` (220ms) both directions |
| B2 Sub-pane rail collapse | EXCEPTION — structural-continuity | Same as B1 |
| B3 Sidebar nav link hover | UNCHANGED | No exit motion |
| B4 Theme switcher menu fade | CHANGED (token cascade) | `--animate-fade-out` → `--motion-exit` → 80ms |
| B5 Avatar menu fade | CHANGED (token cascade) | `--animate-fade-out` → `--motion-exit` → 80ms |
| B6 Route change content area | UNCHANGED | No motion (keep-instant) |
| B7 Table row insertion | UNCHANGED | No animation |
| T1 Drawer overlay duration | PARTIALLY CHANGED | Exit overlay: verify uses `--motion-exit` (80ms) |
| T2 `--motion-state-change` propagation | UNCHANGED | `--motion-state-change` unaffected |
| T3 Switch toggle duration | UNCHANGED | No exit motion |

**Code action required for Swift recalibration:** One value change in `primitive.css` where `--motion-exit` is defined (or in `theme.css` `@theme` if the composite is declared there). All token-cascade entries update automatically. Direct references in B1/B2 update once the token resolves correctly. T1 exit overlay needs verification and possible explicit fix.

---

_Sources: `docs/product/personality.md`, `.intermediate/discovery/motion-audit/catalog.md`, `packages/ui/src/styles/primitive.css`, `packages/ui/src/styles/theme.css`_
