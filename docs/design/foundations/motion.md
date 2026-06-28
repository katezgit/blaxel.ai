# Motion — Foundation

_Owned by motion-designer. Engineers consume this; product-designer reads for reference. Application
details (per-touchpoint specs) live in `motion-application.md`._

---

## Principle

Motion on Blaxel exists to maintain continuity — to acknowledge that state changed, not to celebrate
that it did. The runtime is perpetual; the surface reflects that by never going dark between states.
Every animation either confirms what just happened (hover, press, focus) or orients the user through
a structural shift (pane entry, modal break, drawer slide) — nothing more.

Swift is the counterweight to Perpetual on the motion axis. Perpetual says the runtime is always
present (backend commitment); Swift says the surface is one beat from the next action (UX
commitment). Where Perpetual shapes enters — acknowledge arrival, establish presence — Swift shapes
exits: clear the stage without ceremony so the user's next verb is already available. This makes
in/out asymmetry load-bearing, not decorative. An overlay arriving at 220ms feels deliberate;
the same overlay leaving at 80ms feels gone. That gap is the Swift contract expressed in time.

**Swift ceiling rule:** No more than one beat (≤120ms) between user signal and action affordance
being visible. Any motion proposal that delays the first visible frame of an action affordance past
120ms fails this test regardless of other rationale. Hold new motion proposals against this rule
before accepting them into the spec.

**Structural-continuity rule:** Swift's exit ceiling applies to surface-dismissal motion — surfaces
that vanish from the viewport (dialog close, popover dismiss, menu dismiss, tooltip hide, drawer
close). Structural-reshape motion (sidebar collapse, accordion collapse, layout split resize) uses
`--motion-enter` symmetric on both directions — it is continuity, not dismissal. The surface is
not departing; it is present in a new form. Applying `--motion-exit` to a structural-reshape
surface is a misclassification that creates asymmetry the user reads as abruptness. Hold-up test:
**is this surface vanishing or reshaping?** Vanishing → `--motion-exit`. Reshaping → `--motion-enter`
symmetric.

---

## Duration tokens

| Token | Value | Traces to | Use when |
|---|---|---|---|
| `--duration-instant` | 80ms | **Perpetual + Swift** (dual-axis: hover/press cite Perpetual — always-live UI never lags; dismissal exits cite Swift — clear the stage without ceremony) | Hover background, press overlay — highest-frequency interactions; also dismissal exits (modal/drawer/popover/menu close) — any perceptible delay reads as lag or ceremony |
| `--duration-fast` | 120ms | **Composed** — state change lands cleanly, no drift | Focus ring, badge/icon state swap, hover color shifts, menu item highlight — the default for all interactive feedback; also the Swift ceiling (≤120ms to first visible frame of any action affordance) |
| `--duration-subtle` | 180ms | **Exact** — gives the eye enough time to track spatial change | Disclosure chevron rotation, row selection highlight, segmented control indicator — spatial micro-motions |
| `--duration-base` | 220ms | **Perpetual** — structural shifts need a moment to resolve | Modal/drawer/popover/menu enter, accordion content expand, pane slide — ceiling for all deliberate entry transitions; never exceed this for state changes |

**Calibration verdict: KEEP all four; extend `--duration-instant` scope.** The 80→120→180→220ms ladder remains correctly spaced. The Swift recalibration affects `--motion-exit` only: exits now bind to `--duration-instant` (80ms) instead of `--duration-fast` (120ms), pushing the in/out asymmetry from 1.83x to 2.75x. The `--duration-instant` token acquires a second semantic role — it covers both highest-frequency state changes and structural exits. These are compatible: both classes require zero ceremony. Adding a fifth tier (e.g. a 300ms "expressive" duration) would introduce celebration-level motion and is explicitly forbidden.

---

## Easing tokens

