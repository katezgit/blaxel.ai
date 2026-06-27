# PR Self-Review

> **When this fires:** any turn about to run `gh pr create` or a direct merge into `main` that ships code, docs, or workflow changes.
>
> **Owner:** orchestrator. The loop runs in the main thread *before* `release-manager` is dispatched. When release-manager is the one calling `gh pr create`, the orchestrator has already cleared the loop and is just delegating the commit/push mechanics — release-manager does **not** re-run the loop, and does **not** open a PR while open findings exist.

The contract: no PR opens until every applicable step returns clean AND the orchestrator has done an adversarial re-read of the diff. The loop runs until clean; one-pass-and-PR is the failure mode this workflow exists to prevent.

## The loop

Repeat the steps that apply to this PR until clean. "Clean" = every applicable step returns no unresolved finding AND the operator's outcome is demonstrably met (screenshot for UI; one-line restatement matches diff for non-UI).

**Step 1 — Restate the outcome.** In one line, write what the operator asked for. Then `git diff main...HEAD`. If the diff doesn't match the restated outcome, stop and fix scope before continuing — extra files belong on a different PR, missing changes mean the work isn't done.

**Step 2 — Lint + types.** `pnpm exec turbo run check-types lint --filter=<scope>` from repo root. Any non-zero = address before the next step. Required gate (per memory: lint before PR — never push to a PR branch without running the same gates CI runs).

- Skip only when the PR touches no TS/TSX (pure docs, pure markdown, pure config-without-types).

**Step 3 — Browser verify.** Applies only when the PR touches a runtime UI surface (`apps/portal/**` rendered routes, `packages/ui/**` components with reachable demo). Start `pnpm dev` in the worktree if not running (Next.js auto-picks a free port), navigate to the affected route, capture screenshots to `.intermediate/audits/<topic>/<step>-<label>.png`. For each touched UI surface walk:

- **Outcome** — does the change do what the operator asked? Compare side-by-side against the operator's screenshot or text description.
- **States** — default + every state reachable from this surface. For a list/table: empty (`?state=empty`), filter-induced empty (search a non-match), overflow boundary (resize to force scroll), 0 / 1 / N pluralization, loading and error (`?state=loading|error`).
- **Interactions** — open every dropdown/popover this PR touches; select each option; verify the trigger label and the dropdown body both render correctly. Width clipping at the trigger is the classic miss.
- **Regression scan** — navigate to one or two adjacent surfaces (sub-shell back, sibling route, parent page) and confirm nothing visibly broke.

Per memory: verify visual changes yourself — never relay a sub-agent's "verified" claim without your own screenshot at the operator's described route.

When the PR has no runtime UI (docs, workflow files, libs without consumers, backend, config), skip step 3 but write one line in your end-of-turn summary explaining the skip ("no runtime UI in this diff — workflow doc only").

**Step 3.5 — Visual review lens (designer audit).** Applies only when the PR touches a runtime UI surface — same trigger as step 3. After the engineer's browser-verify captures are in `.intermediate/audits/<topic>/`, the orchestrator dispatches `product-designer` with:

- the screenshot paths for default + every reachable state captured in step 3,
- the route and persona context (which persona, which workflow phase, which entry path — pulled from `docs/product/personas.md` + `alex-user-stories.md` or `scenarios.md` if present),
- the brief: *"Run the visual review lens. Return PASS / FAIL + numbered findings."*

The designer loads [`visual-review-lens.md`](./visual-review-lens.md) and returns the structured verdict defined there — three-question lens (why here / 10s job / F-pattern scan) + anti-pattern catalog check. The verdict format is fixed; do not paraphrase.

- **PASS** — proceed to step 4.
- **FAIL** — orchestrator routes each numbered finding to the path-owning engineer (`staff-frontend-engineer` for `apps/**`, `design-system-architect` for `packages/ui/**`). Engineer addresses every finding, re-captures the state grid, re-dispatches the designer. Loop until PASS.

Skip step 3.5 only when step 3 was also skipped (no runtime UI in the diff). Per memory: the lens substitutes for the operator's manual visual-audit relay — the loop is the gate they used to run by hand.

**Mid-feature opt-in.** A frontend engineer may request the lens *before* PR time by tagging their return message with `[designer-review-requested]` and a screenshot path. The orchestrator runs the same dispatch above immediately, routes findings back, and resumes the engineer. This is opt-in for the engineer (uncertain whether a layout call lands) and mandatory at PR time regardless.

**Step 4 — Adversarial re-read.** Read the diff as a peer reviewer who didn't write it. List every finding — do not cap. Format: `<file:line> — <issue> — <severity>`. Pull from the categories below. If you surface five or more findings, the diff is not ready; address them before considering another loop iteration.

Exit only when every applicable step returns zero unresolved findings AND the outcome restated in step 1 demonstrably matches the diff.

## Adversarial categories

The re-read checks at minimum:

- **Token discipline** — `[var(--x)]` arbitrary syntax, hardcoded hex/px, app-scoped tokens leaked into `packages/ui`. Reuse via `var()` when values match. (Per memory: app-scoped tokens belong in `apps/portal/src/app/globals.css @theme`, not `packages/ui` theme.css.)
- **Composition over configuration** — new `variant` / `mode` / `kind` / `type` / `layout` props, or `isX` / `showY` / `hideZ` / `compact` / `readonly` booleans that branch children or logic. Split it.
- **State coverage** — empty, loading, error, 0 / 1 / N plurals, overflow, focus-visible, hover, keyboard interaction.
- **Width / truncation** — fixed-width triggers (`w-40` etc.) need to fit the longest possible label. Open every dropdown that changed.
- **Copy** — matches Blaxel personality (`docs/product/personality.md`), not generic engineering prose. No marketing fluff in dashboard chrome.
- **Regressions** — sibling routes, parent shell, sub-shell back behavior, prefetch, hover targets.
- **Comment debt** — comments that describe WHAT instead of WHY; comments that reference "this PR" or "the recent fix" (rots fast). Remove them.

## PR body must include

- **Outcome** — one line restating what the operator asked for.
- **Test plan** — the applicable gates: `pnpm exec turbo run check-types lint --filter=<scope>` when there's TS/TSX, the specific browser states verified when there's UI ("default, overflow at 1440×400, filter-induced empty, Type dropdown open with longest label"), or a one-line note when neither applies ("docs only, adversarial re-read clean").
- **Screenshot evidence** — paths under `.intermediate/audits/<topic>/` (gitignored, kept for session memory; do not commit). Omit when step 3 didn't apply.

## Hard stops

- **Do not open the PR** if any applicable step's findings are unresolved.
- **Do not relay** a sub-agent's "verified" claim without your own browser screenshot at the operator's described route.
- **Do not skip an applicable step** on the assumption that "small change → safe". Step 2 skips only when the diff touches no TS/TSX; step 3 skips only when the diff touches no runtime UI. Every other case re-runs after every fix in the loop.

## Why this exists

A finding caught in this loop costs one screenshot. The same finding caught by the operator after PR review costs an operator round-trip — minutes of their wall-clock, the only scarce resource on this project. The loop is cheap; the round-trip is not.

Reference: this workflow was prompted on 2026-06-23 after PR #95 shipped with a `w-40` Type select trigger that truncated `Type: Token usage` to `Type: Token usag`. A pre-PR open-every-dropdown pass would have caught it.
