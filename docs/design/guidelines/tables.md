# Tables — Behavior + Composition

**Scope:** Project-agnostic guidelines for B2B / enterprise SaaS dashboards. Governs the behavior contract of a data table — row interaction archetypes, what goes where in the columns, when to add row selection, and which layout container shape to pick. Visual tokens, row state colors, density math, and cell typography live in `components/table/spec.md` and `components/table/typography.md` respectively; this file does not restate them.

---

## 1. Row interaction — the three archetypes

Every row belongs to exactly one of three archetypes. Assign the archetype first; the rest of the table's behavior (action placement, selection, click target) follows from it.

### Archetype A — Catalog row

**User intent:** scan for a tool, then act on it via an inline button.

**Typical surfaces:** integration / connector directories, marketplace listings, install pickers.

**Rules:**
- Row is NOT clickable.
- The inline action button is the sole affordance.
- Action label reflects connection state (e.g. `Connect` opens a config drawer; `Manage` navigates to detail).
- No identifier-as-link styling; no underline.

**Counter-pattern:** Making the row clickable to surface a "detail page" before the action. That pattern fits browse-before-install (GitHub Marketplace, Vercel Marketplace) where the user needs to read permissions or marketing copy. For operational fast-connect surfaces, the drawer is the one-click path — adding a detail-page redirect adds a navigation hop with no payoff.

### Archetype B — Resource row

**User intent:** open the entity to inspect or edit it. The row IS the entity.

**Typical surfaces:** resource lists where each row represents a discrete object the operator drills into (deployments, environments, projects, repositories, keys, policies, domains).

**Behavior rules:**
- Selecting the row navigates to the entity's detail page.
- Row hover is enabled (signals clickability — see `components/table/spec.md` § Row states for the visual).
- ID or slug may appear as a sub-line under the primary identifier — see `components/table/typography.md` § Tier 3 for the token. Copy icon appears on row hover, not by default.
- No trailing `→` arrow column.
- Per-row kebab `...` only when a fast action exists that is NOT "open detail" (e.g. Disable, Delete, Duplicate). If the only meaningful action is "open the entity," omit the kebab.

**Affordance choice — project call.** The "selecting the row" verb above leaves the click affordance open. Three patterns exist:

| Affordance | Industry example | Trade-off |
|---|---|---|
| Whole-row click + identifier underline-on-hover | Less common — see `house-rules.md` for project picks | Largest hit target, fast for dense rows. Requires hover affordance to signal clickability. |
| Identifier-only link | Stripe Customers, GitHub repo lists | Familiar link semantics. Smaller hit target. |
| Trailing action button (Open / View / Edit) | Cloudflare DNS | Most explicit. Consumes a column. |

Pick one per project and apply it consistently across every Archetype B surface. If the pick diverges from industry consensus, log it in `house-rules.md` so reviewers don't "fix" it back.

**Why underline (when whole-row click is chosen):** Underline is the universal link convention and does not collide with status pills, tag badges, or the selected-row rail. Color-shift on hover is reserved for selected / active state — don't double-use it.

### Archetype C — Membership row

**User intent:** invite, change role, or remove a member. Rarely open a member's detail page. The work is curation, not inspection.

**Typical surfaces:** Team / Members / Admins lists where the row represents a person and the work is people-management.

**Rules:**
- Checkbox column for multi-select. Clicking the checkbox toggles selection; clicking anywhere else on the row does NOT navigate and does NOT toggle the checkbox.
- Row hover provides orientation only — not a click affordance (visual: see spec § Row states).
- Per-row `...` kebab for contextual actions: Change role, Resend invite, Remove.
- No name underline, no `→` arrow, no row navigation.

**Counter-pattern:** Treating member rows as Resource rows and navigating to a "member profile" page on click. Member management is a curation task. A detail page for a member adds navigation with no benefit for the common case.

### Decision heuristic — which archetype?

Ask one question: **what does the operator do after landing on this row?**

| Primary intent | Archetype |
|---|---|
| Click an action button (Connect, Install, Enable) | A — Catalog |
| Open and read / edit the entity itself | B — Resource |
| Invite, re-role, or remove a person | C — Membership |

When a table mixes intents (e.g. a resource list that also has a remove action), the primary intent drives the archetype. Secondary actions land in the per-row kebab.

---

## 2. Column order — identity first, action last

