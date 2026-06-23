"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";

interface BandFrameProps {
  /** Small-caps track label printed above the band content. */
  label: string;
  children: ReactNode;
  /** Tailwind override hook — callers can suppress the top divider with
   *  `border-t-0` when the preceding band reads as part of the same group. */
  className?: string;
}

// Flat band layout — track label + content, no Card chrome. Matches the
// account-billing band rhythm (small-caps label + content scroll).
export function BandFrame({ label, children, className }: BandFrameProps) {
  return (
    <section
      aria-label={label}
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-6",
        className,
      )}
    >
      <h2 className="font-mono typography-meta uppercase tracking-wider text-meta-foreground">
        {label}
      </h2>
      {children}
    </section>
  );
}
