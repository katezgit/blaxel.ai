import type { LucideIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";

/**
 * Single-icon avatar tile for resource detail headings. Mirrors the visual
 * slot of `@repo/ui` `Avatar` (40×40, rounded full, neutral surface) but
 * houses a Lucide icon instead of an image / initials — used when the resource
 * has no logo (Custom Domain, Policy).
 *
 * Structural composition only. No domain vocabulary — caller passes the icon.
 */
interface IconAvatarProps {
  icon: LucideIcon;
  /** Screen-reader label (decorative by default; pass to expose semantics). */
  label?: string;
  className?: string;
}

export function IconAvatar({ icon: Icon, label, className }: IconAvatarProps) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted-surface text-muted-foreground",
        className,
      )}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Icon aria-hidden="true" className="size-5" />
    </span>
  );
}
