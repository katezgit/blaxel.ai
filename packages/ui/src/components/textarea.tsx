// shadcn-source: https://ui.shadcn.com/docs/components/textarea (cli, 2026-05-26)
import * as React from "react"

import { cn } from "@repo/ui/lib/cn"
import { formFieldBoxVariants } from "@repo/ui/lib/form-field-box"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Shared box recipe with Input/Select/Combobox: bg, border, radius, transition,
        // disabled, aria-invalid, typography. Horizontal padding (px-2.5) aligns value text
        // with sibling form-field triggers.
        formFieldBoxVariants({ size: "md" }),
        // Multi-line overrides: drop the single-line fixed height, allow vertical growth + manual resize.
        "w-full h-auto min-h-18 py-2 resize-y",
        // Lift to form-field surface on focus — matches Input's non-slot focus modifier.
        "focus:bg-form-field-surface",
        "text-foreground placeholder:text-meta-foreground",
        // Focus ring — *:focus-visible in base.css (WCAG 2.4.11) owns it; errored variant via [aria-invalid="true"]:focus-visible.
        "disabled:placeholder:text-muted-foreground/70 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

export type TextareaProps = React.ComponentProps<"textarea">

export { Textarea }
