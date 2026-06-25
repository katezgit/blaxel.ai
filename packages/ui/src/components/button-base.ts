// Shared base classes for Button + IconButton.
// Both wrap the same <button> element; only the size/shape variants differ.
// gap, rounded-*, text-*, font-weight, and svg size are injected by size variants.
//
// Disabled selectors cover both native :disabled AND [aria-disabled="true"].
// aria-disabled keeps the button focusable (tooltip / screen-reader announcements).
// The [data-loading] guard: loading is "busy but valid", not "invalid" — Mantine/Primer
// pattern. Cursor-not-allowed must NOT apply during loading (loading has its own cursor).
// Per-variant bg overrides carry the same guard in button.tsx.
//
// Text color: disabled state does NOT change text color — only bg is dimmed.
// See new rule: state-machine row "Disabled" → text = variant text UNCHANGED.
export const buttonBaseClasses = [
  "inline-flex shrink-0 items-center justify-center",
  "cursor-pointer",
  "whitespace-nowrap",
  "font-sans",
  "transition-colors duration-150",
  // cursor-not-allowed: native disabled + aria-disabled focusable path.
  // Loading keeps default cursor (button is busy, not invalid) — guard with not([data-loading]).
  // aria-disabled: use built-in modifier (generates [aria-disabled="true"] selector correctly).
  "disabled:[&:not([data-loading])]:cursor-not-allowed aria-disabled:[&:not([data-loading])]:cursor-not-allowed",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
] as const
