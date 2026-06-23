# Container Choice — Page vs Drawer vs Dialog

**Scope:** Choosing between a full page, a right-side drawer (sheet), and a centered dialog for any task in the Blaxel dashboard. Applies to all resource creation, editing, confirmation, and inspection surfaces across Sandboxes, Hosting, and Security.

---

## 1. The three options

| Container | Use when | Don't use when |
|---|---|---|
| **Page** | The task needs a persistent URL, takes more than ~2 minutes, or is the primary destination the user navigated to. | The action is a quick branch off an existing context — spawning a confirmation, making a lightweight edit, or creating a single sub-resource from a list. |
| **Drawer (right-side sheet)** | The user needs to see the parent list or detail screen while working, OR the form has 4–12 fields but doesn't need a URL. | The task requires full focus (no surrounding context needed), has ≥3 steps, or the user will always navigate away on completion. |
| **Dialog** | A question needs an answer before proceeding, OR a single focused action (1–3 fields, rename, confirm, copy token). | The form has more than 3 fields, or the user will need to reference other parts of the page while filling it. |

---

## 2. Decision matrix

Score each dimension to land on the right container. If two or more dimensions point to the same container, that's the call. If they conflict, the **deep-link need** and **field count** rows break ties.

| Dimension | Page | Drawer | Dialog |
|---|---|---|---|
| **Deep-link need** — must be bookmarkable / shareable / navigated to directly | Required | Optional | Never |
| **Task duration** — how long the typical session lasts | > 5 minutes / multi-session | 1–5 minutes | < 1 minute |
| **Surrounding context** — does the user need to see the parent screen while acting | Never | Often | Irrelevant (blocked anyway) |
| **Destructive / irreversible** — mistakes cost significant rework | Confirm on Save (see §5 edge cases in `form-actions.md`) | Confirm on Save | Yes (use dialog confirm pattern — see §7 of `form-actions.md`) |
| **Field count** | > 12 fields | 4–12 fields | 1–3 fields |
| **Multi-step** | ≥ 3 ordered steps that each build on the last | No / linear only | No |

---

## 3. Blaxel surface mapping

Applying the matrix to Blaxel's primitive surface (see `docs/product/platform.md` for canonical terms):

### Use **page**

- Sandbox detail — deep-linked forensics surface Alex navigates to directly from a list
- Agent detail — status, logs, deployed config all live here; this is a primary destination
- Batch Job detail — run-level forensics with multi-section content (overview, logs, tasks)
- MCP Server detail — status + invocation metrics + endpoint config
- Policy create / edit — multi-field governance authoring with ≥10 fields; Alex and Sam need to reference other docs while writing region / flavor / token-limit rules
- API key create — generates a credential whose token is shown **once**; this warrants a page with clear ceremony, not a drawer that can be accidentally dismissed
- Volume create — enough fields (name, region, size, attachment target) and enough consequence (regional mismatch = attach failure) to deserve a page
- Settings sub-sections (Workspace, Members, Account)

### Use **drawer**

- Sandbox quick-edit (TTL / label / region override) from the Sandbox list — 4–6 fields, user wants to see the list context
- Agent Drive attach / detach — a sub-action on a Sandbox or Agent detail, moderate field count
- Image detail inspect — read-mostly properties panel, user stays on the Sandboxes list
- Network / Custom domains config edit — moderate field count, update-in-place while seeing the parent resource
- Member invite — 2–3 fields, but the user is looking at the Members list while inviting

### Use **dialog**

- Sandbox delete confirm — "Type the name to confirm deletion" (1 field + destructive confirmation)
- API key revoke — one confirm action, irreversible
- Agent start / stop / restart — single action confirmation
- Rename any resource — single text field
- Batch Job cancel — single confirm
- Copy / reveal token (displayed after API key creation) — a read-only dialog with a copy affordance

---

## 4. Anti-patterns — FAIL triggers for reviewers

These are the patterns that get caught in review. Each entry includes a one-line FAIL a reviewer can quote.

### Dialog stacked on a drawer
A dialog opens on top of a drawer to confirm a sub-action (e.g. discard-changes confirm inside the Member invite drawer).
**FAIL: dialog-on-drawer stacking — resolve by moving the confirm inline or closing the drawer first.**

