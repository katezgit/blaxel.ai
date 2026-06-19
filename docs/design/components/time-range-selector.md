# DateRangeSelector + DateTimeRangeSelector — component spec

Canonical decision layer for the range picker family. Anatomy, states, and failure modes are here. The `.tsx` files are the prop source of truth; this file explains the design intent and boundary between DS primitive and consumer composition.

**Two public components** are exported from this feature:
- `DateRangeSelector` — date-only (preset list + calendar). Use this when sub-day granularity is not needed.
- `DateTimeRangeSelector` — date + time + timezone (preset list + calendar + time column). Use this when users must specify exact times or manage timezones.

The two components share a private `RangePopoverContent` subcomponent and `useRangePopover` hook (`range-popover-base.tsx`) — internal implementation detail, not exported publicly.

---

## Decision layer

Alex opens the Cost view mid-investigation to answer "when did spend spike?" — needs to jump directly to "Last 3 days" or pull up a custom 6-hour window around the 22:14 UTC incident. Sam opens it to validate billing windows before a security review. Both sessions are purposeful, not exploratory: the selector must be fast to open, fast to apply a preset, and unambiguous about what range is committed. No tooltip coaching, no animation ceremony, no "What is a time range?" affordance.

**Range-only — no single-instant mode.** The analytics surfaces this component serves (Cost, usage/billing windows, monitoring) require a start + end to be meaningful. A single-day selection resolves to the calendar-day boundary (00:00–23:59:59 UTC of the selected date), not a single instant. A separate `DatePicker` primitive handles single-date selection if that need arises; `TimeRangeSelector` does not conflate the two. Keeping the shapes distinct preserves the state machine: range selection always has a two-point commitment; single-date selection has a one-point commitment. Mixing them into one component with a mode prop introduces hidden branching that obscures the canonical range behavior.

---

## Dependency gap — Calendar primitive required

No `Calendar` (month-grid, range-selection) primitive exists in `packages/ui/src/components/`. The engineer implementing this component must either:

1. Install `react-day-picker` (v8 or v9, already common in shadcn stacks) and wrap it as a thin styled `Calendar` primitive in `packages/ui/src/components/calendar.tsx`, exporting `Calendar`, `CalendarProps` — following the same shadcn source-comment convention as the other primitives. This is the preferred path — it gives other consumers a reusable Calendar.
2. Inline the month grid inside `TimeRangeSelector` itself if calendar reuse is not needed elsewhere in the product now. In that case, note the decision in a code comment and revisit when a second consumer appears.

**Return with this question before implementing if path is unclear.** Do not ship a bespoke grid that diverges from the shadcn/radix pattern the rest of the DS follows.

---

## Primitive boundary — DS vs consumer

`TimeRangeSelector` is a DS primitive because its behavior (popover trigger → preset list + calendar + time/timezone inputs → committed range) is fully generic: no domain constants, no domain wording. It passes the DS test:

- A cost-analytics surface, a usage-billing surface, a monitoring surface, and a hypothetical scheduling surface in a different industry can all consume it unchanged.
- It has no opinion about which presets exist — those are passed in by the consumer.
- It has no opinion about what "cost" or "billing window" or "incident" means — it is a range picker.

**What stays at the consumer:**
- The preset list items (labels + values) — supplied via `presets` prop.
- Default range on mount — supplied via `value` prop.
- Default timezone — supplied via `timezone` prop (defaulting to UTC is the DS default; consumer overrides if they have a workspace-preferred zone).
- Any downstream chart/query invalidation triggered by `onChange`.
- Formatting the committed range as a display string in the trigger button — the consumer decides how to label the closed state (e.g., "Last 3 days", "Jun 13 – Jun 16, 2026", "22:14 – 23:00 UTC").

---

## Composed primitives

This component is a composition of existing `packages/ui/src/components/` primitives. No parallel implementations.

| Slot | Primitive | Notes |
|---|---|---|
| Trigger button | `Button` (variant `secondary`) | Carries a `CalendarIcon` (lucide) on the left; consumer supplies visible label text via `children` prop; accessible name via `aria-label` (purpose + current value) |
| Popover shell | `Popover`, `PopoverContent` (variant `filter`) | `PopoverContent` at `filter` variant provides 16px panel padding; `min-w` overridden to fit three-column layout |
| Preset list | Native `<ul role="listbox">` + `<li role="option">` with roving tabindex | Renders consumer-supplied `presets[]`; selected item shows `CheckIcon`. Not cmdk — cmdk requires `CommandInput` for arrow-key navigation; `CommandItem` without `CommandInput` renders as a non-focusable `div[role=option]`, making the preset column keyboard-unreachable. |
| Timezone select | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` | Consumes `timezone` + `onTimezoneChange`; consumer supplies the list of timezone options |
| Date + time inputs | `Input` (type `text`, with icon adornment slot) | FROM date / TO date / FROM time / TO time; each has an icon-button (`IconButton`) for calendar or clock affordance (opens the calendar focus-trapped to the relevant bound) |
| Calendar grid | `Calendar` (new primitive, see Dependency gap above) | Range mode; `selected` = current `value`; `onSelect` fires `onChange` for preset-matched ranges; for custom ranges fires intermediate state |
| Separator | `Separator` | Between preset column and calendar+time columns |
| "Remove time" affordance | `Button` (variant `ghost`, size `xs`) | Visible only in `date+time` mode; fires `onRemoveTime` — consumer collapses the range to date-only boundaries (00:00–23:59:59) |

---

## Public prop surface

```ts
// Shared types (exported from date-range-selector.tsx)
type DateTimeRange = {
  start: Date
  end: Date
}

