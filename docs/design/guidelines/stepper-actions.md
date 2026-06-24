# Stepper actions — button group for multi-step forms

**Scope:** Project-agnostic guidelines for B2B / enterprise SaaS dashboards. Governs the footer button group of a multi-step form (wizard / stepper) — Prev, Cancel, and the forward action. Does NOT cover step labels, progress indicators, per-step validation timing, or step-content layout — those belong in a separate stepper-anatomy guideline.

---

## 1. Container

Steppers live in a **page** or **full-screen dialog** only.

> Drawers are not a valid stepper container. **This is a deliberate house rule — see `house-rules.md` §1** (industry is split: AWS / Vercel use drawer steppers; we don't).

If you have ≤ 2 linear sections that look like steps, prefer a single drawer/page form with section headings — that is a long form, not a stepper.

---

## 2. Button layout — split-anchor

```
[ Prev ]                                       [ Cancel ]  [ Primary ]
   LEFT EDGE                                     RIGHT EDGE (right cluster)
```

- **Prev** anchors the LEFT edge.
- **Cancel** + **Primary** anchor the RIGHT edge, in that order (Cancel left of Primary).
- **Visible gap** between Cancel and Primary (≥ 12–16px, e.g. `gap-3`). Cancel adjacent to the primary action causes misclick — NN/g's proximity-consequential-options rule.
- **Visual weight separation:** Primary uses `variant="primary"` (filled); Cancel uses `variant="ghost"` or text-button weight. The weight contrast reinforces the gap.
- **Empty slots collapse.** A step with no Prev (step 0) leaves the left edge empty — do not insert spacer placeholders.

---

## 3. Per-step composition

| Step | Left edge | Right edge |
|---|---|---|
| First (step 0) | — | Cancel · Continue |
| Middle (1…N-1) | Prev | Cancel · Continue |
| Last (N) | Prev | Cancel · **Terminal verb** |

**Last-step verb is never "Continue."** Use the context-matched action: `Save`, `Create`, `Submit`, `Confirm`, `Finish`, or a verb-object like `Create policy` / `Deploy agent`. PatternFly, Carbon, Ant Design, and MUI all agree — "Continue" implies more steps, breaking user expectation on the terminal step.

**Dialog-based stepper variant.** The container's close-X is a redundant Cancel affordance. You may drop the bottom Cancel **only if** the close-X is unambiguously visible AND goes through the same discard-confirm gate as the bottom Cancel would. Page-based steppers have no close-X — always keep the bottom Cancel.

---

## 4. Discard-changes warning gate

Cancel (and the dialog close-X, if used as substitute) goes through the **two-condition gate** from `form-actions.md` §7 — fire the discard-confirm dialog only when **dirty AND high-stakes**.

| Scenario | Behavior |
|---|---|
| Step 0, clean form | Silent dismiss (nothing entered yet) |
| Any step, dirty, low-stakes (quick edit, single-section form) | Silent dismiss |
| Any step, dirty, high-stakes (multi-section credential / deploy / governance config) | Fire the discard-confirm dialog |

Use the same dialog copy as `form-actions.md` §7 — do not re-invent the wording.

**Prev is always silent.** Going back does not lose data; the previous step's state is preserved. Warning on Prev is not an industry pattern and contradicts the user's mental model of stepper navigation.

---

## 5. Anti-patterns — FAIL triggers

| Pattern | FAIL quote |
|---|---|
| Stepper inside a drawer | "stepper in drawer — escalate to page; see `house-rules.md` §1" |
| "Continue" as the last-step verb | "last-step verb must be context-matched — Save / Create / Submit / Finish, never Continue" |
| Cancel adjacent to Primary with no gap or weight separation | "Cancel misclick risk — separate by gap + visual weight (ghost vs filled)" |
| Discard-confirm fires on clean step 0 | "two-condition gate violation — see `form-actions.md` §7" |
| Discard-confirm fires on Prev | "Prev preserves data; never warn" |
| Bottom Cancel dropped in a page-based stepper | "no close-X to substitute — page stepper requires bottom Cancel" |
| Prev and Cancel both on the left edge | "ambiguous escape — Prev is back-navigation, Cancel is abandon; opposite ends" |

---

## 6. Cross-references

- `container-choice.md` §3 — drawer wizard ban (anti-pattern entry)
- `form-actions.md` §7 — two-condition discard gate (reused verbatim here)
- `house-rules.md` §1 — why drawers are out of scope for steppers (house rule entry)
- `toolbar.md` — split-anchor layout precedent (same split-anchor pattern, different surface)
