# Typography

Personality posture is **spare and dense** (see `docs/product/personality.md`). Alex arrives mid-incident; Sam is triaging a regression on a deadline. A type scale that respects them is intentionally small — every size step earns its differentiation by encoding a distinct role (heading vs body vs metadata), never by adding visual weight for its own sake. The canonical scale is three sizes for the three composites, and that is on purpose.

---

## Canon

Three composite utilities form the entire readable-text scale. A composite bundles `font-family` + `font-size` + `line-height` + `letter-spacing` + `font-weight` into a single class, declared in `packages/ui/src/styles/utilities.css`. The `@theme` block in `primitive.css` sets `--text-*: initial` to wipe Tailwind's default `text-{xs,sm,base,…}` font-size utilities — **the composite utilities override Tailwind's auto-generated `text-*` utilities from `primitive.css`**. Reaching for `text-sm` after that wipe is a no-op at best and a cascade conflict at worst.

Token declarations live at `packages/ui/src/styles/primitive.css` (the `@theme {}` typography block, line ~307 onwards).

| Token | Composite utility | rem | px | Weight | Line-height | Letter-spacing | Canonical usage |
|---|---|---|---|---|---|---|---|
| `--typography-display` | `typography-display` | 1.5rem | 24px | 600 (semibold) | `2rem` / ratio 1.33 | −0.02em | Page title (H1) — hero / display heading. Also used for metric tile numbers. |
| `--typography-subtitle` | `typography-subtitle` | 1rem | 16px | 600 (semibold) | `1.375rem` / ratio 1.375 | −0.01em | Section title (H2) — dialog title, drawer header, sheet header, section headings. |
| `--typography-body` | `typography-body` | 0.875rem | 14px | 400 (regular) | `1.375rem` / ratio 1.57 | 0 | Universal paragraph font — default reading text, table cell prose. Use this whenever in doubt. |

---

## Weights

Two weights are sanctioned. Every text in the product is one of these two.

| Token | Value | Used for |
|---|---|---|
| `--font-weight-regular` | 400 | Body prose, table cell values, input text, timestamp copy, helper text. The default — everything that isn't being emphasized. |
| `--font-weight-semibold` | 600 | Page titles (H1), metric display numbers, stat tiles, run name in a hero position. Error severity labels and FAILED / OOM badges. |

`--font-weight-medium` (500) and `--font-weight-bold` (700) are declared in `primitive.css` as internal tokens for edge cases (e.g. `typography-table-header` uses medium internally). They are not available as consumer-facing weight choices — see Off-scale below.

---

## Line height + letter spacing

Line-height and letter-spacing are bundled into the composite utilities. Never set them independently in JSX.

| Composite | Line-height | Letter-spacing |
|---|---|---|
| `typography-display` | `2rem` (ratio 1.33) | −0.02em |
| `typography-subtitle` | `1.375rem` (ratio 1.375) | −0.01em |
| `typography-body` | `1.375rem` (ratio 1.57) | 0 |

The negative tracking on display and subtitle tightens dense headings without requiring any manual override. The composite delivers the correct tracking automatically — adding a `tracking-*` utility on top fragments the system.

---

## Font family

`--font-sans: 'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, sans-serif` — single typeface for all UI. All body, labels, and headings use this family. The composite utilities set `font-family: var(--font-sans)` implicitly; there is no second face for non-code text.

Mono contexts (`typography-meta`, `typography-code`) use `--font-mono: 'IBM Plex Mono', ui-monospace, monospace`, but these are non-composite-scale roles outside the three-size canon above.

---

## Tabular figures

Apply `font-feature-settings: 'tnum' 1, 'lnum' 1` to all numeric table cells, metric tile values, and counters. Proportional figures cause column drift when a `1` is narrower than an `8` — tabular + lining numerals keep decimal points locked across rows.

The DS `Table` component's `mono` variant (`tableCellVariants.variant.mono`) applies this automatically via `[font-feature-settings:'tnum'_1,'lnum'_1]`. In `apps/` code, apply it explicitly when rendering numeric data outside a Table component:

```tsx
// outside a DS Table — apply explicitly
<span style={{ fontFeatureSettings: "'tnum' 1, 'lnum' 1" }}>
  {value.toFixed(2)}
</span>
```

---

## Off-scale (drift)

Each line below is a quotable FAIL trigger for the reviewer.

1. **Tailwind size utilities (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, etc.)** — `primitive.css` wipes these via `--text-*: initial`; the composite utilities are the only sanctioned size layer. Reaching for them is FAIL.
2. **Arbitrary size literals (`text-[14px]`, `text-[1rem]`, `leading-[20px]`, `text-[10px]`)** — already caught by reviewer §1 (Tailwind v4 arbitrary syntax rule); repeated here as a typography-specific cross-reference. FAIL.
3. **Independent `leading-*` or `tracking-*` on a composite parent** — the composite already sets both; overriding with `leading-5` or `tracking-tight` fragments the system and creates silent drift when the token value changes. FAIL.
4. **Weights other than 400 / 600 at consumer call sites** (`font-medium` / weight 500, `font-bold` / weight 700) — only `font-weight-regular` and `font-weight-semibold` are the sanctioned consumer weights. FAIL.
5. **Redundant `typography-body` on a descendant when the ancestor already declares it** — `body` inherits `typography-body` from `base.css`; redeclaring it on a child adds noise without effect. Apply only to override the inherited default (heading, label, nav item, etc.). FAIL.

---

## Composition rule

Declare a composite utility **once at the parent of a typography zone**; descendants inherit. Override at a leaf only when the leaf has a different role (e.g. a `typography-code` mono fragment inside a table cell). See [`docs/conventions/typography-utility-usage.md`](../../conventions/typography-utility-usage.md) for the full pattern with worked examples (DS `Table`, app-layer inheritance, the `mono` leaf exception, and why role ≠ size).

---

## See also

- [`docs/product/personality.md`](../../product/personality.md) — spare + dense posture; exact vocabulary; why the scale is small on purpose
- [`docs/design/foundations/spacing.md`](./spacing.md) — sibling foundations doc; same design posture applied to space
- [`docs/conventions/typography-utility-usage.md`](../../conventions/typography-utility-usage.md) — inheritance pattern, two-layer model (DS vs app), role vs size rule, worked examples
- [`packages/ui/src/styles/primitive.css`](../../../../packages/ui/src/styles/primitive.css) — token declarations (`@theme {}` typography block, `--typography-*`, `--font-weight-*`, `--font-sans`, `--font-mono`)
- [`packages/ui/src/styles/utilities.css`](../../../../packages/ui/src/styles/utilities.css) — composite utility definitions (`@utility typography-display`, `typography-subtitle`, `typography-body`)
