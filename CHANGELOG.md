# Changelog

---

## 2026-06-20 — feat(portal): consolidate workspace shells and add loading skeletons ([#43](https://github.com/katezgit/blaxel.ai/pull/43))

### Added
- `ShellFrame` shared primitive (`apps/portal/src/components/shell/shell-frame.tsx`) — structural wrapper used by both real shells and their skeletons to guarantee identical DOM shape
- `WorkspaceShellSkeleton` and `AccountShellSkeleton` — Suspense fallback shells that hold the chrome shape while data loads
- `RouteSpinner` shared component wired into per-segment `loading.tsx` files and skeleton main slots
- Per-segment `loading.tsx` at `(account)/loading.tsx` and `[workspaceSlugOrId]/loading.tsx`

### Changed
- `WorkspaceShell` hoisted to `[workspaceSlugOrId]` segment — resources and settings now share one shell instance
- Workspace layout split into `WorkspaceShellHost` (permission gate) and `WorkspaceShellData` (data layer) serialized through the same Suspense window

### Removed
- `(resources)/layout.tsx` and `settings/layout.tsx` — shell responsibility moved up to the segment
- `workspace-settings-shell.tsx`, `workspace-settings-topbar.tsx`, `workspace-topbar.tsx` — consolidated into the unified `WorkspaceShell`

---

## 2026-06-20 — fix(portal): tighten page-shell top padding to on-canon pt-8 (32px) ([#38](https://github.com/katezgit/blaxel.ai/pull/38))

### Fixed

- Page-shell top padding corrected from `pt-6` (24px) to `pt-8` (32px) after app-shell migration moved the upper boundary from the raw browser viewport to the topbar.

---

## 2026-06-19 — feat(ui): DateRangeSelector + DateTimeRangeSelector DS primitives ([#8](https://github.com/katezgit/blaxel.ai/pull/8))

### Added

- `DateRangeSelector` — date-only range picker with preset list, calendar, and Cancel/Apply actions.
- `DateTimeRangeSelector` — extends date range with timezone selector and From/To time inputs.
- `Calendar` primitive — react-day-picker v10 with token-bound styles; `single | multiple | range` selection modes.
- `range-popover-base.tsx` — internal shared hook and layout for both range selectors.

---
