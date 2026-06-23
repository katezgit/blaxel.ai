# Form Footer Action Pattern — Save / Cancel

**Scope:** Cross-cutting interaction pattern for forms in dashboard products (settings pages, resource creation forms, inline edit panels, side-drawer forms). This is not a component spec — it governs the behavior and layout of the footer action area of any form. Component implementation detail lives in the design system.

---

## 1. The rule

> **Save** is always visible and always enabled.
> **Cancel** is rendered only when the form is dirty (the user has made unsaved changes).

No state of the form — empty, partially filled, fully filled, validation-errored, loading — changes Save's presence or enabled state. Cancel's presence is the only variable; it appears and disappears based on dirty state alone.

---

## 2. Rationale

Predictable affordances reduce scan cost in tools used by expert operators across long sessions. A Save button that conditionally appears or greys out forces users to verify footer state before acting. Always-present Save removes that check.

Cancel's conditional rendering carries a secondary function: it signals "you have unsaved changes" without a separate dirty indicator. A clean form has no Cancel. When Cancel appears, the user knows — without reading any label — that there is something to revert. This is ambient status.

Two alternatives this pattern rejects:

- **Disable-until-dirty** penalises re-submission of an unchanged form — which may be a legitimate action in some domains. It also forces the user to make a change just to prove they can save.
- **Disable-until-valid** moves validation state into the button instead of inline into the field. It hides the reason for inaction. Inline errors locate the problem at the source; a greyed Save does not.

---

## 3. Behavior detail

### What "dirty" means

The form is dirty when any field's current value differs from the value it held when the form was loaded (or when it was last successfully saved). Dirty resets to clean after:

- A successful save (server confirms the write).
- An explicit revert (user presses Cancel and form values return to their loaded state).

Dirty does not reset on navigation — if the user navigates away with unsaved changes, the caller is responsible for an unsaved-changes guard (browser `beforeunload` or in-app route guard). That guard is out of scope for this pattern.

### What Save does when the form is clean

Save remains responsive on a clean form. Whether the network round-trip runs or is short-circuited client-side is an implementation choice that depends on whether re-submitting identical data carries semantic value in your domain (e.g. force-re-run vs. idempotent save). The user-visible feedback — success confirmation — must be the same either way.

---

## 4. Visual and layout

### Button order and alignment

```
[  form fields  ]
─────────────────────────────────
                [Cancel]  [Save]
```

- Footer is right-aligned.
- Save is the rightmost (primary) button.
- Cancel sits immediately left of Save.
- No other actions in the footer. Destructive actions (delete, archive) live elsewhere — in a dedicated danger zone or a confirmation dialog, never alongside Save/Cancel.

### No layout jump on Cancel appearance

Save's position must not change when Cancel appears or disappears. Two acceptable implementations:

1. **Reserve the space.** Always allocate Cancel's width in the footer; render it invisible (`opacity: 0`, `pointer-events: none`) when clean. Save's x-position stays constant.
2. **Animate Cancel in.** Render Cancel with a brief opacity + translate-x enter transition when dirty state is first detected. Save does not move — Cancel slides into the reserved space from the left.

Option 1 is the default. Option 2 is acceptable on prominent editing surfaces where Cancel's appearance is a meaningful signal (e.g. a full-page settings form). If your project has a motion system, defer the animation spec there; otherwise pick one approach and document it once.

---

## 5. Edge cases

### Form is submitting

While a save is in flight:

