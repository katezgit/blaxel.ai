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

/** Subdued uppercase track label for structural section orientation. */
export function SectionLabel({ letter, label, id, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-meta uppercase tracking-wider text-meta-foreground",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-5 items-center justify-center rounded-sm border border-border bg-secondary-surface text-foreground"
      >
        {letter}
      </span>
      <span id={id}>{label}</span>
    </div>
  );
}
