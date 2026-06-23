import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";

interface BandProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  // Drop the top divider rule but keep top padding. Used when the band
  // above terminates with its own bordered chrome (e.g. table card) and
  // an extra hairline would read as double-bordered.
  attachAbove?: boolean;
}

// Flat band layout with editorial section heading. Divider rule + 16px sans
// semibold subhead reads as a magazine section, not a micro-tag.
export default function Band({ title, children, action, attachAbove }: BandProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        "flex flex-col gap-4 pt-6 first-of-type:pt-0",
        !attachAbove && "border-t border-border first-of-type:border-t-0",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="typography-subtitle text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
