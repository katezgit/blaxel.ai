// AggregateData is the swap-out boundary between the strip and its data source.
// Today it is computed client-side from the fetched fixture list; a future
// production client would swap this for a dedicated `/sandboxes/aggregate`
// fetch returning the same shape, with no change to the strip's rendering API.
// See sandboxes-2026-06-30.wireframe.md §1.3 + Open question §6.7.

import type { Sandbox, SandboxRegion } from "@/lib/mock/sandboxes";
import { pillFor, type SandboxStateLabel } from "./state-pill";
import { imageRefLabel } from "./row-helpers";

// All seven status labels surfaced anywhere in the list-page filter system.
// The Status dropdown enumerates all of them; the strip's State group still
// renders only the three Alex-priority terminal rows (Active / Standby /
// Errored). Default-on set is documented at DEFAULT_STATUS_FILTERS below.
export type StatusFilterLabel = SandboxStateLabel;

// Subset of statuses the strip's State group renders as filter rows. Alex's
// at-a-glance reads — health (Active / Standby) plus the actionable alarm
// (Errored). In-progress and inactive states live in the Status dropdown only.
export type StateBreakdownLabel = Extract<
  SandboxStateLabel,
  "Active" | "Standby" | "Errored"
>;

/**
 * Default-on statuses for the Status filter. Terminated and Inactive are
 * deliberately off — the previous "Include terminated" toggle is folded into
 * these as opt-in checkboxes.
 */
export const DEFAULT_STATUS_FILTERS: ReadonlyArray<StatusFilterLabel> = [
  "Active",
  "Standby",
  "Errored",
  "Deploying",
  "Deactivating",
];

/**
 * Stable ordering for the Status dropdown rows. Active/Standby/Errored lead
 * (Alex's primary read); in-progress states next; terminal-off states last.
 */
export const ALL_STATUS_FILTERS: ReadonlyArray<StatusFilterLabel> = [
  "Active",
  "Standby",
  "Errored",
  "Deploying",
  "Deactivating",
  "Inactive",
  "Terminated",
];

export interface StateCount {
  label: StateBreakdownLabel;
  count: number;
}

export interface RegionCount {
  region: SandboxRegion;
  count: number;
}

export interface ImageCount {
  /** Stable identity: `<name>@<sha8>`. */
  id: string;
  /** Truncated display: `<name>@<sha4>…` matching the table column. */
  label: string;
  count: number;
}

export interface AggregateData {
  total: number;
  /**
   * State rows rendered in fixed order (Active / Standby / Errored).
   * Wireframe §1.3 Tile 2 — the strip shows only Alex's three terminal-read
   * statuses; the seven-state breakdown lives in the Status dropdown.
   */
  state: ReadonlyArray<StateCount>;
  /** Active regions only (regions with 0 sandboxes are omitted). */
  region: ReadonlyArray<RegionCount>;
  /** Top 4 images by count. */
  topImages: ReadonlyArray<ImageCount>;
}

const STATE_ORDER: ReadonlyArray<StateBreakdownLabel> = [
  "Active",
  "Standby",
  "Errored",
];

// Region order in the strip matches the toolbar dropdown order so the
// strip↔toolbar mapping is stable: auto first, then alphabetical by ID.
const REGION_ORDER: ReadonlyArray<SandboxRegion> = [
  "auto",
  "eu-fra-1",
  "eu-lon-1",
  "us-pdx-1",
  "us-was-1",
];

export function computeAggregateData(
  sandboxes: ReadonlyArray<Sandbox>,
): AggregateData {
  // Strip reflects the FULL workspace population — filters live in the Status
  // dropdown, not in the strip itself. Terminated/Inactive contribute to total
  // and region/image breakdowns; the State group still only renders the three
  // Alex-priority rows.
  const stateCounts = new Map<StateBreakdownLabel, number>();
  const regionCounts = new Map<SandboxRegion, number>();
  const imageCounts = new Map<string, { label: string; count: number }>();

  for (const sbx of sandboxes) {
    const pillLabel = pillFor(sbx).label;

    if (pillLabel === "Active" || pillLabel === "Standby" || pillLabel === "Errored") {
      stateCounts.set(pillLabel, (stateCounts.get(pillLabel) ?? 0) + 1);
    }
    // Deploying / Deactivating / Inactive / Terminated still contribute to
    // total + region + image counts; they just don't render in the strip's
    // State group.

    regionCounts.set(sbx.spec.region, (regionCounts.get(sbx.spec.region) ?? 0) + 1);

    const id = `${sbx.spec.image.name}@${sbx.spec.image.sha}`;
    const existing = imageCounts.get(id);
    if (existing) {
      existing.count += 1;
    } else {
      imageCounts.set(id, { label: imageRefLabel(sbx.spec.image), count: 1 });
    }
  }

  const stateRows: ReadonlyArray<StateCount> = STATE_ORDER.map((label) => ({
    label,
    count: stateCounts.get(label) ?? 0,
  }));

  const regionRows: Array<RegionCount> = [];
  for (const region of REGION_ORDER) {
    const count = regionCounts.get(region) ?? 0;
    if (count > 0) regionRows.push({ region, count });
  }

  const topImages: Array<ImageCount> = Array.from(imageCounts, ([id, value]) => ({
    id,
    label: value.label,
    count: value.count,
  }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 4);

  return {
    total: sandboxes.length,
    state: stateRows,
    region: regionRows,
    topImages,
  };
}

/**
 * Compact integer formatter — `12.4k` above 10 000, plain integer below.
 */
export function formatTotal(count: number): string {
  if (count < 10_000) return count.toLocaleString("en-US");
  const thousands = count / 1_000;
  return `${thousands.toFixed(1)}k`;
}

/**
 * Map a state-pill label to its semantic state-color tokens — used by both
 * the strip's State group (color on the count number) and the Status
 * dropdown (color dots) so the two views read the same color for the same
 * status.
 */
export function statusToneClasses(label: StatusFilterLabel): {
  /** Color class for the count number / leading dot. */
  text: string;
  /** Background color class for the solid dot in the Status dropdown. */
  dot: string;
} {
  switch (label) {
    case "Active":
      return { text: "text-state-scored-text", dot: "bg-state-scored" };
    case "Errored":
      return { text: "text-state-errored-text", dot: "bg-state-errored" };
    case "Deploying":
    case "Deactivating":
      return { text: "text-state-running-text", dot: "bg-state-running" };
    case "Standby":
    case "Inactive":
    case "Terminated":
      return { text: "text-muted-foreground", dot: "bg-muted-foreground" };
  }
}
