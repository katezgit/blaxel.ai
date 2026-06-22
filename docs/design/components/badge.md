# Badge — usage guideline

Canonical doc for deciding between Badge's two visual shapes. Component anatomy and props are in `packages/ui/src/components/badge.tsx`; this file is the decision layer only.

---

## Two shapes

**Filled chip** (default): colored background + border + optional dot + text. Reads as a discrete, bounded object — it occupies space, signals its own containment.

**Bare dot + text** (`bare={true}`): no background, no border, no padding. The colored dot and label sit directly in the surrounding typographic flow. Reads as an inline annotation on something else, not a thing in itself.

The two status shapes (`info`, `beta`) render neither dot nor background by default — they carry a `typography-caption` label only. These are nav-item availability markers, not runtime-state indicators; they follow the filled chip rule when they need containment (e.g., as a standalone pill adjacent to a nav label or heading) and the bare rule otherwise.

Badge text renders at 12px (`typography-caption`) — one step below the 14px body so the chip's distinctness isn't carried 100% by the container framing.

---

## Filled chip — when

Use when the badge is the **primary identity marker of a discrete object** that appears alongside peers of the same shape.

**Alex — Jobs list row.** Alex opens the Jobs list after a production incident to triage. Each row is a Batch Job: `name / job-id`, region, duration, and a status chip — `running` (blue), `succeeded` (green), `failed` (red). The chip is the reason Alex's eye moves down the column first. It names the primitive's current state independent of any surrounding sentence; it sits with peers that have the same shape; it must stand alone as scannable. Filled is the right read. Removing the container would scatter `succeeded` and `failed` inline with the job name and region — no column to scan, no contrast hierarchy.

**Sam — API Keys list.** Sam is confirming key scope before a security review. Each API key row carries an `active` / `expiring` / `revoked` chip. The chip must stand alone — Sam's auditor reads it out of row context, pastes the screenshot into a ticket, circles the chip. It is a discrete object with stable identity; it belongs alongside peers of the same shape. Filled.

**Nav-item availability markers** (`PREVIEW`, `SOON`, `BETA`). These are bounded labels adjacent to a nav item — they signal product maturity, not runtime state. Because they appear next to a sidebar label and need containment to be readable at small size, the filled dot-less chip (`info` / `beta` variants) is correct. They are NOT bare because the dot in bare implies a live runtime entity — these are not that.

---

## Bare dot + text — when

Use when the status is **an attribute of a sentence or inline description**, not a standalone object, and when the surrounding content already provides structure.

**Alex — Sandbox detail, security band.** The security band on a Sandbox detail page (per `personality.md` Sacrificial choice #3: single-page ops + security band, never a Security tab) reads inline context: `Policy pol-7a3 · enforced`. The word `enforced` is a qualifier on the Policy, not a discrete badge appearing in a column alongside peers. Wrapping it in a filled chip adds visual weight to a phrase that is already scoped by its container. Bare dot + label keeps the information inline without competing with the Sandbox's operational state at the top of the page.

**Alex — incident glance.** The Phase 4 dashboard glance view shows an Agent row in a mixed-state list: `cubic-prod-agent · degraded since 22:17 UTC`. The status reads as part of the row's sentence structure — it qualifies the Agent name in context. A filled chip here competes with the Agent name itself for primacy and implies the degraded state is a separate scannable column (it isn't, in this context). Bare keeps the color signal while letting the name stay primary.

---

## The decision test

Use **filled** when the badge names the state of a discrete object that a reviewer could scan in isolation, cut from context, and still understand; use **bare** when the status qualifies a surrounding sentence or detail label that provides the context.

One-pass check: remove everything around the badge. Does it still make sense alone? Filled. Does it only make sense in its surrounding clause? Bare.

---

## Failure modes / drift

**Tempting move — chip everywhere, safety in containment.** Because the filled chip is the default and visually heavier, it reads as "more intentional." Under deadline, a designer wraps every status mention in a filled chip: the Policy's enforcement mode, the API key's active state in a prose summary, the Sandbox's region in a detail section. Result: the visual hierarchy flattens. Alex's incident glance is a uniform grid of blue and green chips; nothing fails upward. The Failure-outranks-success principle (`personality.md` Interaction principle #5) requires failed / denied states to stand out — but if every state is a chip, the contrast budget is gone. Chips everywhere = symmetry; symmetry = the principle fails.

**Tempting move — bare for "minimal" aesthetics.** The Disciplined personality axis (`personality.md`) reads as restraint, and bare feels restrained. A designer strips chips from the Jobs list and the API Keys list to "clean things up." Result: Alex can no longer scan a column of outcomes; Sam's auditor cannot isolate key status in a screenshot. The decision test is not "does this look calmer?" — it is "can this badge be read in isolation?" List rows demand isolation; they fail without containment.

**Tempting move — bare dot as live-state indicator anywhere color appears.** The dot in the bare variant implies a streaming runtime signal (matching `personality.md` Interaction principle #3: status streams, never polls). Placing a bare dot + `active` inside a static prose summary (e.g., a Policy description that mentions its enforcement status once) implies the value is live and ticking. If it isn't streaming, use filled — the chip does not imply real-time; the dot does.

---

## Color + state constraint

Color carries state, nothing else (`personality.md` Interaction principle #4). The Badge variant maps directly to domain state — `success` for succeeded/healthy, `destructive` for failed/denied/errored, `warning` for expiring/degraded, `running` for active boot or live execution, `neutral` for draft/inactive. Do not use variant for branding, category identity, or aesthetic variation. When you reach for `info` or `brand-soft` on a status-bearing primitive, stop: the state is not domain state; reconsider whether a badge is the right component at all.
