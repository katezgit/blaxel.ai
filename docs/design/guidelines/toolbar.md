# Toolbar layout

**Scope:** Project-agnostic guidelines for B2B / enterprise SaaS dashboards. Component names referenced (`SegmentedControl`, `FilterPopover`, `Select`, `Input`, `Button`) assume a design-system layer — substitute your own primitives if names differ.

The horizontal control row that sits **above a table or grid** to search, filter, segment, or refine its contents. Every list/index page in the dashboard has one. Order is locked here — if you find yourself wanting to deviate, surface a counter-example to this doc instead of shipping the deviation.

---

## The rule — two anchors, gap in the middle

```
[ Search ]                       [ Segment / Tabs ] [ Filter chips ] [ Refinement (Type / Sort) ]
   LEFT ANCHOR                                                                       RIGHT ANCHOR
   one element                   in this internal order, packed tight
```

**Search anchors LEFT. Everything else anchors RIGHT.** The space between expands and contracts with viewport width — search never gets pushed off-center, refinements never collide with search.

Why split: search is a *primary* affordance (highest frequency, identifies a known target). Segments, filters, and refinements are *secondary* (modulate what the user is looking at). Putting them at opposite anchors gives each a stable home and prevents the toolbar from turning into a left-packed strip where every new control nudges everything else.

Within the right-anchor group, internal order is **fixed**: Segment / Tabs → Filter chips → Refinement controls. This is the same primary-to-tertiary ordering as before, just inside the right cluster.

Page-level CTAs (Invite, Create, New, …) do **NOT** live in the toolbar — they sit in the page heading row, top-right of the `<h1>`. See § Page-level CTA placement.

---

## Where each element goes

| Anchor | Position within anchor | Element | Examples |
|---|---|---|---|
| **LEFT** | only | **Search** input. Single. Always present if the page has >5 items. `max-w-xs` so it doesn't dominate. | "Search members", "Search integrations", "Search keys" |
| **RIGHT** | leftmost in cluster | **Segment / Tabs** (taxonomy — mutually-exclusive buckets). At most one per toolbar. Use the design-system `SegmentedControl`. | All / Enabled / Disabled |
| **RIGHT** | middle of cluster | **Filter chips** (any number, any order among themselves). Each is a popover with a checkbox list + count. Use the design-system `FilterPopover`. | Role / Source / Status |
| **RIGHT** | rightmost in cluster | **Refinement controls** — type filter (Select), sort, columns, density. | Type filter |

If a slot is empty, the slot collapses — do NOT add empty placeholders to "keep the layout."

## Implementation pattern

```tsx
<div className="flex flex-wrap items-center gap-2">
  <Input placeholder="Search …" leading={<Search />} className="max-w-xs" />

  <div className="ml-auto flex flex-wrap items-center gap-2">
    <SegmentedControl … />
    <FilterPopover … />
    <FilterPopover … />
    <Select … />
  </div>
</div>
```

`ml-auto` on the right cluster pushes it to the far edge while leaving the search alone. At narrow viewports the wrap is graceful — the right cluster drops to a new line and stays right-aligned within that line.

---

## Page-level CTA placement

CTAs that create the primary resource of the page (Invite, Create, New, +) sit in the **page heading row**, top-right of the `<h1>`, NOT in the toolbar. Pattern:

```tsx
<div className="flex items-start justify-between gap-4">
  <header className="page-header">
    <h1>Members</h1>
    <p>People with access to this workspace…</p>
  </header>
  <Button variant="primary" onClick={…}>
    <Plus /> Invite
  </Button>
</div>

<div className="flex flex-wrap items-center gap-2">
  {/* toolbar — search + filters only */}
</div>
```

Why: the CTA is a page-level action, not a list-refinement action. Co-locating with the page title gives it the same weight as the page itself and reserves the toolbar for "narrow this list." This also prevents the toolbar from growing into a multi-purpose strip that has to be re-balanced every time a control is added.

---

## Bulk-action bar (selection-driven)

When the user selects table rows, a **bulk-action bar** appears **above the table, below the toolbar**. Layout:

```
[ N selected · Clear ]                              [ Bulk action · Bulk action ]
   LEFT                                                RIGHT
```

- Left: selection count + "Clear" (always present — never trap the user in a selection).
- Right: the bulk verbs (Change role, Remove, Delete, …). Destructive verbs use `variant="destructive-ghost"` or `variant="destructive"`.

The bar is its own row, not folded into the toolbar — the toolbar stays stable while the bar appears/disappears.

---

## Responsive

Single row at `sm+`. Wraps to multiple rows at `<sm` via `flex flex-wrap items-center gap-2`. The wrap order matches the LTR rule above — search wraps to its own line first, segments and filters follow. No conditional reordering by breakpoint.

**Segmented control on narrow + tablet viewports.** Four-segment controls with verbose labels (multi-word options like "Directory sync" or "Identity provider") wrap or truncate ugly anywhere below desktop. Default rule: at `<lg` (`< 1024px` — phone + tablet + small laptop), swap the segment for a `Select` dropdown that drives the same state. Switch to `SegmentedControl` at `lg+` (≥ 1024px), where the row has the horizontal real estate.

Render both — `className="lg:hidden"` on the select, `className="hidden lg:inline-flex"` on the segment. State is shared, so the active value persists when the viewport crosses the breakpoint.

```tsx
<Select value={category} onValueChange={setCategory}>
  <SelectTrigger className="w-40 lg:hidden" aria-label="…">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>{/* same options */}</SelectContent>
</Select>

<SegmentedControl
  value={category}
  onValueChange={setCategory}
  className="hidden lg:inline-flex"
  aria-label="…"
>
  {/* same options */}
</SegmentedControl>
```

Why `lg` (1024) and not `md` (768): a 4-segment control + search + type-filter needs ~1000px to sit on one row without wrapping. At `md` (768–1023), the toolbar wraps the right cluster onto a second line, leaving search alone at top and creating an orphan-row that looks broken. The Select pattern carries the entire range below 1024 cleanly.

**Don't use `flex-wrap` on the toolbar outer.** Wrapping + `ml-auto` produces the orphan-row state above. Use `flex items-center gap-2` (single-row only). The Select-collapse rule above keeps elements within the row budget at every supported viewport — wrap should be impossible by construction. If you find yourself reaching for `flex-wrap`, swap an element to a Select instead.

---

## Why "Columns" toggles are banned

A column-visibility dropdown signals "we don't know what the user needs to see." Decide column relevance at design time. If a column is conditional, drive visibility from page state (role, scope, density mode), not from a per-user toggle that everyone has to discover.

The single Columns exception: when a table has 8+ columns and the user genuinely needs to suppress some for screen-reader / printing / export. Most dashboard tables do not meet this bar.

---

## Sort

Sort lives on **column headers**, not in the toolbar. Click the header to cycle unsorted → asc → desc → unsorted. Active column shows the arrow; inactive columns show a faint ↕ on hover.

For non-alphabetical orderings (e.g. Role: Owner > Admin > Member; Status: Pending > Expired > Accepted) define a `sortingFn` on the column and document the rank in code. Default page sort = "what does the user want to see first" — name A→Z for people lists, Created desc for resource lists.