- Save shows a loading state (spinner replaces label or sits inline — per the Button component's loading variant).
- Cancel is hidden (not merely disabled). There is nothing to cancel client-side while the request is mid-flight. If server-side cancellation is required, that is a separate affordance, not the footer Cancel.
- After the request settles: on success, dirty resets to clean and Cancel disappears; on failure, the form returns to its pre-submit dirty state and Cancel reappears.

### Validation errors

Save remains enabled. Validation errors surface inline on the fields that failed, on submit attempt. Save does not pre-disable based on field validity.

Inline errors on submit are immediate and located — the user presses Save, errors appear adjacent to the offending fields, the path forward is clear.

### Destructive or irreversible forms

This pattern applies unchanged. When a form targets a resource whose edits are difficult or impossible to undo, trigger a confirmation dialog on Save. The dialog is separate from the form footer and does not alter Save's enabled state or Cancel's visibility logic. Never put irreversibility warnings in the footer alongside the buttons.

---

## 6. When NOT to use this pattern

| Context | Why this pattern does not apply |
|---|---|
| **Modal / dialog forms** | The dialog's Cancel/Close button is part of the dismiss affordance and must always be visible — it doubles as the escape hatch for the overlay. Follow dialog-specific dismiss patterns instead. |
| **Multi-step wizard forms** | Back and Next replace Save/Cancel in the step footer. A Save or Finish button may appear only on the final step. The dirty/clean logic does not apply to in-progress multi-step state. |
| **Inline cell editing (tables)** | Confirm (✓) and discard (✕) icon buttons are the right affordance at that density. The full Save/Cancel pattern is too heavy for a cell-level edit. |
| **Forms inside command palette or popover** | These surfaces close on Escape; no explicit Cancel button is needed. Save (or equivalent) submits and closes. |

---

## 7. Dismiss confirmation — when to guard a container close

This section covers the discard-changes prompt that fires when a form **container** is dismissed (Esc key, overlay click, drawer close button, browser Back, route change) — as distinct from the footer Cancel button, which is covered in §1–3.

### The two-condition gate

A dismiss confirmation dialog must fire **only when both conditions hold simultaneously:**

1. **The form is dirty** — at least one field's current value differs from its loaded state (same definition as §3).
2. **The data entry is high-stakes** — defined as any of:
   - Irreversible save (the resource cannot be reconstructed once submitted — e.g. an API key whose token is shown once)
   - Complex multi-field resource creation where reconstructing the input is non-trivial (Policy, API key with permission scopes, Network config, Volume region + attachment config)
   - A paid action (upgrade, add-on activation, credit purchase)
   - Any form where the user would need more than 30 seconds to re-enter what they typed

If **either** condition is absent, dismiss silently with no prompt.

### What counts as low-stakes (silent dismiss even when dirty)

| Context | Treatment |
|---|---|
| Single-field inline rename | Silent dismiss — trivial to retype |
| Toggle or boolean setting (e.g. standby enabled, email notifications) | Silent dismiss — one click to revert |
| Theme or display preference | Silent dismiss — no data loss risk |
| Sandbox TTL edit (one numeric field) | Silent dismiss — single field, easily reset |
| Member invite (email + role — 2 fields, low reconstruction cost) | Silent dismiss |
| Any form where dirty state is < 2 fields of work | Silent dismiss |

### What counts as high-stakes (confirm when dirty)

| Context | Why it qualifies |
|---|---|
| **Policy create / edit** | ≥ 8 fields; region + flavor + token-limit rules are non-trivial to reconstruct; applies governance to live workloads | 
| **API key create** | The API key token is shown exactly once on submit — dismissing mid-create means re-creating and revoking a previous key if the user was editing permissions |
| **Network / Custom domains config** | Misconfiguration has production routing consequences; multi-field, non-trivial reconstruction |
| **Volume create** | Region mismatch breaks Agent attachment; reconstruction requires knowing the correct region + attachment target |
| **Agent deploy / config with custom environment or entrypoint** | Multi-section form; deploy config is non-trivial |

### Confirmation dialog copy

```
Discard changes?

Your unsaved changes will be lost.

[Keep editing]   [Discard]
```

- **Primary action (right):** "Discard" — destructive-secondary button weight.
- **Cancel action (left):** "Keep editing" — returns the user to the form exactly as they left it.
- Do not say "Are you sure?" — it is a question the user has already answered by trying to dismiss.
- Do not say "You have unsaved changes" as the body — the heading already states the consequence. Body is the one-line cost: what will be lost.

### Cautionary example — the lazy implementation

The Policy create flow (as of the initial release) fires a discard-changes confirmation on **every** dismiss — including when the form has never been touched. This trains users to click through the prompt as a reflex, defeating the guard entirely. When the confirm fires on a genuinely high-stakes dirty form, the user dismisses it without reading because the prompt has been noise every other time.

**The failure mode:** condition (1) missing — the gate fires on clean forms.

The fix is not to remove the guard — it is to evaluate both conditions before showing it.

### FAIL trigger for reviewers

> **FAIL: dismiss confirmation fires on a clean (non-dirty) form** — the two-condition gate is required; firing on clean state trains reflexive dismissal and defeats the guard on dirty high-stakes forms.

> **FAIL: dismiss confirmation omitted on a dirty high-stakes form** — both conditions are met; the guard is required.

### Cross-references

- `container-choice.md` §5 — each container's dismiss wiring; dismiss handler must read dirty + stakes, never assume
- `form-actions.md` §3 — canonical "dirty" definition (field value differs from loaded state; resets on successful save or explicit Cancel revert)
