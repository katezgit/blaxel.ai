// Shared base classes for Button + IconButton.
// Both wrap the same <button> element; only the size/shape variants differ.
// Defaults here: font-sans (primary overrides to font-mono) and disabled text token.
// gap, rounded-*, text-*, font-weight, and svg size are injected by size variants.
//
// Disabled selectors cover both native :disabled AND [aria-disabled="true"].
// aria-disabled keeps the button focusable (tooltip / screen-reader announcements).
// The [data-loading] guard: loading is "busy but valid", not "invalid" — Mantine/Primer
// pattern. Cursor-not-allowed and text-disabled must NOT apply during loading; loading
// has its own visual treatment. Per-variant bg overrides carry the same guard in button.tsx.
export const buttonBaseClasses = [
  "inline-flex shrink-0 items-center justify-center",
  "cursor-pointer",
  "whitespace-nowrap",
  "font-sans",
  "transition-colors duration-150",
  // cursor-not-allowed: native disabled + aria-disabled focusable path
  "disabled:cursor-not-allowed [aria-disabled='true']:cursor-not-allowed",
  // text-disabled: only when NOT in loading state
  "disabled:[&:not([data-loading])]:text-text-disabled [aria-disabled='true']:[&:not([data-loading])]:text-text-disabled",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
] as const
