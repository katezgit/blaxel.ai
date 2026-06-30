// AggregateData is the swap-out boundary between the strip and its data source.
// Today it is computed client-side from the fetched fixture list; a future
// production client would swap this for a dedicated `/sandboxes/aggregate`
// fetch returning the same shape, with no change to the strip's rendering API.
// See sandboxes-2026-06-30.wireframe.md §1.3 + Open question §6.7.

import type { Sandbox, SandboxRegion } from "@/lib/mock/sandboxes";
import { pillFor, type SandboxStateLabel } from "./state-pill";
import { imageRefLabel } from "./row-helpers";

export type StateBreakdownLabel = Extract<
  SandboxStateLabel,
  "Active" | "Standby" | "Errored" | "Terminated"
>;

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
   * Terminated row only present when `includeTerminated` was true at
   * compute time — see Wireframe §1.3 Tile 2.
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

interface ComputeOptions {
  includeTerminated: boolean;
}

export function computeAggregateData(
  sandboxes: ReadonlyArray<Sandbox>,
  { includeTerminated }: ComputeOptions,
): AggregateData {
  const stateCounts = new Map<StateBreakdownLabel, number>();
  const regionCounts = new Map<SandboxRegion, number>();
  const imageCounts = new Map<string, { label: string; count: number }>();

  for (const sbx of sandboxes) {
    const pillLabel = pillFor(sbx).label;
    // Terminated rows are aggregated only when the chip is active — matches the
    // table-level Include-terminated rule so strip and table see the same
    // population.
    const isTerminated = pillLabel === "Terminated" || pillLabel === "Inactive";
    if (isTerminated && !includeTerminated) continue;

    if (pillLabel === "Active" || pillLabel === "Standby" || pillLabel === "Errored") {
      stateCounts.set(pillLabel, (stateCounts.get(pillLabel) ?? 0) + 1);
    } else if (isTerminated && includeTerminated) {
      stateCounts.set("Terminated", (stateCounts.get("Terminated") ?? 0) + 1);
    }
    // Deploying / Deactivating are in-flight states; the wireframe §1.3 tile 2
    // shows only the three terminal-population categories (+ Terminated when
    // toggled). In-flight states still contribute to total + region + image
    // counts.

    regionCounts.set(sbx.spec.region, (regionCounts.get(sbx.spec.region) ?? 0) + 1);

    const id = `${sbx.spec.image.name}@${sbx.spec.image.sha}`;
    const existing = imageCounts.get(id);
    if (existing) {
      existing.count += 1;
    } else {
      imageCounts.set(id, { label: imageRefLabel(sbx.spec.image), count: 1 });
    }
  }

  const stateRows: Array<StateCount> = STATE_ORDER.map((label) => ({
    label,
    count: stateCounts.get(label) ?? 0,
  }));
  if (includeTerminated) {
    stateRows.push({ label: "Terminated", count: stateCounts.get("Terminated") ?? 0 });
  }

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

  // Total reflects whatever was aggregated — i.e. includes Terminated rows
  // only when includeTerminated is on. This keeps the strip's "248 Sandboxes"
  // count consistent with the rows the table would show before further
  // filtering.
  const total = sandboxes.reduce((acc, sbx) => {
    const pillLabel = pillFor(sbx).label;
    const isTerminated = pillLabel === "Terminated" || pillLabel === "Inactive";
    if (isTerminated && !includeTerminated) return acc;
    return acc + 1;
  }, 0);

  return {
    total,
    state: stateRows,
    region: regionRows,
    topImages,
  };
}

/**
 * Compact integer formatter — `12.4k` above 10 000, plain integer below.
 * Matches Wireframe §1.3 Tile 1.
 */
export function formatTotal(count: number): string {
  if (count < 10_000) return count.toLocaleString("en-US");
  const thousands = count / 1_000;
  return `${thousands.toFixed(1)}k`;
}
