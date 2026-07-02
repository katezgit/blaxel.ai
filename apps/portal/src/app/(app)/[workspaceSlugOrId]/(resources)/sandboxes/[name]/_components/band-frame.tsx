import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";

interface BandFrameProps {
  label: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

// Editorial detail-band primitive — mirror of the Policy detail band rhythm
// (`policies/[name]/_components/band-frame.tsx`). Sandbox detail uses the
// same hairline-divided sections so detail surfaces share visual rhythm.
export default function BandFrame({
  label,
  action,
  children,
  className,
}: BandFrameProps) {
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