| Token | Value | Traces to | Use when |
|---|---|---|---|
| `--ease-out-standard` | `cubic-bezier(0.2, 0, 0, 1)` | **Composed** — resolves cleanly, no overshoot | Default for all color transitions and state changes; neutral and controlled |
| `--ease-out-emphasized` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | **Perpetual** — enters with intention, not ceremony | Enter transitions only: modal/popover/accordion open, pane slide-in; the near-flat start (0.05) means the element barely moves at first, then resolves confidently |
| `--ease-in-accelerated` | `cubic-bezier(0.3, 0, 1, 1)` | **Disciplined** — clears the stage without lingering | Exit transitions only: modal/popover/menu close, toast dismiss; accelerates early so the surface is restored before the user looks for it |
| `--ease-natural` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | **Perpetual** — starts moving immediately, no windup | Drawer panel enter from viewport edge only; non-zero initial velocity so the panel moves from frame one; `--ease-out-emphasized`'s flat start introduces visible windup from the edge |
| `--ease-linear` | `linear` | **Transparent** — uniform rate communicates ongoing process | Continuous loops only: shimmer, indeterminate progress; conveys "still working," not arrival |

**Calibration verdict: KEEP all five.** Each easing maps to a distinct motion class. `--ease-natural` looks similar to standard `ease` but is semantically scoped to edge-entry panels — the catalog explains why substituting `--ease-out-emphasized` would introduce a windup artifact. No new easing curves needed.

---

## Motion composite tokens

Composites bind a duration + easing into a named shorthand for `transition` declarations. Reference with `var(--motion-*)` in transition properties.

| Token | Value | Use when |
|---|---|---|
| `--motion-state-change` | `var(--duration-fast) var(--ease-out-standard)` | Hover/focus color shifts, badge state swap, icon swap — the default for interactive feedback |
| `--motion-micro` | `var(--duration-subtle) var(--ease-out-standard)` | Spatial micro-motions: disclosure chevron rotate, row selection, segmented control slide |
| `--motion-enter` | `var(--duration-base) var(--ease-out-emphasized)` | Structural entry: modal open, accordion expand, pane slide-in |
| `--motion-exit` | `var(--duration-instant) var(--ease-in-accelerated)` | Dismissal exit: modal close, pane slide-out, popover/menu dismiss — Swift recalibration: 80ms (was 120ms); exits must not compete with the user's next action. **Scope: dismissal surfaces only** (surfaces that vanish entirely). Structural-reshape surfaces (sidebar collapse, accordion collapse) use `--motion-enter` symmetric — see "Surface-class taxonomy" in `motion-application.md`. |
| `--motion-continuous` | `1800ms var(--ease-linear) infinite` | Continuous loops only: skeleton shimmer, indeterminate progress; overridden to `none` under `prefers-reduced-motion` |

**Calibration verdict: KEEP all five; `--motion-exit` value updated.** `--motion-micro` name is correct — it covers spatial micro-motions that need the extra 60ms to be trackable (chevron rotate, indicator slide). `--motion-state-change` covers pure color transitions where spatial tracking is not needed. `--motion-exit` now references `--duration-instant` (80ms) — see duration token rationale above.

---

## Keyframe inventory

All keyframes live in `packages/ui/src/styles/primitive.css`. Consuming via `var(--animate-*)` composites is preferred over raw keyframe references.

| Keyframe | Composite | Kept / Deprecated |
|---|---|---|
| `fade-in` | `--animate-fade-in` | Kept |
| `fade-out` | `--animate-fade-out` | Kept — exit composite: `--motion-exit` (80ms instant, accelerated) |
| `slide-up-in` | `--animate-slide-up-in` | Kept — 8px translate, dialog/popover desktop enter; uses `--motion-enter` (220ms emphasized) |
| `slide-down-out` | `--animate-slide-down-out` | Kept — exit composite: `--motion-exit` (80ms instant, accelerated); Swift recalibration applies |
| `row-reveal` | `--animate-row-reveal` | Kept — 4px slide-up, fill-mode both; reserved for specific streaming contexts only (see Application spec for scope) |
| `shimmer` | `--animate-shimmer` | Kept — 1800ms linear infinite |
| `running-pulse` | `--animate-running-pulse` | Kept — 1600ms linear infinite; opacity 1→0.45→1; used for "Agent running / Job in-progress" status indicators where pulsing conveys live process, not celebration |
| `slide-right-in` | `--animate-slide-right-in` | Kept — ±12px translate; trace/detail panel enter from right |
| `slide-left-out` | `--animate-slide-left-out` | Kept — exit composite: `--motion-exit` (80ms instant, accelerated); Swift recalibration applies |
| `slide-up-from-bottom` | `--animate-slide-up-from-bottom` | Kept — 100% viewport translate; mobile sheet |
| `slide-down-to-bottom` | `--animate-slide-down-to-bottom` | Kept |
| `table-head-scroll-cue` | _(scroll-timeline, no composite)_ | Kept — CSS scroll-driven; not consumed via JS |
| `copy-confirm-pulse` | _(none — deprecated)_ | **DEPRECATED** — see Deprecation list |

