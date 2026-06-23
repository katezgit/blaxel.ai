"use client";

import type { ReactNode } from "react";

interface BandFrameProps {
  /** Small-caps track label printed above the band content. */
  label: string;
  children: ReactNode;
}

// Flat band layout — track label + content, no Card chrome. Matches the
// account-billing band rhythm (small-caps label + content scroll).
export function BandFrame({ label, children }: BandFrameProps) {
  return (
    <section
      aria-label={label}
      className="flex flex-col gap-3 border-t border-border pt-6"
    >
      <h2 className="font-mono typography-meta uppercase tracking-wider text-meta-foreground">
        {label}
      </h2>
      {children}
    </section>
  );
}
