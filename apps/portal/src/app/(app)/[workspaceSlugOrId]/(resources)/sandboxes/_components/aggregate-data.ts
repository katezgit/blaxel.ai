// Status filter union + tone mapping shared by the row pill, the Status
// dropdown trigger's stacked dots, and the dropdown's per-row dot.
//
// Terminated is intentionally NOT a member of the Status dropdown's menu —
// per sandboxes-list-2026-07-01 wireframe §1.2 it's a right-anchor toggle
// chip on the toolbar, not a Status option. The runtime union still
// includes "Terminated" because the row pill needs to render it once the
// toggle is on.

import type { SandboxStateLabel } from "./state-pill";

export type StatusFilterLabel = SandboxStateLabel;

/**
 * Default-on statuses in the Status multi-select dropdown. Alex's primary
 * read on this page is "what's running vs what's broken" — Active, Standby,
 * Failed, and Deploying all lead. Terminated is excluded here; the
 * separate "Terminated" toolbar toggle folds those rows into the result
 * set on demand.
 */
export const DEFAULT_STATUS_FILTERS: ReadonlyArray<StatusFilterLabel> = [
  "Active",
  "Standby",
  "Deploying",
  "Failed",
];

/**
 * Stable ordering for the Status dropdown rows. Active / Standby / Failed
 * lead (Alex's primary read); Deploying next. Terminated is not in the
 * dropdown — the toolbar's Terminated chip owns that axis.
 */
export const ALL_STATUS_FILTERS: ReadonlyArray<StatusFilterLabel> = [
  "Active",
  "Standby",
  "Failed",
  "Deploying",
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
