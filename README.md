# The System

Snapshot of how phases, agents, workflows, and gates compose as of 2026-06-23.

## The whole thing in one sentence

Phases gate what can be built → agents are method calls with declared inputs → workflows in `.claude/workflows/` carry the procedural logic the harness used to inline → artifacts run the Artifact Rule and wait for human approval → every phase exit runs a machine self-review (and three of them run an adversarial domain review) before the human ever sees the work → code is gated by adversarial review + worktree discipline → shared conventions live in canonical docs that every agent reads on demand. Each layer refuses to improvise past its boundary.

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

**Every phase exit runs `phase-self-review.md`** — orchestrator-run two-pass review (phase-owner + adversarial fresh sub-agent + marker-hygiene grep) producing `.intermediate/reviews/{phase}-self-review-{YYYY-MM-DD}.md`. **`ux-flows`, `scenarios`, and `wireframes` additionally require `product-domain-reviewer` PASS** at `.intermediate/reviews/{phase}-domain-review-{YYYY-MM-DD}.md`. Both verdict files precede the human-approval ping. Phases never advance automatically — current phase lives in `.state/state.md`. Canonical phase table: [`.claude/workflows/design-phases.md`](.claude/workflows/design-phases.md).

---

## View 2 — Typical call graph (build a feature needing a new component)

The canonical entry point is `/add-component <name>` — defined in [`.claude/commands/add-component.md`](.claude/commands/add-component.md). Mandatory shared-worktree chain, one feature branch, one merge:

