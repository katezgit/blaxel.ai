# Spacing — Rationale

This is the **theoretical foundation** for [`spacing.md`](./spacing.md). Read this once to internalize *why* the canon table is what it is; consult `spacing.md` daily for *which value to use*. The two documents are normative complements — neither restates the other. Industry pattern citations and the applied working rules (chrome carries separation weight; gap above h2 must clear leading) live in `spacing.md`; this file derives those rules from first principles and names the academic sources.

---

## What problem these principles solve

Spacing is the layer between content and structure. It determines whether a reader sees a list of items, a group of related items, or one continuous mass. Get it wrong and content fights itself — readers miss section boundaries, can't tell which label belongs to which control, lose their scan position mid-page. Get it right and the layout disappears; the eye lands where the content asks it to.

Every value in `spacing.md` derives from four interlocking principles. Each solves a specific perceptual problem. The 8-point grid is the engineering shorthand that lets us apply all four without computing them at the point of decision.

---

## 1. Gestalt — Law of Proximity

**Source.** Koffka, *Principles of Gestalt Psychology* (Harcourt, Brace, 1935). Original formulation in Wertheimer, *Untersuchungen zur Lehre von der Gestalt II*, *Psychologische Forschung* (1923). Web adaptation in Mark Boulton, *A Practical Guide to Designing for the Web* (Five Simple Steps, 2009).

**Statement.** Elements closer together are perceived as a group. The *ratio* of internal gap to external gap determines grouping strength, not the absolute distance.

**Working rule.** External gap should be ≥ 2× internal gap, or the boundary disappears under squint.

**How it shapes our canon.**
- The scale doubles (4 → 8 → 16 → 32) instead of stepping linearly, so adjacent tiers stay perceptually distinct.
- Field↔field at 16px + section↔section at 32px gives exactly the 2× ratio that makes the section break visible without measurement.
- Title↔description at 4px + section↔section at 32px is an 8× ratio — far past the perceptual threshold, so the title-description pair fuses into one "unit" regardless of surrounding noise.
- The "chrome carries separation weight" rule in `spacing.md` is this principle applied to a chrome boundary: a card border supplies some of the perceptual external gap, so the actual gap can shrink without losing the grouping signal.

**Diagnostic.** Squint at the layout. If section boundaries vanish, the ratio failed. Either tighten the internal gap or loosen the external one.

---

## 2. Modular scale

**Source.** Robert Bringhurst, *The Elements of Typographic Style* (Hartley & Marks, 1992; 4th ed. 2012) — the chapter on the modular scale. Web adaptation: Tim Brown, *More Meaningful Typography* (A List Apart, 2011) and modularscale.com.

**Statement.** Spacing and typographic values should form a *geometric* progression — each step a constant ratio of the previous — not an arithmetic one. Adjacent values stay close enough to coexist in a layout; non-adjacent values stay different enough to carry distinct meaning.

**Common ratios.** Perfect fifth (1.5), golden ratio (1.618), octave (2.0), major third (1.25).

**Our scale — 4, 6, 8, 12, 16, 24, 32.** Roughly ratio 1.5 (perfect fifth), with 6 inserted as an intermediate fifth from 4. Not a pure progression — hand-tuned for the values designers reach for most often — but geometric in character.

**Why off-scale values are banned.** 20, 28, 36, 40 are arithmetic midpoints between scale values. They sit *between* meanings — the eye can't decode them as a distinct tier because they're too close to both neighbors. A 20px gap reads as "not quite 16 and not quite 24" instead of as the X tier. Reviewer FAILs them for the same reason a typographer doesn't set body text in 14.5pt.

---

## 3. Baseline grid / vertical rhythm

**Source.** Bringhurst (same book, chapters on leading and vertical proportion). Web adaptation: Tim Brown, *Compose to a Vertical Rhythm* (A List Apart, 2006); Mark Boulton (above).

**Statement.** All vertical spacing should be multiples of the body line-height so the eye lands predictably at each row. The grid is invisible; the rhythm is felt.

**How it shapes our canon.**
- `--spacing: 0.25rem` (4px) is the sub-grid unit. Body line-height at 14×1.5 ≈ 21px = ~5 sub-grid units.
- Gaps that quantize cleanly to the sub-grid (8, 16, 24, 32) preserve rhythm; gaps that don't (20, 28) break it by introducing a shifted baseline that competes with the body rhythm.
- Same conclusion as Principle 2, reached through vertical alignment instead of value progression — the two principles' bans line up exactly. That alignment is not coincidence; it is what a well-designed scale looks like.

**Diagnostic.** If a page feels "off" but no individual value is clearly wrong, check whether one section is using off-grid padding. The shifted baseline cascades to every row below it.

