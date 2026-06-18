# TODO

## Technical Architecture — Data Manipulation

- [ ] Define data flow boundaries (server → client, client → server)
- [ ] Decide push transport per surface (SSE vs WebSocket vs polling)
  - [ ] Sandbox state transitions
  - [ ] Agent / job log streams
  - [ ] Trace spans
  - [ ] Build / deploy status
  - [ ] Interactive sandbox shell (bidirectional)
- [ ] Data fetching strategy (RSC, client cache, revalidation)
- [ ] Mutation strategy (server actions, optimistic updates, rollback)
- [ ] Real-time subscription lifecycle (connect, reconnect, cleanup)
- [ ] Error / retry / backoff policy
- [ ] Auth propagation to streaming endpoints

## Reminders from cleanup session (2026-06-17)

### Favicon — confirm the asset
- Created `apps/portal/src/app/icon.svg` by extracting the gradient sphere from `public/blaxel-logo.svg` (the existing SVG is wordmark+icon at ~3.48:1 aspect, illegible at 16×16 tab size).
- If you have a dedicated icon-only / square Blaxel asset, drop it at `apps/portal/src/app/icon.svg` to replace.

### Brand asset gap — icon-only mark
- Only combined wordmark+icon SVGs live in `apps/portal/public/` (`blaxel-logo.svg`, `blaxel-logo-dark.svg`).
- 404 page (`global-not-found.tsx`) currently uses the wordmark+icon. Cartesia reference uses icon-only — needs an icon-only asset to match exactly.
- The legacy `packages/ui/src/components/brand-mark.tsx` (`BrandMark`, `BrandMarkSquare`) is HUD-branded (notched-rectangle SVG mark + `aria-label="HUD"` + wordmark string `"HUD"`). Not used by anything anymore after the 404 swap — safe to delete or rewrite for Blaxel.

### Brand mark sidebar alignment — verify visually
- Bumped `BrandMark` wrapper from `h-11 px-3` to `h-14 px-4` to align the brand-icon left edge with the nav-row icon column (both at 16px from sidebar edge) and add breathing room before the first nav item.
- Worth eyeballing against the Cartesia reference once on the running app — if you want more vertical air, bump to `h-16` or add `pb-2` to the wrapper.

### Mock cleanup — what's left and why
- Deleted 15 HUD-era files from `apps/portal/src/lib/mock/`: `agent-attachments`, `agent-environments`, `agent-scenarios`, `agents`, `eval-models`, `home-jobs`, `job-create`, `job-detail`, `library`, `model-registry`, `performance`, `start-scenario-run`, `taskset-actions`, `tasksets`, `trace-detail`.
- Kept 6: `data`, `role`, `role-context`, `types`, `explore-models`, `index`. These are still imported by `(manage)/*` (members, billing, secrets, api-keys, limits, usage, profile, organization), `(app)/models/*`, and `components/shell/*` (`app-shell`, `avatar-menu`, `avatar-pill`, `dev-role-switcher`).
- These remaining mocks are placeholders for live data — replace as backend wires up.

### Stale HUD references still in the repo
- Root `CLAUDE.md` references `docs/product/` (Blaxel) — good.
- But still found stale "HUD" / "tasksets" / "evals" / "rewards" language in places worth a sweep when you have time:
  - `docs/design/**` component specs (some may carry over Blaxel-relevant patterns; some may still use HUD vocab in examples — verify per file)
  - `.state/state.md` — likely stale phase notes
  - Any `*.test.*` that asserts on HUD copy
- I did NOT do a content-grep sweep of `docs/` — only filename check (no HUD/eval-named files). Suggest a follow-up grep pass when you have bandwidth.