---

## Reduced-motion contract

All durations collapse to 0ms under `prefers-reduced-motion: reduce` (applied in `theme.css`). This means CSS `transition` declarations need no per-component media query — the token override handles it globally.

**Three tiers of reduced-motion behavior:**

| Tier | What happens | Which animations |
|---|---|---|
| **Instant** (already handled by token collapse) | Transition fires but completes in 0ms — the state change is visible, just instant | All `transition:` declarations that reference `--duration-*` tokens: hover colors, focus rings, badge swaps, dialog overlay, modal/drawer enter/exit, accordion |
| **Suppress loop** | Animation is set to `none`; element renders in its resting state (static fill, no gradient motion) | `--motion-continuous` overrides to `none`; consumers using `animate-[shimmer...]` or `animate-[running-pulse...]` must apply `animation: none; background: var(--color-secondary-surface)` as the fallback static state |
| **Keep as-is** | No motion to suppress | Static color changes (status badge color, error band background), instant icon swaps (copy→check), border reveals (already instant via token collapse) |

**Rule for new animations:** If a new animation uses `--duration-*` tokens in a `transition:` declaration, the token collapse covers it — no extra work required. If it uses a raw millisecond value or an `@keyframes` animation outside the token system, it must add an explicit `prefers-reduced-motion` override.

**Loop suppression gap — `--animate-shimmer` and `--animate-running-pulse`:** The Tier 2 "Suppress loop" row above lists `--motion-continuous` as the suppression mechanism. However, `--animate-shimmer` (`shimmer 1800ms var(--ease-linear) infinite`, `primitive.css:246`) and `--animate-running-pulse` (`running-pulse 1600ms var(--ease-linear) infinite`, `primitive.css:247`) use literal millisecond values — they do NOT reference `--motion-continuous`. The `--motion-continuous: none` override in `theme.css` does not reach them. Any component that applies `var(--animate-shimmer)` or `var(--animate-running-pulse)` must add its own explicit reduced-motion rule suppressing the animation. The static fallback state for each: shimmer → static `background: var(--color-secondary-surface)`; running-pulse → static indicator at full opacity using `--color-state-running` (see Exception note below). No other `--animate-*` composites in `primitive.css:241-251` use literal durations — the remaining entries reference `--duration-*` tokens and are covered by token collapse.

**Exception — `running-pulse`:** Under reduced motion, the pulse stops (`animation: none`). The "running" state must still be communicated; the state color (`--color-state-running`) and a static indicator dot carry the semantic. The pulse is reinforcement, not the sole signal.

---

## Deprecation list

### `copy-confirm-pulse` — REMOVE

**Location:** `packages/ui/src/styles/primitive.css`, `@keyframes copy-confirm-pulse` (lines 276–280)

**What it does:** Scale bounce from 1→1.18→1 over 600ms on copy button confirmation.

**Why deprecated:** Scale bounce is celebration motion. It draws attention to the action having succeeded, which is the exact anti-pattern "Disciplined → tonal axis" forbids. The copy action is micro-confirmation, not an event. Alex is mid-incident; a bouncing button is noise.

**Replacement:** Instant icon swap (CopyIcon → CheckIcon) + instant color shift to `--color-state-scored-text`. No duration, no easing, no keyframe. The change is the confirmation.

**Consumers to update before keyframe removal:**
- `packages/ui/src/components/code-block.tsx` — currently references `copy-confirm-pulse` directly per the TODO comment in primitive.css. Replace with a CSS class swap that fires on `copied` state with no animation property.

