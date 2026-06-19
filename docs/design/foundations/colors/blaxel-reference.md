# Blaxel Palette Source Reference

This file is the source-of-truth palette evidence captured from the live blaxel.ai product and used as the migration reference during DS build (PR #4). Neither palette below is our DS — they are the upstream receipts we migrated against. Our actual tokens live in `packages/ui/src/styles/primitive.css` (primitives) and `packages/ui/src/styles/theme.css` (semantic mappings). Existing DS color documentation lives alongside this file in `docs/design/foundations/colors/`.

---

## Source A — Blaxel main-app palette

> **Source A is missing from disk.** The operator pasted this CSS dump (the `--v2-*` OKLCH gray ramp, `.light { --iub-primary … }`, and `.dark { --blaxel: 21 79% 44%; --background: 240 10% 4%; … }` blocks) directly in the prior session conversation but it was never written to a file before the session ended. The mapping table below reconstructs the key values from DS comments in `primitive.css` and `theme.css`, which were written against this source. **Re-paste Source A when available so this block can be replaced with the verbatim DevTools dump.**

Provenance: Captured from blaxel.ai DevTools by operator on 2026-06-19, PR #4 migration session. Verbatim dump pending re-paste.

Known anchor values (reconstructed from DS comments — not a substitute for the verbatim dump):

```
/* Brand */
--iub-primary: #f0642d                      (light fill)
--iub-primary-hover: (approx #D95525)       (light hover)
--iub-primary-border: (approx #F38053)      (light glow seed)

/* Dark semantic */
.dark --blaxel: hsl(21 79% 44%)             (≈ #C84711, primary dark)
.dark --blaxel-hover: hsl(17 87% 55%)       (≈ #F5743D)
.dark --primary: hsl(21 79% 44%)
.dark --background: hsl(240 10% 4%)

/* Gray ramp (OKLCH, --v2-* namespace) */
--v2-gray-4 through --v2-gray-100           (verbatim values pending)
```

---

## Source B — Blaxel docs/twoslash palette

Provenance: Captured from blaxel.ai docs site (twoslash code-tooltip library CSS) by operator on 2026-06-19, PR #4 migration session.

```css
/* Dark mode */
root.twoslash-dark, html.dark div.twoslash-dark, html.dark div.dark\:twoslash-dark {
    --twoslash-border-color: #222526;
    --twoslash-popup-bg: #151819;
    --twoslash-highlighted-border: #ffa50080;
    --twoslash-highlighted-bg: #ffa50030;
    --twoslash-unmatched-color: #aaa;
    --twoslash-cursor-color: #bbbb;
    --twoslash-error-color: #ff6b6b;
    --twoslash-error-bg: #ff6b6b30;
    --twoslash-warn-color: orange;
    --twoslash-warn-bg: #ffa50030;
    --twoslash-tag-color: #6bb6ff;
    --twoslash-tag-bg: #6bb6ff30;
    --twoslash-tag-warn-color: var(--twoslash-warn-color);
    --twoslash-tag-warn-bg: var(--twoslash-warn-bg);
    --twoslash-tag-annotate-color: #4ade80;
    --twoslash-tag-annotate-bg: #4ade8030;
}

/* Light mode */
:root {
    --twoslash-border-color: #dbdfde;
    --twoslash-underline-color: currentColor;
    --twoslash-popup-bg: #f3f7f6;
    --twoslash-popup-color: inherit;
    --twoslash-popup-shadow: #00000014 0px 1px 4px;
    --twoslash-code-font: inherit;
    --twoslash-code-font-size: 1em;
    --twoslash-matched-color: inherit;
    --twoslash-highlighted-border: #c37d0d50;
    --twoslash-highlighted-bg: #c37d0d20;
    --twoslash-unmatched-color: #888;
    --twoslash-cursor-color: #8888;
    --twoslash-error-color: #d45656;
    --twoslash-error-bg: #d4565620;
    --twoslash-warn-color: #c37d0d;
    --twoslash-warn-bg: #c37d0d20;
    --twoslash-tag-color: #3772cf;
    --twoslash-tag-bg: #3772cf20;
    --twoslash-tag-warn-color: var(--twoslash-warn-color);
    --twoslash-tag-warn-bg: var(--twoslash-warn-bg);
    --twoslash-tag-annotate-color: #1ba673;
    --twoslash-tag-annotate-bg: #1ba67320;
    --twoslash-text-size: .8rem;
    --twoslash-docs-tag-style: italic;
}
```

---

## Mapping table — Blaxel source → DS token (PR #4)

| DS token | Blaxel source value | Source |
|---|---|---|
| `--orange-700` / `--color-brand` | `--iub-primary: #f0642d` (light fill) | Source A |
| `--orange-800` | `--iub-primary-hover` ≈ `#D95525` (light hover) | Source A |
| `--orange-600` | `--iub-primary-border` ≈ `#F38053` (glow seed) | Source A |
| `--color-status-success` | `--twoslash-tag-annotate-color: #1ba673` | Source B (light) |
| `--color-status-warning` | `--twoslash-warn-color: #c37d0d` | Source B (light) |
| `--color-status-error` | `--twoslash-error-color: #d45656` | Source B (light) |
| `--color-status-info` | `--twoslash-tag-color: #3772cf` | Source B (light) |
