# Project State

**Current design phase:** `discovery`
**Current lifecycle phase:** `greenfield`
**Last transition:** 2026-06-17

> **Orchestrator only:** when a phase is about to exit (all planned outputs exist) or before dispatching the first agent of the next phase, load `.claude/workflows/phase-self-review.md` and run the gate. (Human readers: skip — workflow is agent-only.)
>
> **Live session registry** (who's working on what right now): see `.state/in-flight-work.md` — auto-maintained by SessionStart/SessionEnd hooks.

## Phase

One of: `discovery → (personality ‖ ux-flows) → design-tokens → wireframes → screens → components → patterns → motion → implementation → design-qa → review → ship`

`personality` and `ux-flows` run in parallel after discovery; both must be approved before `wireframes`. See `.state/phases.md` for entry/exit criteria and canonical paths per phase.

## Sub-status

`discovery` in flight.

| Artifact | Path | Status |
| --- | --- | --- |
| Platform brief | `docs/product/platform.md` | draft |
| Personas | `docs/product/personas.md` | draft |
| Primary persona workflow | `docs/product/alex-workflow.md` | pending |
| Primary persona user stories | `docs/product/alex-user-stories.md` | pending |
| Product brief | `docs/product/product.md` | draft |
| Personality | `docs/product/personality.md` | draft |

## Artifacts (canonical paths reference)

- Discovery anchors: `docs/product/{platform,personas,alex-workflow,alex-user-stories,product}.md`
- Personality: `docs/product/personality.md`
- UX flows: `docs/design/flows/` — _pending_
- Design tokens: `docs/design/foundations/` — _pending_
- Wireframes: `docs/design/screens/[feature].wireframe.md` — _pending_
- Screen specs: `docs/design/screens/[feature].screen.md` — _pending_
- Motion: `docs/design/foundations/motion.md` + `docs/design/components/[name]/animations.md` — _pending_
- Design-QA review: `docs/design/reviews/qa-{YYYY-MM-DD}.md` — _pending_
