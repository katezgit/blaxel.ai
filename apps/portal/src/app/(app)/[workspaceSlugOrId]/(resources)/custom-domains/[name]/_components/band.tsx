import type { ReactNode } from "react";

interface BandProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

// Flat band layout with editorial section heading. Divider rule + 16px sans
// semibold subhead reads as a magazine section, not a micro-tag.
export default function Band({ title, children, action }: BandProps) {
  return (
    <section
      aria-label={title}
      className="flex flex-col gap-4 border-t border-border pt-6 first-of-type:border-t-0 first-of-type:pt-0"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="typography-subtitle text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