---

## 4. Asymmetric whitespace = new beginning

**Source.** Bringhurst (treatment of leading and indentation). Web adaptation: Boulton (above).

**Statement.** When the gap *above* an element exceeds the gap *below*, the element reads as opening a new unit. When symmetric, it reads as continuation. When the gap below exceeds the gap above, the element reads as closing the prior unit.

**This is the principle behind our flat-section 32px-above-h2 rule.** Inside a section, blocks sit at 16px (`gap-4`) intervals. Above an h2 that opens a new section, the gap jumps to 32px (`gap-8`) — exactly the asymmetry signal. Without that jump, the h2 reads as just another row.

**It is also why title↔description sits at 4px.** Above the title there's a much larger gap (section break above). Below the description there's also a larger gap (toward content). The 4px between title and description is tighter than both — so by Principle 1 the two lines fuse into one unit, and by this principle the asymmetry signals "this is the unit's beginning."

**Diagnostic.** If a heading doesn't read as starting something new, measure the gap above it vs. the rhythm inside its section. If they're equal, the asymmetry failed; the gap above needs to grow.

---

## Synthesis — the 8-point grid

**Source.** Bryn Jackson, *The 8-Point Grid* series (Spec.fm, 2014). Earlier institutional roots in Material Design's 8dp keyline (Google, 2014). Used at Material, IBM Carbon, GitHub Primer, Atlassian, Shopify Polaris, and via 4px sub-grid in this project.

**Statement.** Pick 4 or 8 as the base unit and allow only multiples. Principles 1–4 fall out automatically because:
- 4/8 multiples form a near-geometric progression at the values designers actually reach for (4, 8, 16, 24, 32, 48, 64 — close enough to ratio 1.5–2)
- Multiples of 4 align cleanly with body line-heights at 14–18px text
- Doubling between tiers (4→8→16→32) creates the 2× external/internal ratio automatically

**This is the engineering-tractable expression of the four principles.** Designers don't compute Bringhurst ratios at point of decision; they reach for an 8pt-grid value. The theory is what justifies the shorthand.

---

## Derivation map — `spacing.md` rules to first principles

| `spacing.md` rule | Derives from |
|---|---|
| Canon table values (4, 6, 8, 12, 16, 24, 32) | Modular scale (#2) + 8-point grid (synthesis) |
| Off-scale bans (20, 28, 36, 40) | Modular scale (#2) + baseline grid (#3) |
| 2× external/internal ratio (16 inside / 32 between) | Gestalt proximity (#1) |
| Chrome carries separation weight | Gestalt proximity (#1) — chrome supplies *some* external boundary, so gap can shrink |
| Gap above h2 must clear leading | Asymmetric whitespace (#4) |
| Flat sections 32px / card-contained 24px | Gestalt (#1) + asymmetric whitespace (#4) compose to layout-conditional values |
| Title↔description 4px (across h1/h2/h3) | Asymmetric whitespace (#4) — internal gap < surrounding external gap binds the unit |
| Tabs trigger row ↔ panel 24px | Gestalt (#1) applied with tab-strip chrome as the separator |
| Toolbar ↔ table 16px (block-within-section) | Gestalt (#1) — toolbar is a block, not a section, so internal-tier gap |

---

## Diagnostic checklist

When a layout "feels off" and no individual value is clearly wrong, run these in order:

1. **Squint test (Principle 1).** Can you see section boundaries from gap alone, with no text legible? If not, internal/external ratio failed.
2. **Asymmetry test (Principle 4).** Is the gap above each h2 visibly larger than the rhythm inside its section? If not, headings don't open new units.
3. **Baseline test (Principle 3).** Are any padding/margin values off the 4px sub-grid? If yes, the baseline is fighting itself.
4. **Tier test (Principle 2).** Is any value sitting between scale tiers (20, 28, 36, 40)? If yes, it carries no meaning — pick the nearest canonical neighbor.

If all four pass and the layout still feels off, the problem is not spacing.

---

## References

- Bringhurst, R. *The Elements of Typographic Style*. Hartley & Marks. 4th ed., 2012.
- Boulton, M. *A Practical Guide to Designing for the Web*. Five Simple Steps. 2009.
- Brown, T. "Compose to a Vertical Rhythm." *A List Apart*, 2006.
- Brown, T. "More Meaningful Typography." *A List Apart*, 2011. See also modularscale.com.
- Jackson, B. "The 8-Point Grid." Spec.fm, 2014.
- Koffka, K. *Principles of Gestalt Psychology*. Harcourt, Brace. 1935.
- Wertheimer, M. *Untersuchungen zur Lehre von der Gestalt II*. *Psychologische Forschung*. 1923.
