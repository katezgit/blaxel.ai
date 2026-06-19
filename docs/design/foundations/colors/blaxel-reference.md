# Blaxel Palette Source Reference

This file is the source-of-truth palette evidence captured from the live blaxel.ai product and used as the migration reference during DS build (PR #4). Neither palette below is our DS — they are the upstream receipts we migrated against. Our actual tokens live in `packages/ui/src/styles/primitive.css` (primitives) and `packages/ui/src/styles/theme.css` (semantic mappings). Existing DS color documentation lives alongside this file in `docs/design/foundations/colors/`.

---

## Source A — Blaxel main-app palette

Provenance: Captured from blaxel.ai DevTools by operator on 2026-06-19, PR #4 migration session. Four groups below are verbatim; no values altered or interpreted.

### Group A1 — iubenda cookie banner tokens

Operator note: ignore as theme source — included for provenance completeness.

```css
:root {
    --iub-bg: #ffffff;
    --iub-bg-overlay: rgba(18, 18, 23, .4);
    --iub-body-bg: #ffffff;
    --iub-border: #e4e4eb;
    --iub-text: #121217;
    --iub-text-muted: #6d6d88;
    --iub-primary: #f0642d;
    --iub-primary-hover: #d95525;
    --iub-primary-border: #f38053;
    --iub-primary-fg: #ffffff;
    --iub-secondary-bg: #f7f7f8;
    --iub-link: #f0642d;
    --iub-granular-background: rgba(18, 18, 23, .04);
    --iub-granular-border: #e4e4eb;
    --iub-granular-toggle-background: rgba(18, 18, 23, .2);
}

.dark {
    --iub-bg: #1b1b22;
    --iub-bg-overlay: rgba(0, 0, 0, .6);
    --iub-body-bg: #121217;
    --iub-border: #363644;
    --iub-text: #ffffff;
    --iub-text-muted: #9999ad;
    --iub-primary: #f0642d;
    --iub-primary-hover: #d95525;
    --iub-primary-border: #f38053;
    --iub-primary-fg: #ffffff;
    --iub-secondary-bg: #121217;
    --iub-link: #f38053;
    --iub-granular-background: rgba(255, 255, 255, .04);
    --iub-granular-border: #363644;
    --iub-granular-toggle-background: rgba(255, 255, 255, .25);
}
```

### Group A2 — v2 light-mode semantic mappings (the modern v2 design system)

```css
.light {
    --v2-gray-white: var(--v2-gray-4);
    --v2-gray-blackish: var(--v2-gray-96);
    --v2-gray-overlay-primary: var(--v2-gray-100);
    --v2-gray-overlay-secondary: var(--v2-gray-94);
    --v2-gray-overlay-tertiary: var(--v2-gray-90);
    --v2-gray-muted-dark: var(--v2-gray-76);
    --v2-gray-muted-regular: var(--v2-gray-52);
    --v2-gray-muted-light: var(--v2-gray-40);
    --v2-blaxel-orange-bright: var(--v2-blaxel-orange-56);
    --v2-blaxel-orange-primary: var(--v2-blaxel-orange-56);
    --v2-blaxel-blue-primary: var(--v2-blue-56);
    --v2-blaxel-green-primary: var(--v2-lime-green-30);
    --v2-blaxel-green-muted: var(--v2-lime-green-30);
    --v2-blaxel-green-overlay: var(--v2-lime-green-90);
    --v2-blaxel-yellow-primary: oklch(.466 .122 102.4);
    --v2-text-primary: var(--v2-gray-white);
    --v2-text-secondary: var(--v2-gray-40);
    --v2-border-regular: var(--v2-gray-overlay-secondary);
    --v2-border-light: var(--v2-gray-overlay-tertiary);
    --v2-border-xlight: var(--v2-gray-88);
    --v2-surface-overlay-primary: var(--v2-gray-overlay-primary);
    --v2-surface-overlay-secondary: var(--v2-gray-overlay-secondary);
    --v2-surface-overlay-tertiary: var(--v2-gray-overlay-tertiary);
    --v2-surface-card-nested: var(--v2-gray-96);
    --v2-surface-card-nested-hover: var(--v2-gray-94);
    --v2-surface-1: #ffffff;
    --v2-surface-2: #ffffff;
    --v2-surface-3: #ffffff;
    --v2-surface-4: #ffffff;
    --v2-surface-5: #ffffff;
    --v2-surface-6: #ffffff;
    --v2-surface-7: #ffffff;
    --v2-surface-8: #ffffff;
    --v2-surface-1-shadow: 0 0 0 1px rgba(9, 9, 11, .06);
    --v2-surface-2-shadow: 0 0 0 1px rgba(9, 9, 11, .06), 0 1px 1px -.5px rgba(9, 9, 11, .06);
    --v2-surface-3-shadow: 0 0 0 1px rgba(9, 9, 11, .06), 0 1px 1px -.5px rgba(9, 9, 11, .06), 0 3px 3px -1.5px rgba(9, 9, 11, .06);
    --v2-surface-4-shadow: 0 0 0 1px rgba(9, 9, 11, .06), 0 1px 1px -.5px rgba(9, 9, 11, .06), 0 3px 3px -1.5px rgba(9, 9, 11, .06), 0 6px 6px -3px rgba(9, 9, 11, .06);
    --v2-surface-5-shadow: 0 0 0 1px rgba(9, 9, 11, .06), 0 1px 1px -.5px rgba(9, 9, 11, .06), 0 3px 3px -1.5px rgba(9, 9, 11, .06), 0 6px 6px -3px rgba(9, 9, 11, .06), 0 12px 12px -6px rgba(9, 9, 11, .06);
    --v2-surface-6-shadow: 0 0 0 1px rgba(9, 9, 11, .06), 0 1px 1px -.5px rgba(9, 9, 11, .06), 0 3px 3px -1.5px rgba(9, 9, 11, .06), 0 6px 6px -3px rgba(9, 9, 11, .06), 0 12px 12px -6px rgba(9, 9, 11, .06), 0 24px 24px -12px rgba(9, 9, 11, .06);
    --v2-surface-7-shadow: 0 0 0 1px rgba(9, 9, 11, .06), 0 1px 1px -.5px rgba(9, 9, 11, .06), 0 3px 3px -1.5px rgba(9, 9, 11, .06), 0 6px 6px -3px rgba(9, 9, 11, .06), 0 12px 12px -6px rgba(9, 9, 11, .06), 0 24px 24px -12px rgba(9, 9, 11, .06), 0 48px 48px -24px rgba(9, 9, 11, .06);
    --v2-surface-8-shadow: 0 0 0 1px rgba(9, 9, 11, .06), 0 1px 1px -.5px rgba(9, 9, 11, .06), 0 3px 3px -1.5px rgba(9, 9, 11, .06), 0 6px 6px -3px rgba(9, 9, 11, .06), 0 12px 12px -6px rgba(9, 9, 11, .06), 0 24px 24px -12px rgba(9, 9, 11, .06), 0 48px 48px -24px rgba(9, 9, 11, .06), 0 96px 96px -48px rgba(9, 9, 11, .06);
    --v2-select-trigger-surface: var(--v2-surface-3);
    --v2-select-trigger-surface-hover: var(--v2-surface-4);
    --v2-select-menu-surface: var(--v2-surface-5);
    --v2-select-menu-header-surface: var(--v2-gray-98);
    --v2-select-menu-header-highlight: none;
    --v2-select-trigger-shadow: var(--v2-surface-3-shadow);
    --v2-select-trigger-shadow-hover: var(--v2-surface-4-shadow);
    --v2-select-trigger-shadow-focus: 0 0 0 1px var(--v2-blaxel-blue-primary), 0 0 0 3px color-mix(in srgb, var(--v2-blaxel-blue-primary) 18%, transparent), var(--v2-surface-3-shadow);
    --v2-select-menu-shadow: var(--v2-surface-5-shadow);
    --v2-progress-track: var(--v2-gray-overlay-tertiary);
}
```

### Group A3 — v2 raw OKLCH gray ramp (gray-4 deepest → gray-100 white)

Operator note: "Show all properties (151 more)" was visible in DevTools — only the lime-green first step (`--v2-lime-green-4: oklch(.156 .018 168.649)`) was captured before the window cut off. Remaining lime-green / blue / orange / yellow ramps are truncated and not present in this dump.

```css
:root {
    --v2-gray-4: oklch(.141 .004 285.823);
    --v2-gray-6: oklch(.165 .006 285.697);
    --v2-gray-8: oklch(.185 .01 285.365);
    --v2-gray-10: oklch(.207 .01 285.508);
    --v2-gray-12: oklch(.225 .014 285.265);
    --v2-gray-14: oklch(.247 .015 285.243);
    --v2-gray-16: oklch(.264 .017 285.201);
    --v2-gray-18: oklch(.285 .018 285.189);
    --v2-gray-20: oklch(.302 .022 285.04);
    --v2-gray-22: oklch(.322 .021 285.15);
    --v2-gray-24: oklch(.339 .024 285.023);
    --v2-gray-26: oklch(.358 .026 285.025);
    --v2-gray-28: oklch(.374 .027 285.009);
    --v2-gray-30: oklch(.393 .029 285.012);
    --v2-gray-32: oklch(.412 .03 285.015);
    --v2-gray-34: oklch(.428 .031 285.002);
    --v2-gray-36: oklch(.446 .033 285.005);
    --v2-gray-38: oklch(.462 .036 284.924);
    --v2-gray-40: oklch(.48 .035 284.997);
    --v2-gray-42: oklch(.495 .038 284.923);
    --v2-gray-44: oklch(.513 .039 284.929);
    --v2-gray-46: oklch(.527 .041 284.922);
    --v2-gray-48: oklch(.545 .042 284.928);
    --v2-gray-50: oklch(.559 .045 284.866);
    --v2-gray-52: oklch(.579 .041 285.042);
    --v2-gray-54: oklch(.599 .039 285.152);
    --v2-gray-56: oklch(.615 .038 285.245);
    --v2-gray-58: oklch(.635 .036 285.338);
    --v2-gray-60: oklch(.654 .032 285.468);
    --v2-gray-62: oklch(.671 .032 285.497);
    --v2-gray-64: oklch(.69 .029 285.612);
    --v2-gray-66: oklch(.709 .027 285.679);
    --v2-gray-68: oklch(.724 .026 285.737);
    --v2-gray-70: oklch(.743 .024 285.795);
    --v2-gray-72: oklch(.762 .023 285.85);
    --v2-gray-74: oklch(.778 .021 285.898);
    --v2-gray-76: oklch(.796 .02 285.946);
    --v2-gray-78: oklch(.815 .017 286.023);
    --v2-gray-80: oklch(.83 .017 286.032);
    --v2-gray-82: oklch(.848 .014 286.103);
    --v2-gray-84: oklch(.866 .012 286.14);
    --v2-gray-86: oklch(.882 .011 286.174);
    --v2-gray-88: oklch(.9 .009 286.208);
    --v2-gray-90: oklch(.917 .007 286.266);
    --v2-gray-92: oklch(.932 .007 286.269);
    --v2-gray-94: oklch(.95 .004 286.323);
    --v2-gray-96: oklch(.968 .003 286.35);
    --v2-gray-98: oklch(.982 .001 286.375);
    --v2-gray-100: oklch(1 0 0);
    /* TRUNCATED — operator DevTools window cut off here; lime-green ramp first step only: */
    /* --v2-lime-green-4: oklch(.156 .018 168.649); */
    /* Remaining lime-green / blue / orange / yellow ramps not captured. */
}
```

### Group A4 — legacy shadcn-style .dark block (the current dashboard's actual dark mode)

Operator note: "Show all properties (10 more)" was visible in DevTools — last 10 properties of this block were not captured. Block is truncated.

```css
.dark {
    --blaxel: 21 79% 44%;
    --blaxel-foreground: 0 0% 100%;
    --blaxel-hover: 17 87% 55%;
    --revisions: 199 95% 74%;
    --production: 165 33% 7%;
    --production-foreground: 171 55% 37%;
    --development: 47 100% 7%;
    --development-foreground: 31 83% 41%;
    --main-background: 240 10% 4%;
    --onboarding: 240 18% 12%;
    --background: 240 10% 4%;
    --foreground: 0 0% 100%;
    --card: 240 11% 8%;
    --card-foreground: 238 5% 90%;
    --popover: 240 10% 4%;
    --popover-foreground: 238 5% 90%;
    --primary: 21 79% 44%;
    --primary-foreground: 0 0% 100%;
    --secondary: 347 30% 10%;
    --secondary-foreground: 0 0% 100%;
    --muted: 200 16% 15%;
    --muted-foreground: 238 5% 60%;
    --accent: 238 16% 10%;
    --accent-foreground: 238 5% 90%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 238 5% 90%;
    --border: 240, 11%, 14%;
    --border-foreground: 238 20% 18%;
    --input: 238 20% 18%;
    --ring: 238 0% 0%;
    --radius: .5rem;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 10% 4%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
    --debug: 210 100% 60%;
    --info: 142 76% 46%;
    --warning: 38 92% 60%;
    --error: 0 84% 70%;
    --fatal: 0 84% 70%;
    --unknown: 238 5% 60%;
    /* TRUNCATED — operator DevTools "Show all properties (10 more)" not captured. */
}
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