type RangePreset = {
  label: string          // e.g. "Last 3 days"
  value: DateTimeRange   // resolved at render time by consumer
}

// DateRangeSelector
interface DateRangeSelectorProps {
  value: DateTimeRange
  onChange: (range: DateTimeRange) => void
  presets: RangePreset[]
  disabled?: boolean
  className?: string
  "aria-label"?: string  // default: "Select date range"
  children?: React.ReactNode  // visible trigger label
}

// DateTimeRangeSelector (additional props)
type DateTimeRangeSelectorTimezoneOption = { label: string; value: string }

interface DateTimeRangeSelectorProps {
  value: DateTimeRange
  onChange: (range: DateTimeRange) => void
  presets: RangePreset[]
  timezone?: string                                  // IANA tz string, default "UTC"
  timezoneOptions?: DateTimeRangeSelectorTimezoneOption[]  // omit → plain text display
  onTimezoneChange?: (tz: string) => void
  onRemoveTime?: () => void                          // consumer switches to DateRangeSelector
  disabled?: boolean
  className?: string
  "aria-label"?: string  // default: "Select time range"
  children?: React.ReactNode
}
```

**Trigger label split rationale.** The accessible name and the visible text serve different purposes: the accessible name identifies purpose + value for screen readers (kept stable across selections so AT announces context correctly); the visible text is the consumer's formatted range string (varies per selection). Conflating them forces the consumer to put the full purpose string ("Select time range, current value: …") in visible text, which is verbose and not how visual UIs work. The split — `aria-label` for SR name, `children` for visible text — matches the ARIA button-label pattern used by most date picker implementations.

**Split rationale.** The two components exist because `DateTimeRangeSelector` renders a structurally different tree (time column, timezone select, additional inputs) — not just token swaps. Adding a `mode` prop to a single composite that conditionally renders an entire column is the children-switching anti-pattern. Two thin components that share a private hook + content subcomponent is the correct DS split: each component's structural tree is stable, the shared logic lives in the private hook.

---

## Anatomy

```
[Trigger Button: "Last 3 days ▾"]
      ↓ open
