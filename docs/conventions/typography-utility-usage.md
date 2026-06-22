# Typography Utility Usage

## The two layers

### DS layer (`packages/ui/`)

Components own their typography contract. Declare the role utility (`typography-body`, `typography-label`, …) explicitly inside the component.

**Why.** DS primitives ship as portable artifacts; they cannot assume the consumer's base context. The utility must be present on the element regardless of where the component renders.

**Worked example — Table.** `tableHeadVariants` declares `typography-label` for headers (12px, form-label role). `tableCellVariants` declares `typography-body` for cells (14px, primary reading contract). Both are intentional and consistent across any consumer context.

### App layer (`apps/portal/` and future apps)

`body` inherits `typography-body` from `packages/ui/src/styles/base.css`:

```css
body {
  font-size: var(--typography-body);
  /* … */
}
```

At call sites, **do not re-declare `typography-body`**. Add a role utility only when overriding the inherited default — a heading (`typography-display`, `typography-subtitle`), a nav label (`typography-label`), metadata (`typography-meta`), etc.

**Exception — form controls.** `<input>`, `<textarea>`, and `<button>` elements with custom shell styling: the UA stylesheet overrides CSS inheritance for these elements, so `typography-body` is load-bearing and must be declared explicitly.

---

## Role ≠ size

`typography-label`, `typography-meta`, `typography-code`, `typography-caption` name a typography **role**, not just a pixel size. Two roles may share a metric value; they are not interchangeable.

A nav label rendered at 12px is still a "label" role — use `typography-label`. Do not pick a role utility by pixel match; pick by role intent. The design system evolves role values independently; consumers that aliased by size will drift silently.

---

## Why we don't use `text-*` for typography

Tailwind's `text-*` namespace is overloaded: it covers color (`text-foreground`), font-size (`text-sm`), alignment (`text-center`), and decoration (`text-underline`). Custom `text-*` typography utilities collided with `text-{color}` inside `cn()` — `tailwind-merge` classified them both as the `font-size` group by default, causing silent class drops.

The `typography-*` namespace removes this collision structurally. `cn.ts` no longer needs `extendTailwindMerge` config; future contributors cannot accidentally re-introduce the silent-drop bug.

---

## Quick reference

| Utility | Size | Typical use |
|---|---|---|
| `typography-display` | 24px | Page / hero headings |
| `typography-subtitle` | 16px | Dialog / drawer / sheet / section headings |
| `typography-body` | 14px | Primary reading size |
| `typography-label` | 12px | Form labels, nav labels |
| `typography-caption` | 12px | Supporting labels, metadata |
| `typography-meta` | 10px, mono, uppercase + tracking | Column headers, timestamps, status pips |
| `typography-code` | 12px, mono | Inline / block code fragments |
| `typography-table-header` | 10px, sans, medium, uppercase | DS table headers (legacy role; DS Table currently uses `typography-label`) |

---

## See also

- [`docs/conventions/tailwind-v4.md`](./tailwind-v4.md) — token-form precedence rules (rank 1 utility → rank 2 `prop-(--x)` → rank 3 arbitrary for font-size only)
- [`docs/design/foundations/spacing.md`](../design/foundations/spacing.md) — spacing canon and composition cheatsheet
