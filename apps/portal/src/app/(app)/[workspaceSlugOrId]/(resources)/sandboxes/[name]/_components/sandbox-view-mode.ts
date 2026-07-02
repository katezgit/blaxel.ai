export type SandboxViewMode = "flat" | "card";
export type SandboxDetailTab =
  | "overview"
  | "settings"
  | "schedules"
  | "logs"
  | "terminal";

/** Portal convention: `portal:` prefix for app-scoped UI state
 * (see components/shell/use-sidebar-state.ts, use-last-workspace-tracker.ts).
 * Per-sandbox, per-tab scope so Overview card mode does not activate Settings
 * card mode — matches wireframe §7.2 persistence rule. */
export function sandboxViewModeStorageKey(
  sandboxName: string,
  tab: SandboxDetailTab,
): string {
  return `portal:sandbox-detail:view-mode:${sandboxName}:${tab}`;
}

/** Tabs where card mode has no visible effect — Logs is a full-viewport
 * streaming surface, Terminal is a full-viewport shell. Wireframe §7.5 Q3
 * closed by hiding the toggle rather than rendering a no-op affordance. */
export const CARD_MODE_TABS: ReadonlyArray<SandboxDetailTab> = [
  "overview",
  "settings",
  "schedules",
];

export function tabSupportsCardMode(tab: SandboxDetailTab): boolean {
  return CARD_MODE_TABS.includes(tab);
}
