"use client";

import { cn } from "@repo/ui/lib/cn";
import type { SandboxRegion } from "@/lib/mock/sandboxes";
import { regionLabel } from "./row-helpers";
import {
  statusToneClasses,
  type AggregateData,
  type ImageCount,
  type RegionCount,
  type StateBreakdownLabel,
  type StateCount,
} from "./aggregate-data";

// Wireframe §1.3 — horizontal aggregate strip with three tile groups
// (State / Region / Top Image). Total moved to the page header subtitle —
// Alex doesn't decide on raw total, so it's context, not focal.
//
// Visual hierarchy reflects Alex's priorities:
//   1. Errored — the actionable read. Rendered at display size (24px) in
//      state-errored color, dominating the strip.
//   2. Active / Standby — secondary peer to Top Image. State color lives on
//      the count number (not on a decorative dot), keeping the at-a-glance
//      health signal while avoiding the "competing visual cues" finding from
//      the previous pass.
//   3. Region — tertiary. Same rows as before but everything renders in muted
//      contrast.
//
// Selection visual: 2px left bar + count weight bump. No dots — color
// disambiguates the count cells, the bar disambiguates selection state.

interface SandboxesAggregateStripProps {
  data: AggregateData;
  /** Currently selected state filters — Status dropdown source of truth. */
  stateFilters: ReadonlyArray<StateBreakdownLabel>;
  /**
   * Click a State tile to isolate that single state in the Status filter.
   * Clicking the same tile again resets to defaults. Inverse-direction sync
   * is wired by the parent: the active prop is `true` only when the dropdown
   * holds exactly that one state.
   */
  onIsolateState: (label: StateBreakdownLabel) => void;
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
  onIsolateState,
  regionFilter,
  onRegionFilterChange,
  imageFilter,
  onImageFilterChange,
}: SandboxesAggregateStripProps) {
  function toggleRegion(region: SandboxRegion) {
    onRegionFilterChange(regionFilter === region ? "all" : region);
  }

  function toggleImage(id: string) {
    onImageFilterChange(imageFilter === id ? null : id);
  }

  // A state tile reads as "active" only when the Status filter holds exactly
  // that single label — i.e. the tile click successfully isolated that state.
  // Any other combination (defaults, dropdown subset, etc.) leaves all state
  // tiles inactive.
  function isStateIsolated(label: StateBreakdownLabel): boolean {
    return stateFilters.length === 1 && stateFilters[0] === label;
  }

  // Errored is the visual anchor; it leads the State group with a larger
  // count cell rendered in state-errored. Reorder rows so Errored renders
  // first within the group.
  const erroredRow = data.state.find((row) => row.label === "Errored");
  const otherStateRows = data.state.filter((row) => row.label !== "Errored");

  return (
    <section
      aria-label="Sandbox population summary"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr] lg:gap-0"
    >
      <TileGroup first>
        {erroredRow ? (
          <ErroredHeroRow
            row={erroredRow}
            active={isStateIsolated("Errored")}
            onIsolate={() => onIsolateState("Errored")}
          />
        ) : null}
        {otherStateRows.map((row) => (
          <StateTileRow
            key={row.label}
            row={row}
            active={isStateIsolated(row.label)}
            onIsolate={() => onIsolateState(row.label)}
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
  children: React.ReactNode;
}

function TileGroup({ first, children }: TileGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-col px-4 py-3",
        // Column divider between groups (skipped on the first group + on
        // mobile, where the grid wraps and a vertical rule would be sideways).
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
  /** Reserve extra vertical room for the Errored hero row. */
  size?: "default" | "hero";
  children: React.ReactNode;
}

function FilterRow({
  active,
  onToggle,
  ariaLabel,
  size = "default",
  children,
}: FilterRowProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={cn(
        "group relative flex items-center justify-between gap-3 rounded-sm pl-3 pr-2",
        size === "hero" ? "py-1" : "py-0.5",
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

function ErroredHeroRow({
  row,
  active,
  onIsolate,
}: {
  row: StateCount;
  active: boolean;
  onIsolate: () => void;
}) {
  // Hero treatment: count rendered at display size in state-errored. Becomes
  // the eye-magnet of the strip — Alex reads "any errored?" before anything
  // else.
  const tone = statusToneClasses("Errored");
  return (
    <FilterRow
      active={active}
      onToggle={onIsolate}
      ariaLabel={`Show only Errored sandboxes (${row.count})`}
      size="hero"
    >
      <span className={cn("typography-body font-medium", tone.text)}>
        {row.label}
      </span>
      <span
        className={cn(
          "typography-display tabular-nums leading-none",
          active ? "font-bold" : "font-semibold",
          tone.text,
        )}
      >
        {row.count}
      </span>
    </FilterRow>
  );
}

function StateTileRow({
  row,
  active,
  onIsolate,
}: {
  row: StateCount;
  active: boolean;
  onIsolate: () => void;
}) {
  // Active / Standby — count number carries the state color so the at-a-
  // glance health signal still reads, but at peer scale vs the Errored hero.
  const tone = statusToneClasses(row.label);
  return (
    <FilterRow
      active={active}
      onToggle={onIsolate}
      ariaLabel={`Show only ${row.label} sandboxes (${row.count})`}
    >
      <span
        className={cn(
          "typography-body",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {row.label}
      </span>
      <span
        className={cn(
          "typography-subtitle tabular-nums",
          active ? "font-bold" : "font-semibold",
          tone.text,
        )}
      >
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
  // Region demotes one tier vs State: label + count both render muted by
  // default. Active selection still promotes to foreground + bar.
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
      <span
        className={cn(
          "typography-subtitle tabular-nums text-muted-foreground",
          active ? "font-bold text-foreground" : "font-semibold",
        )}
      >
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
      <span
        className={cn(
          "typography-meta font-mono truncate",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {row.label}
      </span>
      <span
        className={cn(
          "typography-subtitle tabular-nums text-foreground",
          active ? "font-bold" : "font-semibold",
        )}
      >
        {row.count}
      </span>
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
