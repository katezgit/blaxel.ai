import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";

interface StepActionRowProps {
  /**
   * Step navigation: returns to the previous wizard step. Sits on the LEFT
   * of the row because it operates inside the flow, opposite the exit/commit
   * pair. Omit on step 1 (no previous step).
   */
  back?: ReactNode;
  /**
   * Exit + commit pair, rendered on the RIGHT: Cancel (abort the whole
   * flow) sits adjacent to the primary action so the dominant decision pair
   * reads as a single visual unit.
   */
  children: ReactNode;
}

/**
 * Shared action row at the bottom of each wizard step. Back (step navigation)
 * lives on the left; Cancel + primary action live on the right. On mobile the
 * row collapses to a column with the primary action on top.
 */
export function StepActionRow({ back, children }: StepActionRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center",
        back ? "sm:justify-between" : "sm:justify-end",
      )}
    >
      {back ? <div className="flex">{back}</div> : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
        {children}
      </div>
    </div>
  );
}
