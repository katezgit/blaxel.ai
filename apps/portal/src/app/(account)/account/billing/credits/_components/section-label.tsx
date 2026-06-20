import { cn } from "@repo/ui/lib/cn";

interface SectionLabelProps {
  letter: string;
  label: string;
  /**
   * DOM id rendered on the label text span so the wrapping `<section>` can
   * point `aria-labelledby` at it for an accessible section name.
   */
  id?: string;
  className?: string;
}

/**
 * Used twice on the Billing page (one for Section A, one for Section B).
 * Renders as a subdued uppercase track label per wireframe §SECTION A /
 * §SECTION B — structural orientation, not a content heading.
 */
export function SectionLabel({ letter, label, id, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-meta uppercase tracking-wider text-meta-foreground",
        className,
      )}
    >
      <span className="flex size-5 items-center justify-center rounded-sm border border-border bg-secondary-surface text-foreground">
        {letter}
      </span>
      <span id={id}>{label}</span>
    </div>
  );
}
