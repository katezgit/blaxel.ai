"use client";

import { Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { BandFrame } from "./band-frame";
import type { PolicyLocation } from "@/lib/mock/policies";

interface LocationClauseBandProps {
  locations: ReadonlyArray<PolicyLocation>;
  onRequestEdit: () => void;
}

export function LocationClauseBand({
  locations,
  onRequestEdit,
}: LocationClauseBandProps) {
  return (
    <BandFrame label="Clause">
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

function LocationChip({ location }: { location: PolicyLocation }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 typography-code text-foreground">
      <span className="font-medium text-muted-foreground">
        {location.type === "continent" ? "Continent" : "Country"}:
      </span>
      <span>{location.name}</span>
    </span>
  );
}
