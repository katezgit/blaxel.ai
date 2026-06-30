# Spacing

Personality posture is **spare and dense** (see `docs/product/personality.md`). Alex arrives mid-investigation; Sam is triaging a regression on a deadline. Gaps that read as "comfortable" in a consumer product read as "bloated" here. Every spacing value is the tightest value that avoids a collision — not the most comfortable value that still works.

---

## Canon

`--spacing: 0.25rem` is declared explicitly at `packages/ui/src/styles/primitive.css:122`. Tailwind v4 does not ship a default `--spacing`; HUD declares it so that every `gap-N`, `p-N`, and `m-N` utility derives from the same 4px base unit without ambiguity.

| Token | REM | PX | Canonical usage |
|---|---|---|---|
| `spacing-1` | 0.25rem | 4px | `mb-1` title → description; micro vertical stacks |
| `spacing-1.5` | 0.375rem | 6px | DropdownMenu item padding; button icon gap; form: label ↔ control gap |
| `spacing-2` | 0.5rem | 8px | Inline siblings (button + label, badge + dot); Input internal padding; form actions-row button gap |
| `spacing-3` | 0.75rem | 12px | Alert icon ↔ content gap; `px-3` in form-field controls |
| `spacing-4` | 1rem | 16px | `gap-4` between blocks; card/alert padding; form: field ↔ field |
| `spacing-6` | 1.5rem | 24px | `gap-6` between card-contained sections (card border carries separation weight); section inside a panel; form: last field ↔ actions row; Tabs trigger row ↔ panel |
| `spacing-8` | 2rem | 32px | `gap-8` between major regions; between flat-layout sections (no chrome — gap carries the work); `pl-8` left-icon inset offset |

---

## Off-scale (drift)

Tailwind ships `spacing-5` (20px), `spacing-7` (28px), `spacing-9` (36px), `spacing-10` (40px), and higher multiples by default. HUD's canonical scale skips them entirely. If you reach for a 20px gap, the answer is almost always 16px (`gap-4`) or 24px (`gap-6`); the layout that "wants" 20px is usually a rhythm error somewhere else — a missing wrapper, a wrong padding on a sibling, or an attempt to paper over misaligned content. Reviewer FAILs `gap-5`, `p-7`, `gap-9`, `gap-10`, and arbitrary values like `gap-[18px]`.

---

## Rhythm theory

Two applied rules govern every section-class value below — use these at the point of decision. Theoretical foundation (Gestalt proximity, modular scale, vertical rhythm, asymmetric whitespace), academic citations, and the derivation of these rules from first principles live in [`spacing-rationale.md`](./spacing-rationale.md). Read that once; consult the two rules below daily.

**1. Chrome carries separation weight.** A card border, drop-shadow, or background-tonal shift visually separates two adjacent blocks even at a small gap. Flat layouts (no chrome between siblings) compensate with raw gap. A `<Card>`-contained section list works at `gap-6` (24px); the same content rendered flat needs `gap-8` (32px). Industry confirms: Linear flat settings, GitHub repo settings, and shadcn/v0 dashboard examples sit at 32px+ between flat sections; Vercel and Stripe collapse to 24px between cards. Any visible chrome around a section (border, background, shadow) counts as card-contained.

**2. Gap above an h2 must clear its leading.** A heading reads as "a new beginning" only when the gap above it is ≥ the heading's effective leading. At our ~18–20px semibold h2, leading is ~28px — so 24px above reads as "another row of the previous section," 32px reads as "new section starts here." This is why the flat-section canon is 32px and not 24px, even under our *spare and dense* posture: density is content-per-pixel, not gap compression; a missed section boundary costs scanning speed.

These two rules also explain the tight end of the scale: `gap-1` (4px) for title↔description is intentionally below body leading — same-unit signal, not new-unit.

---

## Composition cheatsheet

