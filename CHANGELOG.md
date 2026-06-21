# Changelog

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
