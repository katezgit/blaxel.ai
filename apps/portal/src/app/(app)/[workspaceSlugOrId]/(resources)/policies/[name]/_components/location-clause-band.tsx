"use client";

import { Globe, MapPin, Pencil, Server } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Chip } from "@repo/ui/components/chip";
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
    <BandFrame
      label="Allowed locations"
      className={className}
      action={
        <Button
          type="button"
          variant="ghost"
          onClick={onRequestEdit}
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Pencil aria-hidden="true" />
          Edit
        </Button>
      }
    >
      {locations.length === 0 ? (
        <p className="typography-body text-muted-foreground">
          No locations configured — this policy does not restrict deployment
          location. Edit to add locations.
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
      {locations.length > 0 && (
        <p className="typography-caption text-muted-foreground">
          Locations combine as a UNION (OR) — the workload can run in any
          matching data center.
        </p>
      )}
    </BandFrame>
  );
}

function LocationChip({ location }: { location: PolicyLocation }) {
  const Icon =
    location.type === "continent"
      ? Globe
      : location.type === "country"
        ? MapPin
        : Server;
  const typeLabel =
    location.type === "continent"
      ? "Continent"
      : location.type === "country"
        ? "Country"
        : "Data center";
  return (
    <Chip interactive={false}>
      <Icon aria-hidden="true" className="text-muted-foreground" />
      <span className="sr-only">{typeLabel}: </span>
      {location.name}
    </Chip>
  );
}
