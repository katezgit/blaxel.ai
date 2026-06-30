# Spacing — Context Catalog

Planning / checklist artifact. Enumerates every spacing context a B2B / dashboard product UI typically renders. Use it two ways:

1. **New project.** Read the list to know what spacing decisions are coming. Pick which categories the new product hits, decide values, document in the project's `spacing.md`.
2. **This project.** Status column is the gap analysis. Filter to **Partial** and **Open** — those are open rules. Pick the highest-frequency contexts first (form controls before stat cards in a settings-heavy product).

`spacing.md` is where the *rules* live; this catalog is where the *universe of contexts* lives. Rules without a catalog entry are orphans; catalog entries without rules are gaps.

**Status legend.**
- **Done** — rule documented (cite the doc + section in column 3)
- **Partial** — value exists in code or in a component spec but not codified as a cross-cutting rule
- **Open** — no rule yet

Categories ordered atomic → composite → page-level → layout-level. Within a category, ordered by frequency.

---

## 1. Inline atoms

| Context | Status | Where |
|---|---|---|
| Icon ↔ label (small icon, 12–14px) | Done | `spacing.md` → Inline (`gap-1.5`) |
| Icon ↔ label (standard icon, 16px) | Done | `spacing.md` → Inline (`gap-2`) |
| Badge ↔ dot, or sibling badge | Done | `spacing.md` → Inline (`gap-2`) |
| Title ↔ description (single header unit; h1/h2/h3) | Done | `spacing.md` → Inline (`gap-1`) |
| Slug ↔ copy button (inline group) | Done | `header-rhythm.md` (`gap-0`) |
| Inline metadata separator gap (`·` between items) | Done | `header-rhythm.md` (`gap-2`) |
| Avatar ↔ name | Open | — |
| Chip / tag sibling gap | Open | — |
| Status pill ↔ sibling text | Open | — |

## 2. Form controls

| Context | Status | Where |
|---|---|---|
| Label ↔ control (text input, select) | Done | `spacing.md` → Forms (`gap-1.5`) |
| Control ↔ help / description text | Done | `spacing.md` → Forms (`gap-1`) |
| Control ↔ inline error message | Done | `spacing.md` → Forms (`gap-1`) |
| Required / optional inline marker next to label | Done | `spacing.md` → Forms (`gap-1`) |
| Checkbox / radio ↔ its label (horizontal) | Done | `spacing.md` → Forms (`gap-2`) |
| Choice group items vertical stack | Done | `spacing.md` → Forms (`gap-2` / `gap-3`) |
| Inline field siblings (multi-column row) | Done | `spacing.md` → Forms (`gap-4`) |
| Field ↔ field (single column) | Done | `spacing.md` → Forms (`gap-4`) |
| Field group ↔ field group | Done | `spacing.md` → Forms (inherits section rule) |
| Form section heading ↔ first field | Done | `spacing.md` → Forms (`gap-6`) |
| Last field ↔ actions row | Done | `spacing.md` → Forms (`gap-6`) |
| Actions row button gap | Done | `spacing.md` → Forms (`gap-2`) |
| Input internal padding — horizontal | Done | `spacing.md` → Canon `spacing-3` (`px-3`) |
| Input internal padding — vertical | Done | `spacing.md` → Canon `spacing-2` (`p-2`) |
| Textarea internal padding (multi-line) | Open | — |
| File input drop-zone padding | Open | — |
| Switch ↔ its label | Open | — |
| Switch group items vertical stack | Open | — |
| Slider thumb ↔ track label | Open | — |

## 3. Buttons & button groups

| Context | Status | Where |
|---|---|---|
| Button icon ↔ label | Done | `spacing.md` → Canon `spacing-1.5` |
| Button group sibling gap (in actions row) | Done | `spacing.md` → Forms (`gap-2`) |
| Segmented control item gap | Open | — |
| Button internal padding (sm / md / lg) | Partial | (in `Button` component, not in `spacing.md`) |
| Icon-button square padding | Partial | (in `IconButton` component, not in `spacing.md`) |

## 4. Cards & panels

