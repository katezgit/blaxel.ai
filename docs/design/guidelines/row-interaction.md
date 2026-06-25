# Row Interaction

**Scope:** Project-agnostic guidelines for B2B / enterprise SaaS dashboards. Behavior rules for how table rows respond to hover and click. Every row belongs to exactly one of three archetypes — assign the archetype first; the interaction spec follows automatically.

---

## 1. The three archetypes

### Archetype A — Catalog row

**User intent:** scan for a tool, then act on it via an inline button.

**Typical surfaces:** Integration / connector directories, marketplace listings, install pickers.

**Rules:**
- Row is NOT clickable. No row-hover background.
- The inline action button is the sole affordance; the button carries its own hover state.
- Action label reflects connection state (e.g. `Connect` opens a config drawer; `Manage` navigates to detail).
- No identifier-as-link styling; no underline.

**Counter-pattern:** Making the row clickable to surface a "detail page" before the action. That pattern fits browse-before-install (GitHub Marketplace, Vercel Marketplace) where the user needs to read permissions or marketing copy. For operational fast-connect surfaces, the drawer is the one-click path — adding a detail-page redirect adds a navigation hop with no payoff.

---

### Archetype B — Resource row

**User intent:** open the entity to inspect or edit it. The row IS the entity.

**Typical surfaces:** Resource lists where each row represents a discrete object the operator drills into (deployments, environments, projects, repositories, keys, policies, domains).

**Behavior rules:**
- Selecting the row navigates to the entity's detail page.
- Row hover shows the Table primitive's alt-background.
- ID or slug may appear subtle below the primary identifier (12px monospace — see [Table Typography](../patterns/table-typography.md)). Copy icon appears on row hover, not by default.
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

---

### Archetype C — Membership row

**User intent:** invite, change role, or remove a member. Rarely open a member's detail page. The work is curation, not inspection.

**Typical surfaces:** Team / Members / Admins lists where the row represents a person and the work is people-management.

**Rules:**
- Checkbox column for multi-select. Clicking the checkbox toggles selection; clicking anywhere else on the row does NOT navigate and does NOT toggle the checkbox.
- Row alt-background on hover provides orientation only — it is not a click affordance.
- Selected row gets the accent left-rail (Table primitive `data-state=selected`).
- Per-row `...` kebab for contextual actions: Change role, Resend invite, Remove.
- No name underline, no `→` arrow, no row navigation.

**Counter-pattern:** Treating member rows as Resource rows and navigating to a "member profile" page on click. Member management is a curation task. A detail page for a member adds navigation with no benefit for the common case.

---

## 2. Assigning the archetype — decision heuristic

Ask one question: **what does the operator do after landing on this row?**

| Primary intent | Archetype |
|---|---|
| Click an action button (Connect, Install, Enable) | A — Catalog |
| Open and read / edit the entity itself | B — Resource |
| Invite, re-role, or remove a person | C — Membership |

When a table mixes intents (e.g. a resource list that also has a remove action), the primary intent drives the archetype. Secondary actions land in the per-row kebab.

---

## 3. Sub-line styling

For Archetype B two-line cells (name + id / slug), see [Table Typography → 12px tier](../patterns/table-typography.md) for the exact token and color class to apply on the sub-line.

---

## 4. Cross-references

- `tables.md` — table behavior + composition (column order, action placement, loading / empty, row selection, Pattern A vs B)
- `toolbar.md` — above-table controls + bulk action bar
- `house-rules.md` — affordance-choice picks that diverge from industry consensus
- `components/table/spec.md` — visual anatomy, tokens, row states, density math