### Drawer for create-from-scratch on a high-stakes resource
Creating a Policy or API key in a drawer because "it's just a form." Both have ≥8 fields, non-trivial consequences, and benefit from a URL the user can return to.
**FAIL: high-stakes resource creation in a drawer — move to a page; cite field count + stakes.**

### Page for a confirm-only action
Navigating to a new route just to present "Are you sure?" with two buttons.
**FAIL: confirm-only action on a page — use a dialog; pages are for persistent, URL-stable destinations.**

### Dialog for > 3 fields
A dialog form grows past a name + one setting, then gets new fields added to it over time until it has 5–6 fields and the user must scroll inside the overlay.
**FAIL: > 3 fields in a dialog — move to a drawer if surrounding context matters, page if it doesn't.**

### Drawer with ≥ 3 sequential steps
A multi-step wizard (step 1 → step 2 → step 3) inside a right-side sheet, where each step changes the entire drawer body.
**FAIL: multi-step wizard in a drawer — move to a dedicated page; drawers are for single-pass linear forms.**

### No surrounding-context need, but still in a drawer
An Agent deploy form that has 10+ fields and the user has nothing to reference on the page behind the drawer — the drawer is just covering a blank list.
**FAIL: drawer where context is irrelevant — move to a page; surrounding-context need is the drawer's justification.**

### Card-wrap inside dialog / drawer
Wrapping form sections in `<Card>` components inside an overlay because "sections need grouping."
**FAIL: card-wrap inside dialog or drawer — use heading + spacing; cards inside overlays violate `card-usage.md` §4.6.**

---

## 5. Dismiss behavior

Every container must have a dismiss handler that checks **both** dirty state **and** stakes before deciding whether to block the dismiss with a confirmation.

- **Page** — route guard on `beforeunload` / in-app navigation intercept. See `form-actions.md` §3 and §7.
- **Drawer** — dismiss on Esc, overlay-click, or close button. Dismiss handler reads dirty + stakes; see `form-actions.md` §7 for the exact condition and copy.
- **Dialog** — Esc and overlay-click dismiss. Only the content inside the dialog determines whether a nested confirm is needed (rare: discard-changes confirm inside a dialog is unusual since dialogs rarely have substantial forms — move to a drawer / page first).

**The dismiss handler must never assume.** A lazy implementation that always fires a "You have unsaved changes" prompt on every drawer close — even when the form is clean — degrades the pattern into reflexive dismissal. See `form-actions.md` §7 for the two-condition gate and the Policy create cautionary example.

---

## 6. Width guidance

Drawer widths follow `app-shell-layout.md` §"Right inspector / drawer":

| Content | Width |
|---|---|
| Simple property edit (4–6 fields) | 400–480px |
| Standard create / edit form (6–10 fields) | 480–560px |
| Editing-heavy flow (10–12 fields, code editor, multi-section) | 560–720px |

Dialog widths:

| Content | Width |
|---|---|
| Single confirm (no form) | 400px |
| 1–3 field form | 480px |
| Token / secret display | 520px |

Do not size drawers or dialogs wider than the main content area minus the sidebar (roughly 720px maximum for a standard 1280px content cap at 256px sidebar).

---

## 7. Cross-references

- `form-actions.md` — footer Save/Cancel rule (§1–6) and dismiss confirmation rule (§7)
- `app-shell-layout.md` — drawer widths in §"Right inspector / drawer"; sidebar and content cap values
- `card-usage.md` — no card-wrap inside dialogs or drawers (§4.6)

---

## 8. FAIL summary (reviewer checklist)

| Scenario | FAIL quote |
|---|---|
| Dialog stacked on drawer | "dialog-on-drawer stacking" |
| High-stakes resource in drawer | "high-stakes resource creation in a drawer" |
| Confirm-only on a page | "confirm-only action on a page" |
| > 3 fields in dialog | "> 3 fields in a dialog" |
| Multi-step wizard in drawer | "multi-step wizard in a drawer" |
| Drawer with no surrounding-context need | "drawer where context is irrelevant" |
| Card-wrap inside overlay | "card-wrap inside dialog or drawer" |
| Dismiss handler not reading dirty + stakes | see `form-actions.md §7` |
