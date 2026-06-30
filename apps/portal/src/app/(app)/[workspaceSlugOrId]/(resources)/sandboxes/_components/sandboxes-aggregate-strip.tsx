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
//
// Visual hierarchy: counts are the read-first element — promoted via size
// (typography-subtitle, 16px) AND weight (semibold). Labels stay body (14px)
// and demote to text-muted-foreground so the count dominates the row.
//
// Section labels (TOTAL / STATE / …) are removed: the column structure plus
// self-describing content (state names, region IDs, image refs) already
// communicates each tile's purpose, and a small-uppercase header band read
// generic / placeholder against the dense content beneath it.
//
// State dots are removed in the strip (kept in the table StatePill) — in the
// strip context, colored dots competed visually with the active-selection
// 2px left bar and made unfiltered Active/Errored rows look pre-selected.

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
      <TileGroup first centered>
        {/* Total tile is single-row; vertical-centering (centered prop)
            anchors the count + label block to the strip's row-height so it
            does not read as a floating island above empty space. */}
        <div className="flex flex-col px-3">
          <span className="typography-display font-semibold text-foreground tabular-nums leading-none">
            {formatTotal(data.total)}
          </span>
          <span className="typography-meta text-muted-foreground pt-1">
            {data.total === 1 ? "Sandbox" : "Sandboxes"}
          </span>
        </div>
      </TileGroup>

      <TileGroup>
        {data.state.map((row) => (
          <StateTileRow
            key={row.label}
            row={row}
            active={stateFilters.includes(row.label)}
            onToggle={() => toggleStateFilter(row.label)}
          />
        ))}
      </TileGroup>

      <TileGroup>
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

      <TileGroup>
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
  first?: boolean;
  centered?: boolean;
  children: React.ReactNode;
}

function TileGroup({ first, centered, children }: TileGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-col px-4 py-3",
        // Vertical centering for the Total tile so its single row aligns
        // mid-height of the taller breakdown columns. Other groups stack
        // their rows from the top.
        centered && "justify-center",
        // Column divider between groups (skipped on the first group + on
        // mobile, where the grid wraps and a vertical rule would be
        // sideways).
        !first && "lg:border-l lg:border-border",
      )}
    >
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

// ─── Row primitives ──────────────────────────────────────────────────────────
//
// Each row is a button that owns its own selection visual: a 2px left bar +
// `font-medium` weight on the COUNT when active. The bar is a positioned
// element on the row's left edge (not a `border-left` decoration) — shape
// disambiguates from the decoration-anti-pattern border-left flag.

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
        "group relative flex items-center justify-between gap-3 rounded-sm py-0.5 pl-3 pr-2",
        "text-left transition-colors duration-fast ease-out-standard",
        "hover:bg-muted-surface",
        "focus-visible:outline-none focus-visible:bg-muted-surface",
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

// Count cell — the read-first element. Larger (16px), heavier (semibold),
// fully tokened text-foreground. Right-aligned via flex justify-between on
// the row. Active state nudges weight one tick further so selection still
// reads from the bar + a subtle weight bump.
function CountCell({ value, active }: { value: number; active: boolean }) {
  return (
    <span
      className={cn(
        "typography-subtitle tabular-nums text-foreground",
        active ? "font-bold" : "font-semibold",
      )}
    >
      {value}
    </span>
  );
}

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
      <span
        className={cn(
          "typography-body",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {row.label}
      </span>
      <CountCell value={row.count} active={active} />
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
      <span
        className={cn(
          "typography-body font-mono",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {regionLabel(row.region)}
      </span>
      <CountCell value={row.count} active={active} />
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
      <span
        className={cn(
          "typography-meta font-mono truncate",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {row.label}
      </span>
      <CountCell value={row.count} active={active} />
    </FilterRow>
  );
}

function EmptyRow() {
  return (
    <span className="typography-meta text-muted-foreground py-0.5 pl-3">
      —
    </span>
  );
}
