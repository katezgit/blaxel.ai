import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";

interface BandFrameProps {
  /** Section heading printed above the band content. Mixed case, H2 weight —
   *  matches the editorial detail-page rhythm shared with Custom Domains. */
  label: string;
  /** Optional action rendered right-aligned in the heading row. Reveal-on-hover
   *  is the caller's concern (typically `opacity-0 group-hover:opacity-100`);
   *  BandFrame adds the `group` class so the pattern works. */
  action?: ReactNode;
  children: ReactNode;
  /** Tailwind override hook — callers can suppress the top divider with
   *  `border-t-0` when the preceding band reads as part of the same group. */
  className?: string;
}

// Flat band layout with editorial section heading. Mirror of the Custom
// Domains Band primitive so both detail surfaces share rhythm: 16px sans
// semibold subhead, 1px divider above, no card chrome.
export default function BandFrame({ label, action, children, className }: BandFrameProps) {
  return (
    <section
      aria-label={label}
      className={cn(
        "group flex flex-col gap-4 border-t border-border pt-6",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="typography-subtitle text-foreground">{label}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