┌─────────────────────────────────────────────────────────┐
│ [Preset list]  │  [Calendar month grid]  │  [Time col] │
│                │                         │             │
│ ✓ Last 3 days  │  ◀ June 2026 ▶         │ TIMEZONE    │
│   Last 6 hours │  Su Mo Tu We Th Fr Sa  │ [UTC     ▾] │
│   Last 12 hrs  │   1  2  3  4  5  6  7  │             │
│   Today        │   8  9 10 11 12 13 14  │ FROM        │
│   Last 7 days  │  15 16 [17]~~[18]~~19  │ [Jun 17 🗓] │
│   Last 30 days │  20 21 22 23 24 25 26  │ FROM TIME   │
│   Last 90 days │  27 28 29 30           │ [00:00   🕐] │
│   This month   │                        │             │
│   This quarter │                        │ TO          │
│   This year    │                        │ [Jun 19 🗓] │
│                │                        │ TO TIME     │
│                │                        │ [23:59   🕐] │
│                │                        │             │
│                │                        │ × REMOVE TIME│
│────────────────┴─────────────────────── ┴─────────────│
│                                [Cancel]  [Apply]       │
└─────────────────────────────────────────────────────────┘
```

Three columns inside `PopoverContent`:

1. **Preset column** — `Command` + `CommandItem` list. Consumer supplies all items. Selected item shows `CheckIcon`. Clicking a preset immediately calls `onChange` with the resolved `DateTimeRange` and closes the popover — no Apply needed for presets (preset = committed intent; custom range = draft intent requiring Apply).

2. **Calendar column** — `Calendar` primitive in range mode. Range start/end rendered at `bg-selected-surface` / `text-foreground`; intermediate days rendered at `bg-primary-soft` / `text-foreground`. Month nav arrows in header. Clicking start day enters custom-range-being-drawn state; clicking end day transitions to custom-range-complete (both days filled); end day same as start day = single-calendar-day range (collapses to 00:00–23:59:59 of that date in date-only mode, or preserves time inputs in date+time mode).

3. **Time + timezone column** (visible only when `mode="date+time"`):
   - **TIMEZONE** label + `Select` (no hardcoded list — consumer passes options).
   - **FROM** date `Input` + calendar `IconButton` (focuses calendar on the start bound).
   - **FROM TIME** `Input` (HH:MM, 24h).
   - **TO** date `Input` + calendar `IconButton` (focuses calendar on the end bound).
   - **TO TIME** `Input` (HH:MM, 24h).
   - **× REMOVE TIME** `Button` (ghost, xs) — collapses to date-only mode by calling `onRemoveTime`.

**Action row** (below all three columns): `Cancel` (ghost, sm) dismisses without committing; `Apply` (primary, sm) commits the current custom draft and calls `onChange`. Apply is disabled while `custom-range-being-drawn` (start picked, end not yet picked) and while end < start. Presets bypass this row entirely — they commit immediately.

---

## State machine

**Closed.** Trigger button shows the committed range summary. Trigger is focusable; Enter/Space opens the popover.

**Open · preset-selected.** Popover visible. Preset matching `value` shows a CheckIcon. Calendar renders the committed range. Time column (if mode=date+time) shows committed times. Apply is not shown as urgently needed — the committed state is already applied.

**Open · custom-range-being-drawn.** User clicked a calendar day; start is set, end is not. Start day renders with `bg-selected-surface`. Intermediate days (as the user hovers toward an end day) render with `bg-primary-soft` via pointer-follow (mouse-hover preview). No preset carries a CheckIcon. Apply is disabled.

**Open · custom-range-complete.** User clicked a second day (or the same day again). Both start and end are set. Start and end render at `bg-selected-surface`; intermediate days at `bg-primary-soft`. Apply becomes enabled. Time inputs (if mode=date+time) are editable and affect the draft range.

**Date-only mode.** Time column hidden. Only preset list and calendar visible. Popover width narrows — `max-w` can be reduced by consumer via `className` on trigger or by a future `popoverClassName` prop.

**Date+time mode.** Time column visible. "× Remove time" visible. Timezone select visible.

**Timezone changed.** `onTimezoneChange` fires. Consumer is responsible for re-computing `value` in the new zone and calling `onChange` if the displayed range should shift. The DS does not perform timezone math — it is a display + input layer.

**Invalid range (end < start).** Calendar shows end day in errored state — `text-state-errored` on the end-bound day. Apply button disabled. Inline copy below the calendar: `"End must be after start"` in `text-state-errored-text`. The error is inline, not a toast.

**Disabled.** Trigger has `disabled` attribute. Popover cannot open. Trigger renders with `opacity-disabled` (via Button's disabled variant).

---

## Visual tokens

All tokens from `packages/ui/src/styles/theme.css`.

| Element | Token |
|---|---|
| Popover surface | `bg-popover` / `text-popover-foreground` |
| Popover border | `border-border` |
| Popover shadow | `shadow-popover` |
| Trigger button | Button `outline` variant (inherits `bg-control-raised`, `border-border`, `text-foreground`) |
| Trigger open-state ring | `shadow-focus-ring` (via `data-[state=open]:shadow-focus-ring` on `PopoverTrigger`) |
| Preset item hover | `bg-accent` / `text-accent-foreground` (via `CommandItem` default) |
| Preset item selected (check) | `text-foreground` + `CheckIcon` in `text-primary` |
| Calendar range start/end fill | `bg-selected-surface` / `text-foreground` |
| Calendar intermediate days fill | `bg-primary-soft` / `text-foreground` |
| Calendar today indicator | `text-primary` (underline or dot — Calendar primitive decides exact treatment) |
| Calendar nav arrows | `text-muted-foreground` / hover `text-foreground` |
| Calendar month header | `text-label` / `font-medium` / `text-muted-foreground` |
| Column separator | `bg-border` (via `Separator`) |
| Section label (TIMEZONE, FROM, TO) | `text-label` / `text-meta-foreground` / uppercase tracking |
| Input rest | `bg-field-rest` / `border-form-field-border` |
| Input focus | `shadow-focus-ring` |
| Invalid end-day text | `text-state-errored-text` |
| Invalid inline error copy | `text-state-errored-text` |
| Apply (enabled) | Button `default` variant — `bg-primary` / `text-primary-foreground` |
| Apply (disabled) | Button `default` disabled — `bg-primary-disabled` |
| Cancel | Button `ghost` variant — `bg-transparent` / `text-foreground` |
| Remove time | Button `ghost` / `size-xs` — `text-muted-foreground` / hover `text-foreground` |
| Trigger disabled | `opacity-mid` (via Button `disabled` prop) |

---

## Spacing

Per `docs/design/foundations/spacing.md` canonical scale — no off-scale values.

| Location | Value |
|---|---|
| `PopoverContent` internal padding | `p-4` (16px — `filter` variant) |
| Gap between the three columns | `gap-4` (16px) |
| Separator (between preset and calendar columns) | `mx-4` (16px horizontal margin) |
| Preset list item padding | `px-2 py-1` (8px / 4px — CommandItem default) |
| Gap between section label and control (TIMEZONE → Select) | `gap-1.5` (6px) |
| Gap between FROM/TO blocks | `gap-4` (16px) |
| Gap between date input and time input within a bound | `gap-1` (4px) |
| Action row top gap | `pt-4` (16px) |
| Action row button gap | `gap-2` (8px) |

---

## Keyboard and a11y model

**Focus order:** Trigger → (popover opens, focus enters) → preset listbox (first item or selected item) → Tab moves to Calendar grid → Tab moves into Time column (if visible): Timezone Select → FROM date input → FROM time input → TO date input → TO time input → Remove time button → Cancel → Apply.

**Preset list (native `<ul role="listbox">`).** Arrow keys move between items (roving tabindex). Enter/Space selects, calls `onChange`, closes popover. `Escape` closes popover without committing, returns focus to trigger.

**Calendar grid.** Arrow keys move day focus (←/→ previous/next day, ↑/↓ previous/next week, Home/End first/last day of month, PageUp/PageDown previous/next month). Enter commits the focused day as the next range point (first press = start, second press = end). `Escape` closes the popover without committing (draft discarded) — keeping it open and returning to presets adds implementation complexity for marginal benefit; closing is the simpler, defensible behavior.

**Time inputs.** Standard text input behavior. No custom arrow-key interception — let the browser handle cursor movement within the field.

**Close paths.**
- `Escape` from trigger or from within the popover closes without committing (draft discarded; `value` unchanged).
- Click outside the popover closes without committing.
- Preset click closes with immediate `onChange`.
- Apply click closes with `onChange` for the custom draft.
- Cancel click closes without committing.

**ARIA.** `PopoverTrigger` carries `aria-haspopup="dialog"`, `aria-expanded`, and `aria-label` (purpose + current value, e.g. "Select time range, current value: Last 3 days"). The popover panel is `role="dialog"` with `aria-label` matching the trigger. The preset list is a native `<ul role="listbox" aria-label="Presets">` with `<li role="option" aria-selected>` items and `aria-activedescendant` on the list root. Calendar grid cells are `role="gridcell"` with `aria-selected` and `aria-label` formatted as the full date string (managed by react-day-picker). A `aria-live="polite"` region inside the dialog narrates draw-state transitions: "Start date {date} selected. Choose end date." → "Range {start} to {end} selected. Press Apply." → error message when end < start.

---

## Failure modes / drift

**Hardcoded preset list.** Consumer ships "Last 7 days" hardcoded in the DS. A new surface needs "Last 15 minutes" — the DS is now wrong for it. Fix: presets are always a prop. The DS renders whatever the consumer passes.

**Timezone math inside the DS.** The component starts computing UTC offsets, converting `Date` objects between zones, or storing timezone-adjusted copies of `value` internally. This leaks domain logic into the primitive and breaks consumers who manage timezone in a global store. Fix: DS is a display and input layer. It emits the raw inputs (`timezone`, `start`, `end` as strings or `Date`) and lets the consumer do the math.

**Auto-closing on calendar day click.** The designer shortens the interaction: click a day range, popover closes immediately. Works for presets (single intent). Fails for custom range: the user clicked the start day and the popover closed — they never got to pick the end. Fix: custom range only commits on Apply. Presets commit immediately and close.

**Apply visible on preset paths.** A preset is selected; Apply appears enabled. User thinks they need to click Apply. They click it; nothing changes (the preset already committed). Confusion. Fix: presets close the popover and call `onChange` immediately — Apply is never shown as active after a preset selects. Apply is the custom-range commit path only.

**Using DateTimeRangeSelector on a date-only surface.** The consumer uses `DateTimeRangeSelector` on a surface that doesn't need time inputs, resulting in an unnecessarily wide popover and confusing time fields. Fix: use `DateRangeSelector` for date-only surfaces. The split is explicit — choosing the right component is a consumer decision, not a prop on a shared component.

**Off-scale spacing.** Designer specifies `gap-5` (20px) between the three columns to "make it breathe." Fix: `gap-4` (16px) or `gap-6` (24px) — pick the scale value. `gap-5` is off-scale per spacing.md.

**Custom colors on calendar day fills.** Engineer hard-codes `#E5EDFF` for intermediate days because `bg-primary-soft` "looks too orange." Fix: `bg-primary-soft` is the token. If the token reads incorrectly, the token is the problem — escalate to design-system-architect, do not patch inline.
