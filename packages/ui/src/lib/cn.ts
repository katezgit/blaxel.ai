import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Project-wide `cn` with tailwind-merge taught about our custom typography
 * utilities so it doesn't silently dedupe them against `text-<color>` classes.
 *
 * Background — tailwind-merge groups every `text-*` utility under the
 * `text-color` group by default. That means a string like
 * `cn("text-body", "text-foreground")` would silently DROP one of the two
 * (last-class-wins within a group), because tailwind-merge has no way to
 * know that `text-body` is a font-size utility, not a color.
 *
 * We declare our custom font-size utilities here so tailwind-merge classifies
 * them correctly. Any consumer combining a custom size utility with a color
 * utility now gets both, regardless of order in the className string.
 *
 * Keep this list in sync with `@utility text-*` definitions in
 * `packages/ui/src/styles/utilities.css`.
 */
const twMerge = extendTailwindMerge({
  override: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "subtitle",
            "body",
            "label",
            "caption",
            "code",
            "meta",
            "table-header",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
