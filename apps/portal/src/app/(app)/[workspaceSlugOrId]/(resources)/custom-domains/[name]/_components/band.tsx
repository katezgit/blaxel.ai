import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";

interface BandProps {
  title: string;
  children: ReactNode;
  /** When set, lifts the band off the baseline rhythm — Verification band uses
   *  this on failed status per the failure-outranks-success contract. */
  elevated?: boolean;
  /** Right-aligned slot beside the title — used by bands that carry their own
   *  inline actions (none today, but the slot keeps composition open). */
  action?: ReactNode;
}

export function Band({ title, children, elevated, action }: BandProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-md border border-border bg-card p-6",
        elevated && "border-state-errored-subtle bg-state-errored-subtle",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="typography-label font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
