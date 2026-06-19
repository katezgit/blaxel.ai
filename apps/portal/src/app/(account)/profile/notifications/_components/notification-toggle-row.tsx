import type { ReactNode } from "react";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/cn";

interface NotificationToggleRowProps {
  label: string;
  description: string;
  /**
   * Trailing slot — typically a `<Switch />`. Caller supplies the control so
   * the row stays a pure layout primitive (no checked/onChange leak into it).
   */
  children: ReactNode;
  /**
   * When true, label gains a "Required" badge to explain the trailing control
   * is locked. Visual-only — the locking itself is enforced by the caller's
   * `<Switch disabled checked />`.
   */
  forced?: boolean;
  className?: string;
}

export function NotificationToggleRow({
  label,
  description,
  children,
  forced,
  className,
}: NotificationToggleRowProps) {
  return (
    <li
      className={cn(
        "flex items-start justify-between gap-4 border-t border-border py-4 first:border-t-0 first:pt-0 last:pb-0",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-body font-medium text-foreground">{label}</span>
          {forced ? <Badge variant="neutral">Required</Badge> : null}
        </span>
        <span className="text-caption text-muted-foreground">
          {description}
        </span>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </li>
  );
}