| Context | Status | Where |
|---|---|---|
| Card internal padding — compact | Done | `spacing.md` → Cards (`p-4`) |
| Card internal padding — spacious | Done | `spacing.md` → Cards (`p-6`) |
| Card title ↔ description | Done | `spacing.md` → Inline (title ↔ description rule) |
| Card header ↔ body | Open | — |
| Card body ↔ footer | Open | — |
| Card ↔ card stacking (list of cards) | Done | `spacing.md` → Page (section rule, card-contained 24px) |
| Section within panel | Done | `spacing.md` → Cards (`gap-6`) |
| Block within section (inside panel) | Done | `spacing.md` → Cards (`gap-4`) |
| Panel border ↔ first content row | Open | (likely subsumed by internal padding — verify per panel) |

## 5. Navigation & chrome

| Context | Status | Where |
|---|---|---|
| Topbar internal padding (horizontal, vertical) | Partial | `app-shell-layout.md` (height defined; padding implicit) |
| Topbar bottom ↔ page header top | Done | `page-shell` utility (`pt-8`, 32px) |
| Sidebar item internal padding | Partial | (in sidebar component) |
| Sidebar item ↔ item vertical gap | Open | — |
| Sidebar group ↔ group | Open | — |
| Sidebar group heading ↔ first item | Open | — |
| Sidebar collapsed-width icon centering | Open | — |
| Breadcrumb segment gap (between crumbs) | Open | — |
| Breadcrumb ↔ page heading block | Done | `spacing.md` → Detail page header rhythm (`gap-3`) |
| Tab triggers ↔ tab panel | Done | `spacing.md` → Tabs (`gap-6`) |
| Tab trigger sibling gap (within tab list) | Partial | `tabs.tsx` (`gap-0.5`, not codified) |
| Pagination control items gap | Open | — |
| Sub-shell secondary nav ↔ primary nav | Open | — |

## 6. Page anatomy

| Context | Status | Where |
|---|---|---|
| Page edge ↔ content (horizontal gutter) | Partial | `app-shell-layout.md` (defined per breakpoint) |
| Topbar bottom ↔ page header top | Done | `page-shell` (`pt-8`, 32px) |
| Breadcrumb ↔ page heading block | Done | `spacing.md` → Detail page header rhythm |
| H1 ↔ description / metadata row | Done | `spacing.md` → Detail page header rhythm (`gap-1`) |
| Heading block ↔ first content block | Done | `spacing.md` → Detail page header rhythm (`gap-6`) |
| Major regions (header→content, content→sidebar) | Done | `spacing.md` → Page (`gap-8`) |
| Sections within a region — flat | Done | `spacing.md` → Page (`gap-8`) |
| Sections within a region — card-contained | Done | `spacing.md` → Page (`gap-6`) |
| Blocks within a section | Done | `spacing.md` → Page (`gap-4`) |
| Bottom-of-page padding | Done | `page-shell` (`pb-16`, 64px) |
| Page-level CTA ↔ H1 (horizontal, top-right) | Partial | `toolbar.md` § Page-level CTA placement |
| Section h2 ↔ section description | Done | `spacing.md` → Inline (title ↔ description rule) |

## 7. Lists & tables

| Context | Status | Where |
|---|---|---|
| Toolbar ↔ table content | Done | `spacing.md` → Tables (`gap-4`) |
| Toolbar items horizontal gap (search, filters, segment) | Done | `toolbar.md` (`gap-2`) |
| Bulk-action bar ↔ toolbar | Partial | `toolbar.md` (layout; value implicit) |
| Bulk-action bar ↔ table | Partial | `toolbar.md` (layout; value implicit) |
| Table header band ↔ first row | Open | (component-level; `components/table/spec.md`) |
| Row vertical padding (density) | Partial | `components/table/spec.md` § Cell heights |
| Cell horizontal padding | Partial | `components/table/spec.md` |
| Numeric column right-alignment offset | Partial | `components/table/spec.md` § Numeric alignment |
| Sticky header offset (under topbar) | Open | — |
| Empty-state vertical padding (zero / no-results) | Done | `tables.md` (`py-12`, 48px) |
| Pagination row ↔ table | Open | — |
| Definition-list label column width / gap | Open | — |