```
HUMAN  /add-component <name>
   ▼
ORCHESTRATOR
   git worktree add -b feat/<name> .claude/worktrees/feat-<name> main
   ▼
design-system-architect (with FEATURE_WORKTREE + FEATURE_BRANCH directives)
   spec gate → implement → re-skin → register
   internal frontend-reviewer PASS loop
   ▼
accessibility-expert  (reviews the feature worktree)
   CRITICAL / MAJOR / MINOR
   ▼
design-system-architect  (loop until CRITICAL/MAJOR are clear)
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

**For a feature with no new DS primitive**, `staff-frontend-engineer` runs alone in its own worktree, then `frontend-reviewer` PASS loop, then `unit-test-engineer` writes app-level tests. If the engineer's spec gate trips (no screen spec) or DS gate trips (missing primitive), it stops and returns to the orchestrator — the orchestrator routes to `product-designer` or `design-system-architect` respectively.

**Tests run after review converges, by design.** Reviewer-driven fixes (prop renames, accessible-name changes, DOM reshapes) invalidate any test written earlier. The path-owning engineer (`design-system-architect`, `library-engineer`, `staff-frontend-engineer`) never writes `*.test.{ts,tsx}` files; `unit-test-engineer` owns the whole test surface. Doctrine in [`docs/testing/unit-testing-guidelines.md`](docs/testing/unit-testing-guidelines.md).

**For shared utilities**, `/add-lib <name>` ([`.claude/commands/add-lib.md`](.claude/commands/add-lib.md)) runs a shorter chain — `library-engineer` (no adversarial reviewer for `packages/libs/`) → `unit-test-engineer` → merge gate.

---

## View 3 — The gates holding it together

The harness layers gates from cheap-and-mechanical to expensive-and-semantic.

| Gate                          | Triggered when…                                                                       | Enforces                                                                                                                                                  | Canonical                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Worktree gate**             | Any edit touching `apps/**`, `packages/**`, root configs                              | Solo vs chain decision; chain = single shared `feat/<name>` worktree, one merge; design phases stay on `main`; merge gate switches on `.state/phases.md`. | [`worktree-protocol.md`](.claude/workflows/worktree-protocol.md)     |
| **Marker-hygiene gate**       | Every phase exit (sub-gate of self-review)                                            | `grep -rEn '\{\{[A-Z_]+\}\}\|TODO\(agent\)'` against files touched. Any hit = `needs-more-work`.                                                          | [`phase-self-review.md`](.claude/workflows/phase-self-review.md)     |
| **Phase self-review**         | Every phase exit, before human-approval ping                                          | Phase-owner pass + adversarial fresh-sub-agent worst-enemy pass → aggregated verdict file.                                                                | [`phase-self-review.md`](.claude/workflows/phase-self-review.md)     |
| **Domain-review gate**        | Exit of `ux-flows`, `scenarios`, `wireframes` (after self-review, before human gate)  | `product-domain-reviewer` PASS — persona scope / workflow-phase fidelity / product vocabulary / primitive coherence vs `docs/product/` + `docs.blaxel.ai`. FAIL → owner revises; never bypass. | [`product-domain-reviewer`](.claude/agents/product-domain-reviewer.md) |
| **Scenarios gate**            | Wireframes entry for detail/diagnostic screens                                        | `scenarios.md` exists with 4–6 entry-path scenarios (persona, came-from, goal, 10-second audit question, header requirement, default-content requirement); wireframe answers every audit question. | [`design-phases.md`](.claude/workflows/design-phases.md) § Scenarios applicability |
| **Screen-spec parity**        | Exit of `screens` phase                                                               | Required Peer Parity Check section: header treatment / container pattern / tab placement / expand behavior / footnote sizing.                              | [`screen-spec-parity.md`](.claude/workflows/screen-spec-parity.md)   |
| **Artifact Rule**             | Any design artifact returned by `product-designer`, `motion-designer`, `scenario-strategist` | `oak_save_note` + link project + `agent:review` task + link note to task; scheme-correct links (vscode:// for source, /preview/ for HTML, never file://). | [`design-phases.md`](.claude/workflows/design-phases.md) § Designer Artifact Rule |
| **Phase gate**                | Designer attempts an artifact whose upstream isn't done                               | Stop + escalate via `agent:{topic}` task.                                                                                                                  | [`design-phases.md`](.claude/workflows/design-phases.md)             |
| **Spec gate**                 | Engineer has no screen spec, architect has no component spec, or either receives `.wireframe.md` | Stop + escalate to orchestrator.                                                                                                                          | engineer Workflow §1, architect Workflow §2                          |
| **Token policy**              | Any agent hits missing/wrong/unclear token                                            | Stop → designer decides → if new: foundations + Artifact Rule + approval → architect implements → caller resumes.                                          | [`docs/conventions/token-policy.md`](docs/conventions/token-policy.md) |
| **Adversarial review**        | Engineer reports "done" on `apps/**` or `packages/ui/**`                              | `frontend-reviewer` PASS/FAIL loop until PASS.                                                                                                             | [`frontend-reviewer`](.claude/agents/frontend-reviewer.md)           |
| **Pre-PR consolidation**      | Before any `release-manager` PR dispatch                                              | Inventory + fold of `.intermediate/` artifacts into canonical docs; re-run inventory grep to confirm clean.                                                | [`pre-pr-consolidation.md`](.claude/workflows/pre-pr-consolidation.md) |

**Known asymmetry:** `packages/libs/` has no adversarial reviewer — `library-engineer` self-reviews. Documented; intentional (utilities are smaller surface than UI primitives).

---

## Agent roster

All agents share the same shape: `INPUTS → OUTPUT → Scope → Hard Rules → Workflow → Delegation → References`.

| Agent                       | Owns                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| `product-designer`          | All canonical design-phase artifacts (personality → patterns), screen specs, foundations          |
| `motion-designer`           | Motion tokens, transitions, microinteractions, per-component animations                           |
| `scenario-strategist`       | Pre-wireframe scenario worksheets for detail/diagnostic screens (`.intermediate/discovery/`)      |
| `product-domain-reviewer`   | Adversarial PASS/FAIL on ux-flows / scenarios / wireframes — persona, workflow, vocabulary, primitives |
| `design-system-architect`   | Shared primitives in `packages/ui/` + token write                                                 |
| `library-engineer`          | Shared utilities in `packages/libs/`                                                              |
| `storybook-documenter`      | Storybook stories for design-system components                                                    |
| `unit-test-engineer`        | All unit tests in the repo (`**/*.test.{ts,tsx}`, `**/*.spec.{ts,tsx}`)                           |
| `staff-frontend-engineer`   | App-level code in `apps/**`                                                                       |
| `frontend-reviewer`         | Adversarial PASS/FAIL review of `apps/**` + `packages/ui/**`                                      |
| `accessibility-expert`      | WCAG, keyboard, screen-reader review                                                              |
| `release-manager`           | Commits, conventional commit messages, PR creation, merges                                        |

---

## Slash-command orchestration

Slash commands are the operator's entry into multi-agent chains. The orchestrator interprets the command file and fans out per the chain it defines.

| Command          | Chain                                                                                                                                | Definition                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `/add-component` | worktree → `design-system-architect` (with internal `frontend-reviewer` loop) → `accessibility-expert` → loop → `unit-test-engineer` → `storybook-documenter` → merge gate | [`add-component.md`](.claude/commands/add-component.md)          |
| `/add-lib`       | `library-engineer` → `unit-test-engineer` → merge gate                                                                               | [`add-lib.md`](.claude/commands/add-lib.md)                      |
| `/test:unit`     | `unit-test-engineer` (add or clean up tests for a component/library)                                                                 | [`test:unit.md`](.claude/commands/test:unit.md)                  |
| `/test:e2e-init` | Bootstrap Playwright Test Agents for an app                                                                                          | [`test:e2e-init.md`](.claude/commands/test:e2e-init.md)          |
| `/test:e2e`      | Author Playwright E2E test from a user-flow doc                                                                                      | [`test:e2e.md`](.claude/commands/test:e2e.md)                    |
| `/sys.optimize-doc` | Token-reducer pass on a doc for LLM consumption                                                                                   | [`sys.optimize-doc.md`](.claude/commands/sys.optimize-doc.md)    |
| `/git.clean-branches` | Local branch cleanup, keep main + dev                                                                                            | [`git.clean-branches.md`](.claude/commands/git.clean-branches.md) |

---

## Workflows — procedural backbone

Workflows in `.claude/workflows/` are method-call-style procedures the orchestrator and agents load on demand. They carry logic that used to live inline in CLAUDE.md.

| Workflow                          | Purpose                                                                                                                                     | Read by                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `design-phases.md`                | Canonical phase state machine (owner / entry / exit / path per phase) + Designer Artifact Rule                                              | Orchestrator, all designers, `scenario-strategist`   |
| `phase-self-review.md`            | Universal phase-exit gate — phase-owner + adversarial passes + marker-hygiene grep → verdict file                                            | Orchestrator                                         |
| `worktree-protocol.md`            | Solo vs chain spawn decisions, branch naming, merge gate by lifecycle phase                                                                 | Orchestrator, all worktree-isolated agents           |
| `worktree-return-protocol.md`     | Single-agent return semantics — commit-before-return, no nested spawns, no `git apply` of worktree diffs                                    | All worktree-isolated agents                         |
| `visual-qa.md`                    | Entry to `design-qa` — distinguishes ad-hoc audit captures from formal QA captures; viewports; states                                       | All engineers, `product-designer`                    |
| `screen-spec-parity.md`           | Required Peer Parity Check section + 5 axes for every screen spec                                                                           | `product-designer`                                   |
| `cross-screen-audit.md`           | Operator-triggered drift catcher (NOT a phase) — sibling-screen comparison → revise / file ticket / accept                                  | `product-designer`                                   |
| `pre-pr-consolidation.md`         | Fold `.intermediate/` artifacts into canonical docs before opening a PR                                                                     | Orchestrator → `product-designer`, `release-manager` |

---

## Shared substrate (canonical docs)

```
docs/conventions/
├── token-policy.md      ── engineer + architect + designer
├── tailwind-v4.md       ── engineer + architect
├── design-system.md     ── architect (Component Conventions + a11y checklist)
├── app-conventions.*    ── engineer (naming, folders, queries, loading/errors)
└── frontend-solutions.md── engineer (approved libs)

docs/design/
├── foundations/*.md     ── designer writes; architect reads to implement tokens
├── screens/
│   ├── *.wireframe.md   ── designer writes; gated by domain-review
│   └── *.screen.md      ── designer writes; engineer reads to implement UI
├── components/[name]/
│   ├── spec.md          ── designer writes; architect reads to implement
│   └── animations.md    ── motion-designer writes; architect reads
├── patterns/*.md        ── designer writes
├── guidelines/*.md      ── designer + motion-designer write; all read
├── reviews/
│   ├── qa-{date}.md     ── design-qa output; cites pixel evidence
│   └── screenshots/     ── formal design-qa captures (tracked)
└── audits/              ── cross-screen audit outputs

docs/testing/
└── unit-testing-guidelines.md  ── unit-test-engineer (Kent C. Dodds / Testing Library doctrine)

.intermediate/  (gitignored — workspace, never canonical)
├── discovery/{topic}/   ── scenarios, persona drafts, research notes
├── design/{topic}/      ── HTML previews, token explorations, wireframe drafts
├── reviews/             ── phase-self-review and domain-review verdict files
└── audits/{topic}/      ── ad-hoc engineer screenshots (self-verification)
```

Change a rule once in a canonical doc → every agent picks it up on next spawn. That's the point.

---

## Design principles behind the system (Garry Tan's "harness + skills")

1. **Thin harness, fat skills** — orchestration in CLAUDE.md is lightweight; judgment and procedure live in per-agent skill files and `.claude/workflows/`.
2. **Skills as method calls** — every agent declares `INPUTS` + `OUTPUT`; every workflow declares triggers, owner, and exit conditions. Callers pass parameters explicitly instead of dumping natural language.
3. **Resolver pattern** — per-task references; load docs on demand, don't prefetch.
4. **Latent vs deterministic** — LLM for judgment (spec compliance, compose vs extract, token semantics, domain-review); shell commands for precision (build, types, tests, marker grep).
5. **Single source of truth** — when a rule is enforced by one agent or workflow, others reference that doc rather than restating. Canonical policies live in `docs/conventions/`.
6. **Cheap gates run first** — marker grep before adversarial review before human approval. Mechanical checks catch unfilled scaffolding for free.
7. **Worktree isolation per chain, not per agent** — `/add-component` runs five agents in one shared `feat/<name>` worktree with one merge. No per-agent branches, no rebasing dance.

---

## Open gaps (deferred)

- `packages/libs/` has no adversarial reviewer. `library-engineer` self-reviews.
- No learning loop: `frontend-reviewer` findings never get written back into upstream docs (tailwind-v4.md, app-conventions.*, design-system.md).
- "Ask twice = fail" meta-rule (write a skill the second time you do something) not yet codified in CLAUDE.md.
- Phase self-review templates folder (`.claude/workflows/templates/`) referenced by `phase-self-review.md` but not yet populated — agents currently derive shape from canonical artifacts under `docs/`.
- `accessibility-expert`'s findings are not yet fed back into a checklist agents could pre-flight against.
