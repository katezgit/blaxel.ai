# Changelog

---

## 2026-07-01 — refinement(portal/custom-domains): promote status badge to second column + h1 inline ([#215](https://github.com/katezgit/blaxel.ai/pull/215))

### Changed

- Custom domains list table column order: Status now appears second (after Domain), ahead of Region, reflecting its role as the primary decision signal.
- Custom domains detail header: status is now rendered as the same `DomainStatusBadge` filled pill used on the list, placed inline next to the h1, replacing the plain-text label in the meta row.

---

## 2026-07-01 — refinement(portal/workspace-switcher): mute name at rest, brighten on hover ([#214](https://github.com/katezgit/blaxel.ai/pull/214))

### Changed

- Workspace-switcher trigger: name now renders muted at rest and brightens on hover, reducing visual competition with sidebar nav labels.

---

## 2026-06-28 — fix(portal/api-keys): rebalance Create API key dialog proportions ([#139](https://github.com/katezgit/blaxel.ai/pull/139))

### Fixed

- Create API key dialog resized from 560px to 400px (`size="sm"`) to match its actual form footprint (short identifiers and short-option selects)
- Service-account/Member and Expires-in selects capped at 224px to align with the Holder segmented control's natural width, eliminating ~310px of orphaned empty space on the right

---

## 2026-06-28 — fix(ui/chip): restore info-checked selection visibility ([#136](https://github.com/katezgit/blaxel.ai/pull/136))

### Fixed

- `light × info × checked` chip variant: bg and border tokens swapped from alpha-tint (`state-running-subtle`) to solid-mix (`alert-info-bg` / `state-running`) so selection is perceptually visible in dark mode

---

## 2026-06-27 — docs(workflow): add "no action is a valid action" hard rule ([#135](https://github.com/katezgit/blaxel.ai/pull/135))

### Changed

- Added "No action is a valid action" hard rule to `CLAUDE.md` — zero literal matches must produce zero action, not a nearest-match substitute.

---

## 2026-06-24 — fix(portal): network empty state + usage breakdown scoping ([#114](https://github.com/katezgit/blaxel.ai/pull/114))

### Fixed

- Network page now shows a proper empty state instead of a bare heading and "Coming soon." text
- Usage breakdown options are scoped per active tab and resource filter; the Usage tab is no longer disabled

---

## 2026-06-24 — feat(portal): 404 family — sub-shell preservation + resource-detail unification ([#92](https://github.com/katezgit/blaxel.ai/pull/92))

### Fixed

- Sub-shell layouts (Profile, Account, Plan & billing, Settings) now render an in-shell 404 block on unmatched URLs instead of falling through to the chrome-less global not-found page.
- Policy and Custom Domain resource-detail not-found surfaces unified into the shared centered-block 404 pattern.

---

## 2026-06-23 — refactor(portal): align custom domains UI with documented API ([#84](https://github.com/katezgit/blaxel.ai/pull/84))

### Changed

- Custom Domains list header: replaced marketing copy with factual capability + tier sentence.
- Custom Domains detail header: description now surfaces display name, region, and status inline.
- Add Domain dialog: `displayName` (Label) field added between Name and Region.
- DNS records band: failing TXT shown in soft error callout with `--color-dns-record-error-bg` token.
- Retry verification button tooltip: "Re-check DNS records now."
- `formatRegion` fallback: no longer duplicates slug when label matches slug.

### Removed

- `cli-band.tsx`: undocumented surface dropped.
- `_blaxel-ca` TXT records: removed from mock fixtures (undocumented by platform).
- Certificate band: hidden when domain is not yet verified.

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
