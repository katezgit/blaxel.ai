# Tables — Behavior + Composition

**Scope:** Project-agnostic guidelines for B2B / enterprise SaaS dashboards. Governs the behavior contract of a data table — what goes where in the columns, how the table responds to loading and empty states, when to add row selection, and which layout container shape to pick. Does NOT cover row click behavior (see `row-interaction.md`), above-table controls (see `toolbar.md`), or visual anatomy / tokens (see `components/table/spec.md`).

---

## 1. Column order — identity first, action last

| Position | Column type | Notes |
|---|---|---|
| 1 (leftmost) | Primary identifier — name, slug, label | Where the eye lands. Always first. |
| 2 | Status badge / state pill | Reads while the eye is still scanning identity. |
| 3…N-2 | Categorical attributes (type, owner, region) | Left-aligned text. |
| 3…N-2 | Numeric metrics (count, size, %, $) | Right-aligned, monospace, tabular figures (`tnum`). |
| N-1 | Timestamp (created, updated, last seen) | Near the end. ISO format, monospace. |
| N (rightmost) | Per-row action (kebab or trailing button) | Fixed width, no header label. |

**Rules:**
- **Identifier always leftmost.** No exceptions — moving identity off the left breaks scan order.
- **Status next to identifier when present.** State is half the meaning of "what is this row" — keep it adjacent to identity.
- **Numeric columns right-aligned + monospace + tabular figures.** Comparing magnitudes requires aligned place values.
- **Timestamp near the end, never first.** Time is meta-information; identity is the row.
- **Per-row action cell is the only column without a header label.** Width fixed to fit one icon button.

See `components/table/spec.md` § "Numeric alignment convention" for token-level enforcement.

---

## 2. Per-row action placement

Owned by `row-interaction.md` — the archetype determines what (if any) per-row action exists:

- **Archetype A (catalog):** inline `Connect` / `Manage` button is the sole affordance, no kebab.
- **Archetype B (resource):** kebab ONLY when a non-"open detail" fast action exists (Disable, Delete, Duplicate). Omit otherwise — row click does the work.
- **Archetype C (membership):** kebab always — contextual people-management actions (Change role, Resend invite, Remove).

**Column position:** rightmost, fixed width, no header label.

---

## 3. Loading state — skeleton rows, count preservation

### First load (no data yet)

- **Render skeleton rows in place of the data band.** Never replace the whole table with a centered spinner — the header band is part of the table's identity and must stay visible.
- **Match the expected row count.** Paginated tables: render a full page of skeletons. Unbounded small tables: render 3–5. Empty space below skeletons reads as "more coming" not "the data is missing."
- **Match the row density.** Default density skeletons at `min-h-10` (40px); compact at `min-h-9` (36px).
- **Skeleton cells use a muted tone at low opacity** — never animated shimmer in dense operator surfaces. Motion across 100+ rows is fatigue, not feedback.
- **Toolbar stays interactive during load** if the data is filterable. Search and filter chips are not blocked by load state — let the operator type ahead.

### Refetch (existing data visible, new fetch in flight)

- **Do NOT replace data with skeletons.** Keep the current data visible — operators are mid-task.
- **Optional progress signal:** a 1px linear progress bar at the top of the table, or a spinner on the refresh button. Never a full overlay.

---

## 4. Empty state — composition

Two empty states with distinct copy and distinct affordances. Copy rules live in `empty-and-error-states.md`; this section covers the table-specific composition.

### 4.1 Zero-state (collection genuinely empty, no filter active)

```
┌──────────────────────────────────────┐
│ [header band]                        │
├──────────────────────────────────────┤
│                                      │
│         [icon]                       │
│         Title                        │
│         Subtitle                     │
│         [Primary CTA]                │
│                                      │
└──────────────────────────────────────┘
```

- Rendered as a single full-width `<tr>` with `<td colSpan={n}>` — keeps the table semantic and the header band intact.
- Vertical padding: `py-12` (≈48px).
- Icon + title + subtitle + one CTA (the CTA creates the first item).
- Centered horizontally within the colspan cell; cap text width so the subtitle wraps gracefully (e.g. `max-w-sm`).

