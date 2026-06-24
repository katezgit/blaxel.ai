# Row Interaction

Canonical pattern for how rows in portal tables behave on hover and click. Every row belongs to exactly one of three archetypes. Assign the archetype first; the interaction spec follows automatically.

## The three archetypes

### Archetype A — Catalog row

**User intent:** scan for a tool, then act on it via an inline button.

**Portal surfaces:** Integrations.

**Rules:**
- Row is NOT clickable. No row-hover background.
- The inline action button is the sole affordance; the button carries its own hover state.
- Action label reflects connection state: `Connect` opens a side drawer; `Manage` navigates to the integration detail.
- No identifier-as-link styling; no underline.

**Counter-pattern:** making the row clickable to surface a "detail page" before the action. That pattern fits browse-before-install (GitHub Marketplace, Vercel Marketplace) where the user needs to read permissions or marketing copy. Blaxel's Integrations surface is operational fast-connect; the drawer is the one-click path. Adding a detail-page redirect adds a navigation hop with no payoff for Alex.

---

### Archetype B — Resource row

**User intent:** open the entity to inspect or edit it. The row IS the entity.

**Portal surfaces:** Sandboxes, Agents, Jobs, MCP Servers, Model APIs, Volumes, Images, Custom Domains, Network, API Keys, Policies, Workspaces (account sub-shell).

**Rules:**
- Whole row is clickable → navigates to the entity's detail page. Apply `cursor-pointer` + `onClick` on the `<tr>`.
- Row hover shows the DS Table alt-background (inherited from the DS Table primitive; no extra class).
- Primary identifier text gets **underline on row hover** in its existing color — implemented as `group-hover:underline` on the identifier element. Color does NOT shift.
- ID or slug shown subtle below the primary identifier (12px monospace — see [Table Typography](./table-typography.md)). Copy icon appears on row hover, not by default.
- No trailing `→` arrow column.
- Per-row kebab `...` only when a fast action exists that is NOT "open detail" (e.g. Disable, Delete, Duplicate). If the only meaningful action is "open the entity," omit the kebab; row click does the work.

**Why underline, not color-shift:** underline is the universal link convention and does not collide with status pills, tag badges, or the orange left-rail accent already present on selected rows. Color-shift is reserved for selected/active state.

**Industry observation:** this is a deliberate Blaxel-side choice. Stripe Customers uses name-only link (not whole-row click). shadcn/ui's data-table example uses kebab-only with no row navigation. Cloudflare DNS uses per-row Edit buttons. None of them make the full row clickable. Blaxel picks whole-row click for ergonomic reasons: rows are dense, operators are fast, and tapping anywhere on a wide row is faster than hunting for a link-text target. Flag this to reviewers so it is not "fixed" back to link-only.

---

### Archetype C — Membership row

**User intent:** invite, change role, or remove a member. Rarely open a member's detail page. The work is curation, not inspection.

**Portal surfaces:** Workspace team, Account admins.

**Rules:**
- Checkbox column for multi-select. Clicking the checkbox toggles selection; clicking anywhere else on the row does NOT navigate and does NOT toggle the checkbox.
- Row alt-background on hover provides orientation only — it is not a click affordance.
- Selected row gets the orange left-rail accent (DS Table `data-state=selected`, already implemented).
- Per-row `...` kebab for contextual actions: Change role, Resend invite, Remove.
- No name underline, no `→` arrow, no row navigation.

**Counter-pattern:** treating member rows as Resource rows and navigating to a "member profile" page on click. Member management is a curation task. A detail page for a member adds navigation with no benefit for the common case.

---

## Assigning the archetype — decision heuristic

Ask one question: **what does the operator do after landing on this row?**

| Primary intent | Archetype |
|---|---|
| Click an action button (Connect, Install, Enable) | A — Catalog |
| Open and read/edit the entity itself | B — Resource |
| Invite, re-role, or remove a person | C — Membership |

When a table mixes intents (e.g. a resource list that also has a remove action), the primary intent drives the archetype. Secondary actions land in the per-row kebab.

---

## Sub-line styling

For Archetype B two-line cells (name + id/slug), see [Table Typography → 12px tier](./table-typography.md) for the exact token and color class to apply on the sub-line.
