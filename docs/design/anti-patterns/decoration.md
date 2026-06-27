# Decoration anti-patterns

> **Scope.** Visual moves that read as generic SaaS — decoration filling a vacuum instead of a designed decision. Each entry: **the move → why it reads generic → what to do instead.**

Anti-patterns are a peer category to [`foundations/`](../foundations/), [`guidelines/`](../guidelines/), and [`patterns/`](../patterns/). Guidelines define *behaviors and decisions*; anti-patterns name *forbidden moves* so they get caught before they ship. Personality-drift anti-patterns specific to voice / interaction tone live in [`docs/product/personality.md`](../../product/personality.md) Counterexample section — this folder is for visual / structural decoration.

---

## 1. Border-left as selection or decoration state

**The move.** A 2–4px colored left edge marks "selected", "current", "active", or sits as an ornamental accent on a list item, card, section, or sidebar entry.

**Why it reads generic.** Bootstrap-era list-group pattern, found in every admin template and dashboard starter. It tells the eye *something* is selected without committing to a real visual language — color + weight + spatial cue would do the same job with more personality. The left bar is decoration filling a vacuum; remove it and a properly-designed selection state still reads.

**What to do instead.**
- **Selection state:** foreground color shift + font weight increase + (optionally) background tint. Focus ring carries the keyboard signal separately.
- **Active route:** same — foreground + weight. The currently-visible route doesn't need a stripe to prove it.
- **Decoration accent on a section / card:** no accent. If the section needs visual identity, use heading typography, spacing rhythm, or — if it earns it — a card per [`card-usage.md`](../guidelines/card-usage.md).

**Failure looks like.** `border-l-2 border-l-primary` on the active sidebar item. `border-l-4 border-l-accent` on a notification card. Any `border-l-*` colored token used as state, never structure.

---

## 2. Hairline card separators as default grouping

**The move.** Every section on a page gets wrapped in a `<Card>` or stacked with 1px dividers above/below. The card chrome / divider lines become the primary grouping signal.

**Why it reads generic.** The card outline carries no information — it's whitespace replaced with rules. Stacking three or four hairline-bordered cards down a page produces a striped surface where every section reads at the same visual weight, which makes scanning harder, not easier. This is the "bento everywhere" default of marketing-flavored SaaS templates; Blaxel's audience scans density-first and reads typography and spacing as grouping signals natively.

**What to do instead.**
- **Default grouping primitive:** heading + spacing. A clear section title plus a deliberate gap below the previous section is the strongest, lowest-noise grouping move available.
- **Card when it earns it:** apply the three-criteria test in [`card-usage.md`](../guidelines/card-usage.md) §1 — discrete object + actionable as unit + sits alongside peers of the same shape. Anything failing the test is a section, not a card.
- **Dividers when they earn it:** a single subtle rule can separate a chrome region from a content region (e.g. toolbar from table). It cannot be the *default* spacing mechanism between sections of the same content stream.

**Failure looks like.** A dashboard page with four stacked `<Card>` blocks, each holding a heading + a list, separated only by card chrome. A settings page where every form section sits in its own bordered container. Anywhere the chrome would disappear without information loss.

---

## How to use this file

1. **Per-screenshot review (designer).** Loaded by the [visual-review-lens workflow](../../../.claude/workflows/visual-review-lens.md) as one of the FAIL checks. If a captured screen ships either move above, the review returns FAIL with the entry name and the surface where it appears.
2. **Pre-implementation check (engineer).** Before reaching for `border-l-*` or wrapping a section in `<Card>`, search this file for the move. If it appears here, choose the "what to do instead" alternative.
3. **Adding a new entry.** Same structure: **move → why it reads generic → what to do instead → failure looks like.** If you cannot name the move concretely (with the class or component that produces it), the entry is not ready — it's an opinion, not a documented anti-pattern.

---

## Related

- [`personality.md`](../../product/personality.md) Counterexample — voice / interaction anti-patterns (cute error, welcome hero, celebration deploy, illustration empty state)
- [`card-usage.md`](../guidelines/card-usage.md) — when a card IS the right container
- [`house-rules.md`](../guidelines/house-rules.md) — deliberate divergence from industry consensus (different category — decisions, not forbidden moves)
