# The System

Snapshot of phases, agents, workflows, and gates as of 2026-06-23.

## The model in one paragraph

Three layers compose every piece of work. **Phases** (state machine in `.state/state.md`) decide what's allowed to be produced. **Agents** (`.claude/agents/`) are method calls that produce it. **Gates** — machine, adversarial, human — decide whether it ships. Procedural logic lives in `.claude/workflows/`; conventions in `docs/`. Each layer refuses to improvise past its boundary.

---

## View 1 — Phase pipeline

```
discovery  ─── product-designer
       │           writes: platform, personas,
       │                   primary-workflow, user-stories
       │
     ┌─┴───────────┐
     ▼             ▼
personality   ux-flows  ─── product-designer ⟶ domain-review gate ◄── parallel
     │             │
     ▼             ▼
design-tokens scenarios ─── scenario-strategist ⟶ domain-review gate
     │             │       (detail/diagnostic screens only)
     └──────┬──────┘
            ▼
       wireframes ─── product-designer ⟶ domain-review gate
            ▼            (entry: tokens + ux-flows [+ scenarios] approved)
       screens
            │
            ├──► components   ◄── trigger: pattern in 2–3 screens
            ├──► patterns     ◄── trigger: cross-component need
            ▼
       motion  ─── motion-designer
            ▼
       implementation ─┬── design-system-architect  (packages/ui/)
                       ├── library-engineer         (packages/libs/)
                       └── staff-frontend-engineer  (apps/)
            ▼
       design-qa  ─── product-designer + motion-designer
            ▼            (visual-qa.md captures pixel evidence)
       review  ─── accessibility-expert + frontend-reviewer
            ▼
       ship  ─── release-manager
                 (pre-pr-consolidation gate before PR)
```

Every phase exits through the [self-review gate](.claude/workflows/phase-self-review.md); `ux-flows`, `scenarios`, and `wireframes` also exit through the [domain-review gate](.claude/agents/product-domain-reviewer.md). Both verdict files land in `.intermediate/reviews/` before the human-approval ping. Canonical phase table: [`design-phases.md`](.claude/workflows/design-phases.md).

---

## View 2 — `/add-component` call graph

The canonical entry point for new DS primitives is `/add-component <name>` — one shared worktree, one feature branch, one merge:

```
HUMAN  /add-component <name>
   ▼
ORCHESTRATOR
   git worktree add -b feat/<name> .claude/worktrees/feat-<name> main
   ▼
design-system-architect  (with FEATURE_WORKTREE + FEATURE_BRANCH directives)
   spec gate → implement → re-skin → register
   internal frontend-reviewer PASS loop
   ▼
accessibility-expert
   CRITICAL / MAJOR / MINOR
   ▼
design-system-architect  (re-dispatch until CRITICAL/MAJOR clear)
   ▼
unit-test-engineer  (writes <name>.test.tsx against finalized API)
   ▼
storybook-documenter  (writes <name>.stories.tsx)
   ▼
ORCHESTRATOR
   verify all 3 files exist
   apply merge gate from .state/phases.md:
     greenfield  → merge locally, remove worktree
     production  → push branch, gh pr create, operator merges
```

**Tests run after review converges, by design.** Reviewer-driven fixes (prop renames, accessible-name changes, DOM reshapes) invalidate any test written earlier. Path-owning engineers never write `*.test.{ts,tsx}`; `unit-test-engineer` owns the entire test surface ([doctrine](docs/testing/unit-testing-guidelines.md)).

**Features with no new DS primitive** skip the chain: `staff-frontend-engineer` runs alone in a worktree → `frontend-reviewer` PASS loop → `unit-test-engineer`. If the engineer's spec gate or DS gate trips, it returns to the orchestrator, which routes to `product-designer` or `design-system-architect`.

---

## View 3 — Gates

Layered cheap-mechanical first, expensive-semantic last.