| Position | Column type |
|---|---|
| 1 (leftmost) | Primary identifier — name, slug, label |
| 2 | Status badge / state pill |
| 3…N-2 | Categorical attributes (type, owner, region) |
| 3…N-2 | Numeric metrics (count, size, %, $) |
| N-1 | Timestamp (created, updated, last seen) |
| N (rightmost) | Per-row action (kebab or trailing button) |

**Rules:**
- **Identifier always leftmost.** No exceptions — moving identity off the left breaks scan order.
- **Status next to identifier when present.** State is half the meaning of "what is this row" — keep it adjacent.
- **Timestamp near the end, never first.** Time is meta-information; identity is the row.
- **Per-row action cell is the only column without a header label.**

Numeric columns, timestamps, and ID sub-lines render in monospace with tabular figures — see `components/table/typography.md` § Mono-role cells for the token; see `components/table/spec.md` § Numeric alignment for the right-align rule.

---

## 3. Row selection — when to enable

Row selection (the checkbox column + bulk-action bar) carries cost: an extra column, visual weight, the bulk bar's appearance / disappearance. Add it only when one of these holds:

| Trigger | Example |
|---|---|
| **≥ 2 bulk actions across multiple rows** | Bulk delete + bulk archive on a resource list |
| **≥ 1 destructive action that benefits from multi-target** | Revoke multiple credentials at once |
| **Comparison / merge across selected rows** | Compare two runs side by side |

Archetype C (membership) requires selection by definition — see §1.

**Do NOT add row selection if:**

- The only bulk action is "delete and re-create" — not a meaningful bulk operation.
- The list typically holds < 10 items — selection-then-act is slower than per-row kebab × N.
- Per-row actions cover the same verbs without needing multi-target — kebab is sufficient.

Checkbox column is leftmost, fixed width. Bulk-action bar placement, selected-row visual, and accent rail token are owned by `toolbar.md` § Bulk-action bar and `components/table/spec.md` § Row states.

---

## 4. Loading state — skeleton rows, count preservation

### First load (no data yet)

- **Render skeleton rows in place of the data band.** Never replace the whole table with a centered spinner — the header band is part of the table's identity and must stay visible.
- **Match the expected row count.** Paginated tables: render a full page of skeletons. Unbounded small tables: render 3–5. Empty space below skeletons reads as "more coming" not "the data is missing."
- **Match the row density** (heights owned by `components/table/spec.md` § Cell heights).
- **Skeleton cells use a muted tone at low opacity** — never animated shimmer in dense operator surfaces. Motion across 100+ rows is fatigue, not feedback.
- **Toolbar stays interactive during load** if the data is filterable. Search and filter chips are not blocked by load state — let the operator type ahead.

### Refetch (existing data visible, new fetch in flight)

- **Do NOT replace data with skeletons.** Keep the current data visible — operators are mid-task.
- **Optional progress signal:** a 1px linear progress bar at the top of the table, or a spinner on the refresh button. Never a full overlay.

---

## 5. Empty state — composition

Two empty states with distinct copy and distinct affordances. Copy rules live in `empty-and-error-states.md`; this section covers the table-specific composition only.

### 5.1 Zero-state (collection genuinely empty, no filter active)

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

### 5.2 No-results (filter / search returned nothing)

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

## 6. Composition — Pattern A vs Pattern B

Two valid wrappers for a table. Pick by surrounding context, not preference.

| Pattern | Use when |
|---|---|
| **A — Bordered standalone** | The table sits directly on the page background without a parent Card — e.g. a settings sub-page with one primary list (Members, Limits, API keys, Secrets). |
| **B — Card-contained** | The table is one block among several on a page (dashboard with multiple tables, detail page with several data sections), or the table has a heading / actions that belong with the table not the page. |

**Anti-pattern: `<Card>` + `bordered` table.** Double chrome. Card border + table-wrapper border are two visible frames around the same content. Pick one — Card OR bordered — never both.

Visual anatomy (ASCII diagrams, wrapper classes, token-level details) lives in `components/table/spec.md` § Bordered variant. Engineering API (when to use the `bordered` prop vs `<Card>` wrapping) lives in `conventions/table.md`.

---

## 7. Cross-references

- `toolbar.md` — above-table controls + bulk-action bar layout
- `empty-and-error-states.md` — copy rules for zero-state and no-results
- `components/table/spec.md` — visual anatomy, tokens, row states, density math, alignment
- `components/table/typography.md` — three-tier reading hierarchy for table cell content
- `conventions/table.md` — JSX primitive vs CSS-string engineering API choice
- `house-rules.md` — Archetype B click-affordance pick (whole-row click vs identifier-link vs trailing button)
