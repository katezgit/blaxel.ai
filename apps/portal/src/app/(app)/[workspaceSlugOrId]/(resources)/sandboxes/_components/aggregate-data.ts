// Status filter union + tone mapping shared by the row pill, the Status
// dropdown trigger's stacked dots, and the dropdown's per-row dot.

import type { SandboxStateLabel } from "./state-pill";

export type StatusFilterLabel = SandboxStateLabel;

/**
 * Default-on statuses. Alex's primary read on this page is "what's running
 * vs what's broken" — so Active, Standby, and Failed are checked by
 * default. Deploying is opt-in (transient noise), Terminated is opt-in
 * (gone, not actionable).
 */
export const DEFAULT_STATUS_FILTERS: ReadonlyArray<StatusFilterLabel> = [
  "Active",
  "Standby",
  "Failed",
];

/**
 * Stable ordering for the Status dropdown rows. Active / Standby / Failed
 * lead (Alex's primary read); Deploying next; Terminated last.
 */
export const ALL_STATUS_FILTERS: ReadonlyArray<StatusFilterLabel> = [
  "Active",
  "Standby",
  "Failed",
  "Deploying",
  "Terminated",
];

/**
 * Map a state-pill label to its semantic state-color tokens — used by the
 * Status dropdown trigger's stacked dots and the dropdown's per-row dot, so
 * the same status reads the same color everywhere.
 */
export function statusToneClasses(label: StatusFilterLabel): {
  /** Color class for the leading dot. */
  text: string;
  /** Background color class for the solid dot. */
  dot: string;
} {
  switch (label) {
    case "Active":
      return { text: "text-state-scored-text", dot: "bg-state-scored" };
    case "Failed":
      return { text: "text-state-errored-text", dot: "bg-state-errored" };
    case "Deploying":
      return { text: "text-state-running-text", dot: "bg-state-running" };
    case "Standby":
    case "Terminated":
      return { text: "text-muted-foreground", dot: "bg-muted-foreground" };
  }
}
