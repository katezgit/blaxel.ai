"use client";

import { cn } from "@repo/ui/lib/cn";
import type { SandboxRegion } from "@/lib/mock/sandboxes";
import { regionLabel } from "./row-helpers";
import {
  formatTotal,
  type AggregateData,
  type ImageCount,
  type RegionCount,
  type StateBreakdownLabel,
  type StateCount,
} from "./aggregate-data";

// Wireframe §1.3 — horizontal aggregate strip with four tile groups.
// Composed from existing primitives only (flex + divider + button). No new
// design-system component; the strip is sandboxes-list-only.

interface SandboxesAggregateStripProps {
  data: AggregateData;
  /** Currently selected state filters (toolbar source of truth). */
  stateFilters: ReadonlyArray<StateBreakdownLabel>;
  onStateFiltersChange: (next: ReadonlyArray<StateBreakdownLabel>) => void;
  /** Region filter — single-select; "all" = unfiltered. */
  regionFilter: SandboxRegion | "all";
  onRegionFilterChange: (next: SandboxRegion | "all") => void;
  /** Image filter — single-select; null = unfiltered. */
  imageFilter: string | null;
  onImageFilterChange: (next: string | null) => void;
}

export function SandboxesAggregateStrip({
  data,
  stateFilters,
  onStateFiltersChange,
  regionFilter,
  onRegionFilterChange,
  imageFilter,
  onImageFilterChange,
}: SandboxesAggregateStripProps) {
  function toggleStateFilter(label: StateBreakdownLabel) {
    if (stateFilters.includes(label)) {
      onStateFiltersChange(stateFilters.filter((s) => s !== label));
    } else {
      onStateFiltersChange([...stateFilters, label]);
    }
  }

  function toggleRegion(region: SandboxRegion) {
    onRegionFilterChange(regionFilter === region ? "all" : region);
  }

  function toggleImage(id: string) {
    onImageFilterChange(imageFilter === id ? null : id);
  }

  return (
    <section
      aria-label="Sandbox population summary"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1.5fr] lg:gap-0"
    >
      <TileGroup label="Total" first>
        <div className="flex flex-col gap-1 px-3 py-2">
          <span className="typography-display font-semibold text-foreground tabular-nums">
            {formatTotal(data.total)}
          </span>
          <span className="typography-meta text-meta-foreground">
            {data.total === 1 ? "Sandbox" : "Sandboxes"}
          </span>
        </div>
      </TileGroup>

      <TileGroup label="State">
        {data.state.map((row) => (
          <StateTileRow
            key={row.label}
            row={row}
            active={stateFilters.includes(row.label)}
            onToggle={() => toggleStateFilter(row.label)}
          />
        ))}
      </TileGroup>

      <TileGroup label="Region">
        {data.region.length === 0 ? (
          <EmptyRow />
        ) : (
          data.region.map((row) => (
            <RegionTileRow
              key={row.region}
              row={row}
              active={regionFilter === row.region}
              onToggle={() => toggleRegion(row.region)}
            />
          ))
        )}
      </TileGroup>

      <TileGroup label="Top Image">
        {data.topImages.length === 0 ? (
          <EmptyRow />
        ) : (
          data.topImages.map((row) => (
            <ImageTileRow
              key={row.id}
              row={row}
              active={imageFilter === row.id}
              onToggle={() => toggleImage(row.id)}
            />
          ))
        )}
      </TileGroup>
    </section>
  );
}

interface TileGroupProps {
  label: string;
  first?: boolean;
  children: React.ReactNode;
}

function TileGroup({ label, first, children }: TileGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-4 py-3",
        // Column divider between groups (skipped on the first group + on
        // mobile, where the grid wraps and a vertical rule would be
        // sideways).
        !first && "lg:border-l lg:border-border",
      )}
    >
      <span className="typography-caption uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

// ─── Row primitives ──────────────────────────────────────────────────────────
//
// Each row is a button that owns its own selection visual: a 2px left bar +
// `font-medium` weight when active. The bar is a positioned element on the
// row's left edge (not a `border-left` decoration) — shape disambiguates from
// the decoration-anti-pattern border-left flag.

interface FilterRowProps {
  active: boolean;
  onToggle: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}

function FilterRow({ active, onToggle, ariaLabel, children }: FilterRowProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={cn(
        "group relative flex items-center justify-between gap-3 rounded-sm py-1 pl-3 pr-2",
        "text-left transition-colors duration-fast ease-out-standard",
        "hover:bg-muted-surface",
        "focus-visible:outline-none focus-visible:bg-muted-surface",
        active && "font-medium text-foreground",
        !active && "text-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-1 bottom-1 w-0.5 rounded-full",
          active ? "bg-foreground" : "bg-transparent",
        )}
      />
      {children}
    </button>
  );
}

const STATE_DOT_CLASS: Record<StateBreakdownLabel, string> = {
  Active: "bg-state-scored",
  Standby: "bg-muted-foreground",
  Errored: "bg-state-errored",
  Terminated: "bg-muted-foreground",
};

function StateTileRow({
  row,
  active,
  onToggle,
}: {
  row: StateCount;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <FilterRow
      active={active}
      onToggle={onToggle}
      ariaLabel={`Filter by ${row.label} state (${row.count} sandboxes)`}
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            STATE_DOT_CLASS[row.label],
          )}
        />
        <span className="typography-body">{row.label}</span>
      </span>
      <span className="typography-body tabular-nums text-meta-foreground">
        {row.count}
      </span>
    </FilterRow>
  );
}

function RegionTileRow({
  row,
  active,
  onToggle,
}: {
  row: RegionCount;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <FilterRow
      active={active}
      onToggle={onToggle}
      ariaLabel={`Filter by region ${row.region} (${row.count} sandboxes)`}
    >
      <span className="typography-body font-mono">{regionLabel(row.region)}</span>
      <span className="typography-body tabular-nums text-meta-foreground">
        {row.count}
      </span>
    </FilterRow>
  );
}

function ImageTileRow({
  row,
  active,
  onToggle,
}: {
  row: ImageCount;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <FilterRow
      active={active}
      onToggle={onToggle}
      ariaLabel={`Filter by image ${row.label} (${row.count} sandboxes)`}
    >
      <span className="typography-meta font-mono truncate">{row.label}</span>
      <span className="typography-body tabular-nums text-meta-foreground">
        {row.count}
      </span>
    </FilterRow>
  );
}

function EmptyRow() {
  return (
    <span className="typography-meta text-meta-foreground py-1 pl-3">—</span>
  );
}
