import type { SandboxDetailTab } from "./sandbox-view-mode";

/** Derive the active sandbox-detail tab from the current pathname.
 *  Falls back to `overview` when the tail segment doesn't match a known tab —
 *  keeps the sticky strip + view-toggle behavior deterministic for any
 *  future sub-route not enumerated here. */
export function sandboxDetailTabFromPath(
  pathname: string,
  basePath: string,
): SandboxDetailTab {
  if (pathname === basePath || pathname === `${basePath}/`) return "overview";
  const tail = pathname.slice(basePath.length + 1).split("/", 1)[0];
  if (tail === "settings") return "settings";
  if (tail === "schedules") return "schedules";
  if (tail === "logs") return "logs";
  if (tail === "terminal") return "terminal";
  return "overview";
}
