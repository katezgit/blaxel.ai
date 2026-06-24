# PR Self-Review

> **When this fires:** any turn about to run `gh pr create` or a direct merge into `main` that ships code. Applies to PRs from the main thread and from sub-agents.

The contract: no PR opens until lint, types, and a browser pass come back clean AND the orchestrator has done an adversarial re-read of the diff. The loop runs until "clean"; one-pass-and-PR is the failure mode this workflow exists to prevent.

## The loop

Repeat steps 1–4 until clean. "Clean" = lint/types pass AND every finding addressed AND screenshots prove the operator's outcome lands.

1. **Read the diff** — `git diff main...HEAD`. State in one line what changed. If the diff doesn't match what the operator asked for, stop and fix scope before continuing.
2. **Lint + types** — `pnpm exec turbo run check-types lint --filter=<scope>` from repo root. Any non-zero = address before the next step. Required gate per [`feedback_lint_before_pr`].
3. **Browser verify** — start `pnpm dev` in the worktree if it isn't already running (Next.js auto-picks a free port), navigate to the affected route, and capture screenshots to `.intermediate/audits/<topic>/<step>-<label>.png`. For each touched UI surface walk:
   - **Outcome** — does the change do what the operator asked? Compare side-by-side against the operator's screenshot or text description.
   - **States** — default + every state reachable from this surface. For a list/table: empty (`?state=empty`), filter-induced empty (search a non-match), overflow boundary (resize to force scroll), 0 / 1 / N pluralization, loading and error (`?state=loading|error`).
   - **Interactions** — open every dropdown/popover this PR touches; select each option; verify the trigger label and the dropdown body both render correctly. Width clipping at the trigger is the classic miss.
   - **Regression scan** — navigate to one or two adjacent surfaces (sub-shell back, sibling route, parent page) and confirm nothing visibly broke.
   - Required per [`feedback_verify_visual_changes_yourself`]: never relay a sub-agent's "verified" claim — take the screenshot yourself.
4. **Adversarial re-read** — read the diff as a peer reviewer who didn't write it. List 0–5 findings as `<file:line> — <issue> — <severity>`. Be specific. Don't soften. Pull from the categories below.

Exit only when steps 1–4 surface zero unresolved findings AND the browser pass matches the operator's stated outcome.

## Adversarial categories

The re-read checks at minimum:

- **Token discipline** — `[var(--x)]` arbitrary syntax, hardcoded hex/px, app-scoped tokens leaked into `packages/ui`. Reuse via `var()` when values match. Per [`feedback_app_tokens_in_app_globals`].
- **Composition over configuration** — new `variant` / `mode` / `kind` / `type` / `layout` props, or `isX` / `showY` / `hideZ` / `compact` / `readonly` booleans that branch children or logic. Split it.
- **State coverage** — empty, loading, error, 0 / 1 / N plurals, overflow, focus-visible, hover, keyboard interaction.
- **Width / truncation** — fixed-width triggers (`w-40` etc.) need to fit the longest possible label. Open every dropdown that changed.
- **Copy** — matches Blaxel personality (`docs/product/personality.md`), not generic engineering prose. No marketing fluff in dashboard chrome.
- **Regressions** — sibling routes, parent shell, sub-shell back behavior, prefetch, hover targets.
- **Comment debt** — comments that describe WHAT instead of WHY; comments that reference "this PR" or "the recent fix" (rots fast). Remove them.

## PR body must include

- **Outcome** — one line restating what the operator asked for.
- **Test plan** — checked items: `pnpm exec turbo run check-types lint --filter=<scope>` plus the specific browser states verified ("default, overflow at 1440×400, filter-induced empty, Type dropdown open with longest label").
- **Screenshot evidence** — paths under `.intermediate/audits/<topic>/` (gitignored, kept for session memory; do not commit).

## Hard stops

- **Do not open the PR** if any step's findings are unresolved.
- **Do not relay** a sub-agent's "verified" claim without your own browser screenshot at the operator's described route.
- **Do not skip** lint/types on the assumption that "small change → safe". Re-run after every fix in the loop.

## Why this exists

A finding caught in this loop costs one screenshot. The same finding caught by the operator after PR review costs an operator round-trip — minutes of their wall-clock, the only scarce resource on this project. The loop is cheap; the round-trip is not.

Reference: this workflow was prompted on 2026-06-23 after PR #95 shipped with a `w-40` Type select trigger that truncated `Type: Token usage` to `Type: Token usag`. A pre-PR open-every-dropdown pass would have caught it.
