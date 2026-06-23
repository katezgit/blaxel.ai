"use client";

import { Globe, MapPin, Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import BandFrame from "./band-frame";
import type { PolicyLocation } from "@/lib/mock/policies";

interface LocationClauseBandProps {
  locations: ReadonlyArray<PolicyLocation>;
  onRequestEdit: () => void;
  className?: string;
}

export default function LocationClauseBand({
  locations,
  onRequestEdit,
  className,
}: LocationClauseBandProps) {
  return (
    <BandFrame label="Clause" className={className}>
      <div className="group flex flex-col gap-4">
        <p className="typography-body text-muted-foreground">
          Workloads attached to this policy are deployed only in these
          locations. Requests routed to any other data center are denied.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="typography-body font-semibold text-foreground">
              Allowed locations
            </h3>
            <Button
              type="button"
              variant="ghost"
              onClick={onRequestEdit}
              className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Pencil aria-hidden="true" />
              Edit
            </Button>
          </div>
          {locations.length === 0 ? (
            <p className="typography-body text-muted-foreground">
              No locations configured — this policy does not restrict
              deployment location. Edit to add locations.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {locations.map((location) => (
                <LocationChip
                  key={`${location.type}:${location.name}`}
                  location={location}
                />
              ))}
            </div>
          )}
        </div>

        {locations.length > 0 && (
          <p className="typography-caption text-muted-foreground">
            Mixed granularity: continent-level and country-level entries
            combine as a UNION (OR) — the workload can run in any matching
            data center.
          </p>
        )}
      </div>
    </BandFrame>
  );
}

// Read-only mirror of the create-form Location chip — icon + name only, no
// `Continent:` / `Country:` prefix, no aria-pressed (this is display, not toggle).
function LocationChip({ location }: { location: PolicyLocation }) {
  const Icon = location.type === "continent" ? Globe : MapPin;
  const typeLabel = location.type === "continent" ? "Continent" : "Country";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 typography-caption text-foreground">
      <Icon
        aria-hidden="true"
        className="size-3.5 shrink-0 text-muted-foreground"
      />
      <span className="sr-only">{typeLabel}: </span>
      {location.name}
    </span>
  );
}