### 4.2 No-results (filter / search returned nothing)

```
┌──────────────────────────────────────┐
│ [header band]                        │
├──────────────────────────────────────┤
│                                      │
│         No matches                   │
│         Adjust your filters.         │
│         [Clear filters]              │
│                                      │
└──────────────────────────────────────┘
```

- Same `<tr><td colSpan={n}>` shape as zero-state.
- **No icon block.** The table chrome already signals "you're at a list" — adding an icon here visually equates "no results" with "no data," which is the wrong message.
- Subtitle + `Clear filters` button. The button only appears if the filter UI is on this surface (toolbar above) — never a navigation link to a different page.
- Vertical padding: `py-12` (same as zero-state, so the empty cell doesn't visually shrink the toolbar).

**Never show a zero-state icon block while a filter is active.** The user will read it as "you're at the wrong place," not "your query is too narrow." Distinguishing the two states is load-bearing.

---

## 5. Row selection — when to enable

Row selection (the checkbox column + bulk-action bar) carries cost: an extra column, visual weight, the bulk bar's appearance / disappearance. Add it only when one of these holds:

| Trigger | Example |
|---|---|
| **≥ 2 bulk actions across multiple rows** | Bulk delete + bulk archive on a resource list |
| **≥ 1 destructive action that benefits from multi-target** | Revoke multiple credentials at once |
| **Comparison / merge across selected rows** | Compare two runs side by side |
| **Member curation** | Archetype C — selection is the default (see `row-interaction.md`) |

**Do NOT add row selection if:**

- The only bulk action is "delete and re-create" — not a meaningful bulk operation.
- The list typically holds < 10 items — selection-then-act is slower than per-row kebab × N.
- Per-row actions cover the same verbs without needing multi-target — kebab is sufficient.

**Where selection state lives:**

- Checkbox column is leftmost, fixed width.
- Bulk-action bar sits **above the table, below the toolbar** — see `toolbar.md` § "Bulk-action bar."
- Selected row gets the accent left-rail treatment — see `components/table/spec.md` § "Row states."

---

## 6. Composition — Pattern A vs Pattern B

Two valid wrappers for a table. Pick by surrounding context, not preference.

### Pattern A — Bordered standalone

```
╭──────────────────────────────────────╮ ← rounded-md border bg-card
│  [header band]                       │
│  [row]                               │
│  [row]                               │
╰──────────────────────────────────────╯
```

**Use when:** the table sits directly on the page background without a parent Card — e.g. a settings sub-page with one primary list (Members, Limits, API keys, Secrets).

**Wrapper:** `rounded-md border border-border bg-card overflow-hidden`.

### Pattern B — Card-contained

```
┌──────────────────────────────────────┐ ← Card chrome clips corners
│  CardHeader (title + actions)        │
│  ──────────────────────────────────  │
│  [header band]                       │
│  [row]                               │
│  [row]                               │
└──────────────────────────────────────┘
```

**Use when:** the table is one block among several on a page (dashboard with multiple tables, detail page with several data sections), or the table has a heading / actions that belong with the table not the page.

**Wrapper:** parent `<Card>` provides the chrome; the table is edge-to-edge inside it (no `bordered` prop on the table).

### Anti-pattern: `<Card>` + `bordered` table

Double chrome. Card border + table-wrapper border are two visible frames around the same content. Pick one — Card OR bordered — never both.

For the engineering API (JSX primitive vs CSS-string exports), see `conventions/table.md`.

---

## 7. Cross-references

- `row-interaction.md` — row click + per-row action behavior per archetype
- `toolbar.md` — above-table controls + bulk-action bar layout
- `empty-and-error-states.md` — copy rules for zero-state and no-results
- `components/table/spec.md` — visual anatomy, tokens, row states, density math
- `conventions/table.md` — JSX primitive vs CSS-string engineering API choice
- `house-rules.md` — Archetype B click-affordance pick (whole-row click vs identifier-link vs trailing button)
