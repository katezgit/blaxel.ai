"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";

interface BandFrameProps {
  /** Section heading printed above the band content. Mixed case, H2 weight —
   *  matches the editorial detail-page rhythm shared with Custom Domains. */
  label: string;
  children: ReactNode;
  /** Tailwind override hook — callers can suppress the top divider with
   *  `border-t-0` when the preceding band reads as part of the same group. */
  className?: string;
}

// Flat band layout with editorial section heading. Mirror of the Custom
// Domains Band primitive so both detail surfaces share rhythm: 16px sans
// semibold subhead, 1px divider above, no card chrome.
export function BandFrame({ label, children, className }: BandFrameProps) {
  return (
    <section
      aria-label={label}
      className={cn(
        "flex flex-col gap-4 border-t border-border pt-6",
        className,
      )}
    >
      <h2 className="typography-subtitle text-foreground">{label}</h2>
      {children}
    </section>
  );
}