| Gate                      | Trigger                                                                  | Enforces                                                                                                                                | Canonical                                                              |
| ------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Worktree**              | Edit touches `apps/**`, `packages/**`, or root configs                    | Solo vs chain spawn; chain = one shared `feat/<name>` worktree, one merge; design phases stay on `main`; merge mode set by `.state/phases.md` | [`worktree-protocol.md`](.claude/workflows/worktree-protocol.md)       |
| **Marker hygiene**        | Every phase exit (sub-gate of self-review)                                | `grep` for `{{PLACEHOLDER}}` / `TODO(agent)` against touched files; any hit = needs-more-work                                            | [`phase-self-review.md`](.claude/workflows/phase-self-review.md)       |
| **Phase self-review**     | Every phase exit                                                          | Phase-owner pass + adversarial fresh-sub-agent pass → aggregated verdict file                                                            | [`phase-self-review.md`](.claude/workflows/phase-self-review.md)       |
| **Domain review**         | Exit of `ux-flows`, `scenarios`, `wireframes`                             | `product-domain-reviewer` PASS — persona scope, workflow fidelity, vocabulary, primitives. FAIL → owner revises; never bypass.            | [`product-domain-reviewer`](.claude/agents/product-domain-reviewer.md) |
| **Scenarios**             | Wireframes entry for detail/diagnostic screens                            | `scenarios.md` exists with the 6 required fields; wireframe answers every 10-second audit question                                       | [`design-phases.md`](.claude/workflows/design-phases.md) § Scenarios applicability |
| **Screen-spec parity**    | `screens` exit                                                            | Peer Parity Check section across 5 axes (header / container / tab placement / expand / footnote sizing)                                  | [`screen-spec-parity.md`](.claude/workflows/screen-spec-parity.md)     |
| **Artifact Rule**         | Any artifact returned by `product-designer` / `motion-designer` / `scenario-strategist` | Oak note + project link + `agent:review` task + note↔task link with scheme-correct URLs                                                  | [`design-phases.md`](.claude/workflows/design-phases.md) § Designer Artifact Rule |
| **Phase gate**            | Designer attempts artifact whose upstream isn't done                      | Stop + escalate via `agent:{topic}` task                                                                                                  | [`design-phases.md`](.claude/workflows/design-phases.md)               |
| **Spec gate**             | Engineer/architect has no spec, or is handed a `.wireframe.md` instead of a `.screen.md` / component `spec.md` | Stop + escalate to orchestrator                                                                                                          | engineer Workflow §1, architect Workflow §2                            |
| **Token policy**          | Missing / wrong / unclear token                                           | Stop → designer decides → architect implements → caller resumes                                                                          | [`token-policy.md`](docs/conventions/token-policy.md)                  |
| **Adversarial review**    | Engineer reports "done" on `apps/**` or `packages/ui/**`                  | `frontend-reviewer` PASS/FAIL loop until PASS                                                                                            | [`frontend-reviewer`](.claude/agents/frontend-reviewer.md)             |
| **Pre-PR consolidation**  | Before any `release-manager` PR dispatch                                  | Fold `.intermediate/` artifacts into canonical docs; re-inventory to confirm clean                                                       | [`pre-pr-consolidation.md`](.claude/workflows/pre-pr-consolidation.md) |

**Known asymmetry:** `packages/libs/` has no adversarial reviewer — `library-engineer` self-reviews. Intentional: smaller surface than UI primitives.

---

## Agent roster

All agents share `INPUTS → OUTPUT → Scope → Hard Rules → Workflow → Delegation → References`.

| Agent                     | Owns                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------- |
| **Designers**             |                                                                                     |
| `product-designer`        | Canonical design artifacts (personality → patterns), screen specs, foundations      |
| `motion-designer`         | Motion tokens, transitions, per-component animations                                |
| `scenario-strategist`     | Pre-wireframe scenario worksheets for detail/diagnostic screens                     |
| **Reviewers**             |                                                                                     |
| `product-domain-reviewer` | Adversarial PASS/FAIL on `ux-flows` / `scenarios` / `wireframes`                    |
| `frontend-reviewer`       | Adversarial PASS/FAIL on `apps/**` + `packages/ui/**`                               |
| `accessibility-expert`    | WCAG, keyboard, screen-reader review                                                |
| **Engineers**             |                                                                                     |
| `design-system-architect` | Shared primitives in `packages/ui/` + token write                                   |
| `library-engineer`        | Shared utilities in `packages/libs/`                                                |
| `staff-frontend-engineer` | App code in `apps/**`                                                               |
| `unit-test-engineer`      | All unit tests in the repo (`**/*.test.{ts,tsx}`, `**/*.spec.{ts,tsx}`)             |
| `storybook-documenter`    | Storybook stories for DS components                                                 |
| **Ops**                   |                                                                                     |
| `release-manager`         | Commits, conventional messages, PR creation, merges                                 |