## 8. Modals, dialogs, overlays

| Context | Status | Where |
|---|---|---|
| Dialog internal padding (header) | Open | — |
| Dialog internal padding (body) | Open | — |
| Dialog internal padding (footer) | Open | — |
| Dialog header ↔ body | Open | — |
| Dialog body ↔ footer | Open | — |
| Dialog title ↔ description | Done | Title ↔ description rule |
| Dialog actions row button gap | Done | Inherits Forms actions row (`gap-2`) |
| Dropdown menu item padding | Done | `spacing.md` → Canon `spacing-1.5` |
| Dropdown section divider gap | Open | — |
| Dropdown leading icon ↔ label | Open | (likely Inline icon rule) |
| Popover internal padding | Open | — |
| Tooltip internal padding | Open | — |
| Sheet / drawer internal padding | Open | — |
| Sheet header ↔ body ↔ footer rhythm | Open | — |
| Command palette item padding | Open | — |

## 9. Notifications & feedback

| Context | Status | Where |
|---|---|---|
| Alert icon ↔ content | Done | `spacing.md` → Canon `spacing-3` |
| Alert title ↔ body | Open | (likely title ↔ description rule — confirm) |
| Alert ↔ trailing action button | Open | — |
| Toast internal padding | Open | — |
| Toast stacking gap (between siblings) | Open | — |
| Toast icon ↔ content | Open | (likely Alert rule) |
| Banner internal padding | Open | — |
| Banner ↔ surrounding content | Open | — |
| Inline status indicator (dot + label) | Done | Inline badge↔dot rule |

## 10. Data display

| Context | Status | Where |
|---|---|---|
| Stat card / KPI internal padding | Open | — |
| Stat label ↔ value | Open | — |
| Stat value ↔ trend indicator | Open | — |
| Stat card ↔ stat card (in a grid) | Open | — |
| Definition-list term ↔ description | Open | — |
| Key-value pair vertical stacking (Details panel) | Open | — |
| Chart legend ↔ chart | Open | — |
| Chart axis label ↔ axis | Open | — |
| Code block internal padding | Open | — |
| Code block ↔ surrounding prose | Open | — |

## 11. Wizard / multi-step

| Context | Status | Where |
|---|---|---|
| Stepper item sibling gap (horizontal) | Open | — |
| Stepper ↔ step body | Open | — |
| Step body ↔ navigation row (Back / Next) | Open | — |
| Step description ↔ step content | Open | — |

## 12. Empty, error, loading state surfaces

| Context | Status | Where |
|---|---|---|
| State icon ↔ title | Open | — |
| State title ↔ subtitle | Done | Title ↔ description rule |
| State subtitle ↔ CTA | Open | — |
| State block vertical padding (table-internal) | Done | `tables.md` (`py-12`) |
| State block vertical padding (full-page) | Open | — |
| Skeleton row vertical gap (between skeletons) | Open | — |
| Loading spinner ↔ surrounding content | Open | — |

---

## How to use this catalog

**Starting a new project.** Walk top to bottom. For each row whose context the new product will render, decide the value (using the rhythm theory in `spacing-rationale.md`) and add it to the project's `spacing.md` composition cheatsheet under the matching group. Skip categories the product doesn't render — a CLI tool drops most of Navigation chrome; a single-table dashboard drops Wizard.

**Auditing this project.** Filter to **Partial** and **Open** rows. Prioritize by frequency of occurrence in the product's surfaces — a SaaS dashboard hits Form, Page anatomy, and Tables on nearly every screen; Wizard might only appear once.

**Extending the catalog.** Discovered a new context type mid-build → add a row. Status starts at **Open**. When the rule lands in `spacing.md`, flip to **Done**. The catalog is the source of truth for *what to think about*; rules live in `spacing.md`.

**Promoting Partial → Done.** Partial means "a value exists somewhere but isn't codified as a cross-cutting rule." To promote, either (a) extract the value to `spacing.md` if it's reused across components, or (b) accept it as component-local and update the catalog row to point at the component spec as authoritative.
