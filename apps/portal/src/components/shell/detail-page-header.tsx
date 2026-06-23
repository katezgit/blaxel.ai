import type { ReactNode } from "react";

/**
 * Canonical detail-page heading pattern used across resource detail surfaces
 * (Custom Domains, Policies, future Integrations parity). Three vertical parts:
 *   1. breadcrumb (top, muted, navigable)
 *   2. heading row — avatar tile + heading column + right-side action
 *   3. description sits indented in the heading column, beside the avatar
 *
 * Structural primitive only — no domain vocabulary. Callers compose the avatar
 * (icon-on-surface tile, image, initials) and the description (status pills,
 * counts, formatted strings) at the call site.
 */
interface DetailPageHeaderProps {
  breadcrumb: ReactNode;
  avatar?: ReactNode;
  heading: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function DetailPageHeader({
  breadcrumb,
  avatar,
  heading,
  description,
  action,
}: DetailPageHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      {breadcrumb}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {avatar && <span className="shrink-0">{avatar}</span>}
          <div className="page-header min-w-0">
            <h1 className="typography-display font-semibold text-foreground">
              {heading}
            </h1>
            {description && (
              <p className="typography-body text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </header>
  );
}