---

## Slash commands

Operator-invoked entry points. Some are multi-agent chains, others single-shot.

| Command                                                                | What it does                                                                                                          |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [`/add-component`](.claude/commands/add-component.md)                  | worktree → architect (with internal `frontend-reviewer` loop) → a11y → loop → `unit-test-engineer` → storybook → merge |
| [`/add-lib`](.claude/commands/add-lib.md)                              | `library-engineer` → `unit-test-engineer` → merge                                                                     |
| [`/test:unit`](.claude/commands/test:unit.md)                          | `unit-test-engineer` — add or clean up tests                                                                          |
| [`/test:e2e-init`](.claude/commands/test:e2e-init.md)                  | Bootstrap Playwright Test Agents for an app                                                                           |
| [`/test:e2e`](.claude/commands/test:e2e.md)                            | Author Playwright E2E from a user-flow doc                                                                            |
| [`/sys.optimize-doc`](.claude/commands/sys.optimize-doc.md)            | Token-reducer pass on a doc                                                                                           |
| [`/git.clean-branches`](.claude/commands/git.clean-branches.md)        | Local branch cleanup; keep `main` + `dev`                                                                             |

---

## Workflows

Orchestrator- and agent-loaded procedures in `.claude/workflows/`.

| Workflow                                                                         | Purpose                                                                  | Read by                                              |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------- |
| [`design-phases.md`](.claude/workflows/design-phases.md)                         | Canonical phase table + Designer Artifact Rule                           | Orchestrator, designers, `scenario-strategist`       |
| [`phase-self-review.md`](.claude/workflows/phase-self-review.md)                 | Universal phase-exit gate                                                | Orchestrator                                         |
| [`worktree-protocol.md`](.claude/workflows/worktree-protocol.md)                 | Spawn / branch / merge decisions                                         | Orchestrator, worktree-isolated agents               |
| [`worktree-return-protocol.md`](.claude/workflows/worktree-return-protocol.md)   | Commit-before-return; no nested spawns; no `git apply`                   | Worktree-isolated agents                             |
| [`visual-qa.md`](.claude/workflows/visual-qa.md)                                 | Entry to `design-qa` — capture procedure, viewports, states              | Engineers, `product-designer`                        |
| [`screen-spec-parity.md`](.claude/workflows/screen-spec-parity.md)               | Peer Parity Check axes for screen specs                                  | `product-designer`                                   |
| [`cross-screen-audit.md`](.claude/workflows/cross-screen-audit.md)               | Operator-triggered drift catcher (not a phase)                           | `product-designer`                                   |
| [`pre-pr-consolidation.md`](.claude/workflows/pre-pr-consolidation.md)           | Fold `.intermediate/` into canonical docs before PR                      | Orchestrator → `product-designer`, `release-manager` |

---

## Shared substrate

```
docs/conventions/   — engineer + architect + designer policies (tokens, tailwind v4, design-system, app-conventions, approved libs)
docs/design/        — canonical design artifacts (foundations, screens, components, patterns, guidelines, reviews, audits)
docs/product/       — platform, personas, primary workflow, user stories, personality
docs/testing/       — unit-testing-guidelines.md (Kent C. Dodds / Testing Library doctrine)

.intermediate/      — gitignored workspace; never canonical
  ├── discovery/    — scenarios, persona drafts, research
  ├── design/       — HTML previews, token explorations
  ├── reviews/      — self-review + domain-review verdicts
  └── audits/       — ad-hoc engineer screenshots
```

Per-file ownership annotations live in each agent's `References` section — single source of truth, no restatement here.

---

## Open gaps

- `packages/libs/` has no adversarial reviewer; `library-engineer` self-reviews.
- No feedback loop: `frontend-reviewer` and `accessibility-expert` findings never write back into upstream convention docs (`tailwind-v4.md`, `app-conventions.*`, `design-system.md`).
- "Ask twice = fail" meta-rule (write a skill on the second occurrence) not codified in CLAUDE.md.
- `.claude/workflows/templates/` referenced by `phase-self-review.md` but not yet populated — agents derive shape from existing canonical artifacts.
