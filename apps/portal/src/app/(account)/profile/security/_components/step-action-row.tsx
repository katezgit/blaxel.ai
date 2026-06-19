import type { ReactNode } from "react";

interface StepActionRowProps {
  children: ReactNode;
}

/**
 * Shared action row at the bottom of each wizard step. Centralizes the
 * "right-aligned actions on desktop, full-width-stacked on mobile" treatment
 * so individual steps don't reimplement it. Caller composes the buttons in
 * order — Back/Cancel on the left, primary on the right.
 */
export function StepActionRow({ children }: StepActionRowProps) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
      {children}
    </div>
  );
}