The spec was tightened mid-PR (accordion taxonomy correction — accordion reclassified from dismissal to structural-continuity, 2026-06-28). The catalog of deprecated patterns currently lists only `copy-confirm-pulse`. The catalog flags row-insertion animation as a risk (not a current implementation) — it is covered in the motion-forbidden section below rather than as a deprecation.

---

## Motion-forbidden list

These surfaces must never receive motion. The rationale is restated here so it survives deadline pressure.

| Surface | Why motion is forbidden |
|---|---|
| **Sidebar nav active state glow** (`sidebar-nav-link.tsx:36-38`) | The active state is a stable persistent marker, not an event. Animating the glow entrance treats "user is on this page" as something worth announcing, which violates Disciplined. The glow should be present or absent — never arriving. |
| **Copy-to-clipboard feedback** (`copy-button.tsx:47-89`) | See Deprecation list. Icon and color swap are the confirmation; scale or fade would be celebration. |
| **Page header / title on navigation** (`sandboxes/page.tsx:17-24`) | Headers must appear instantly to confirm navigation. Any enter animation would delay the user's orientation signal. Perpetual means the surface is always current — not that it arrives gracefully. |
| **Table row removal** (`resource-table.tsx`) | Row removal (delete, filter-out) must be instant (hard-cut). Fade-out animation delays the confirmation that the action succeeded and could obscure the removal if it completes while the user's eyes are elsewhere. |
| **Empty state display** (`table.tsx:320-338`) | Empty states are information, not UI events. The CLI command is the signal; motion here competes with the actionable content. |
| **Error band display** (`table.tsx:341-366`) | "Failure outranks success" — errors must be visible instantly and at full contrast. A fade-in would dim the error during its most critical moment (first paint after failure). |
| **Form field validation error reveal** (`input.tsx:53-54`, `form-field.tsx`) | Same rationale as error band. Validation errors must be present, not arriving. Instant appearance with high contrast is the correct treatment. |
| **Status color changes** (badge, state pill, any `--color-state-*` swap) | Color is pure state encoding per personality principle #4. Transitioning between state colors turns a signal into a ceremony and makes intermediate color mixes semantically meaningless (what does the orange→green blend mean?). State changes must snap. |
| **Table row insertion in dense lists** (Sandboxes, API Keys, Policies, Jobs lists) | Dense tables are Alex's incident surface. New rows appearing with animation in a fast-updating list hide the change — the animation completes while the user is reading the previous row. Rows must appear instantly so Alex can scan without visual noise. |

---

## Principle #12 compound check — motion-forbidden surfaces vs below-the-fold

Interaction principle #12: "Primary next-action reachable without scroll." A compound failure would
be a surface that is both motion-forbidden AND serves as the primary action affordance below the
fold.

All 9 motion-forbidden surfaces were audited against this compound condition:

| Surface | Action affordance? | Below-fold risk? | Compound flag? |
|---|---|---|---|
| Sidebar nav active state glow | No — navigation chrome, not an action | N/A | **None** |
| Copy-to-clipboard feedback | No — micro-confirmation of a completed action | N/A | **None** |
| Page header/title on navigation | No — orientation signal, not an action | N/A | **None** |
| Table row removal | No — the delete affordance triggers removal; the forbidden motion is on the removed row | N/A | **None** |
| Empty state display | The CLI command in an empty state IS the action affordance — but empty states are always above the fold (they replace the list viewport) | No | **None** |
| Error band display | The retry/CLI affordance in the error band IS an action — see principle #5 — but the band appears inline within the viewport, not below it | No | **None** |
| Form field validation error reveal | No — feedback signal adjacent to a field, not a primary action | N/A | **None** |
| Status color changes | No — pure state signal, not an action affordance | N/A | **None** |
| Table row insertion in dense lists | No — rows insert into the existing table viewport; no below-fold placement | N/A | **None** |

**Verdict: no compound failures.** Principle #12 and the motion-forbidden list are orthogonal concerns. None of the 9 forbidden surfaces acts as a primary action affordance that could land below the fold. No IA escalation required.

---

_Sources: `docs/product/personality.md`, `.intermediate/discovery/motion-audit/catalog.md`, `packages/ui/src/styles/primitive.css`, `packages/ui/src/styles/theme.css`_