**Forms**
- Label ↔ control: 6px / `gap-1.5`
- Control ↔ help / description text (muted explainer beneath input): 4px / `gap-1` — same-unit asymmetry rule (see *Rhythm theory* #4)
- Control ↔ inline error message: 4px / `gap-1` — replaces or appears alongside help text; same rhythm
- Inline marker (required / optional indicator next to label): 4px / `gap-1`
- Checkbox / radio ↔ its label (horizontal): 8px / `gap-2`
- Choice group items (vertical stack of checkbox / radio): 8px / `gap-2` for label-only rows; 12px / `gap-3` when each item has a description sub-line
- Inline field siblings (multi-column row, e.g. First name + Last name): 16px / `gap-4` — matches vertical field gap so column/row rhythm aligns
- Field ↔ field (single column): 16px / `gap-4`
- Field group ↔ field group (sub-sections within a form): inherits the **Page → Sections within a region** rule below — 32px (`gap-8`) flat, 24px (`gap-6`) card-contained
- Form section heading block ↔ first field: 24px / `gap-6` — heading anchors the section opener; first field starts the body
- Last field ↔ actions row: 24px / `gap-6`
- Actions row button gap: 8px / `gap-2`

**Cards / panels**
- Internal padding: 16px / `p-4` (compact cards) or 24px / `p-6` (spacious panels)
- Section within a panel: 24px / `gap-6`
- Block within a section: 16px / `gap-4`

**Page**
- Major regions (e.g. header → content, content → sidebar): 32px / `gap-8`
- Sections within a region — pick by layout context (see *Rhythm theory* above):
  - **Card-contained** (each section sits inside its own `<Card>` / panel, or has its own border/background): 24px / `gap-6` — the chrome carries part of the separation weight.
  - **Flat** (sections are siblings with no chrome between them, each anchored by an h2 + body): 32px / `gap-8` — gap is the only separator and must clear the h2's leading. Supersedes the earlier `gap-6 lg:gap-8` heterogeneity rule; flat sections are the case that rule was reaching for.
- Blocks within a section: 16px / `gap-4`

**Inline**
- Icon ↔ label: 6px / `gap-1.5` (small icons) or 8px / `gap-2` (standard icons)
- Badge ↔ dot or sibling badge: 8px / `gap-2`
- Title ↔ description (single header unit — applies to h1 page headers, h2 section headers, h3 sub-section headers alike): 4px / `gap-1`

**Tabs**
- Tab list (triggers row) ↔ tab panel: 24px / `gap-6` — applied by the `Tabs` primitive root (`packages/ui/src/components/tabs.tsx`); do not override at the call site

**Tables**
- Toolbar ↔ table content: 16px / `gap-4` (block-within-section)
- Bulk-action bar layout (between toolbar and table): owned by `docs/design/guidelines/toolbar.md` § Bulk-action bar — do not duplicate values here

**Detail page header rhythm** (page with a breadcrumb)
- Breadcrumb ↔ page heading block: 12px / `gap-3` — set inline on the outer `<header>`
- H1 ↔ description **or** metadata row (`count · slug · owner`) — inside the heading block: 4px / `gap-1` — via the `.page-header` utility. Meta-row composition (between-item `gap-2`, slug+CopyButton inline group `gap-0`) lives in `header-rhythm.md`.
- Heading block ↔ first content block (table, body, first section): 24px / `gap-6` — set inline on the outer `<section>`. The h1's visual weight does the "new zone starts here" work even when content opens with a flat h2 section, so 24px suffices here. Subsequent section↔section gaps follow the flat-vs-card rule under **Page** above (32px flat / 24px card-contained).

Canonical shape:
```tsx
<section className="flex flex-col gap-6">       {/* heading → content */}
  <header className="flex flex-col gap-3">       {/* breadcrumb → heading */}
    <Breadcrumb parent={…} current={…} />
    <div className="page-header">                {/* h1 → description */}
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  </header>
  {/* content */}
</section>
```

Index pages omit the `<header className="gap-3">` wrapper (no breadcrumb) and use `<header className="page-header">` directly — the section's `gap-6` then governs heading→content the same way.

---

## Relation to other foundations

**Header rhythm** (`docs/design/foundations/header-rhythm.md`) — the title column owns 4px (`gap-1`) between title and description; breadcrumb ↔ title is 12px (`gap-3`) left inline at the outer `<header>`; meta-row items are 8px (`gap-2`). These are specializations of the canonical scale above, not overrides.

**Page shell** (`page-shell` utility) — owns topbar-edge ↔ page-header (`pt-8`, 32px), page-header ↔ content (`gap-6`, 24px), and bottom-of-page padding (`pb-16`, 64px). The upper boundary is the **topbar** (a chrome surface with its own visual weight), not the raw browser viewport; `pt-6` (24px) was the pre-topbar value and is now retired. `pt-8` (32px) is the on-canon maximum — large enough to signal "content starts here" against the topbar, on-scale per the spacing canon. `docs/design/guidelines/app-shell-layout.md §7` cites 40px from peer benchmarks; that value (`pt-10`) is off-scale and is not used here. These compose with this scale without conflict: `page-shell` sets the outermost rhythm; the tokens here govern everything inside the content region.

---

## See also

- [`spacing-rationale.md`](./spacing-rationale.md) — first-principles derivation of every rule in this file: Gestalt proximity, modular scale, baseline grid, asymmetric whitespace, 8-point synthesis, references.
- [`spacing-catalog.md`](./spacing-catalog.md) — universe of spacing contexts a B2B / dashboard UI typically renders. Use for new-project planning and current-project gap analysis. Catalog enumerates; this file rules.
- [`docs/conventions/typography-utility-usage.md`](../../conventions/typography-utility-usage.md) — typography role utilities, layer split (DS vs app), and role-vs-size rule.
