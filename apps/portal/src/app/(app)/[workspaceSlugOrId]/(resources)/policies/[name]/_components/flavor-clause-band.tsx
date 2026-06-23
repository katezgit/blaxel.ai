"use client";

import { AlertTriangle, Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import BandFrame from "./band-frame";
import type { PolicyFlavor } from "@/lib/mock/policies";

interface FlavorClauseBandProps {
  flavors: ReadonlyArray<PolicyFlavor>;
  onRequestEdit: () => void;
}

export default function FlavorClauseBand({
  flavors,
  onRequestEdit,
}: FlavorClauseBandProps) {
  return (
    <BandFrame label="Clause">
      <div className="group flex flex-col gap-4">
        <p className="typography-body text-muted-foreground">
          Workloads attached to this policy are deployed only on these
          hardware configurations. Requests scheduled on any other hardware
          type are denied.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="typography-body font-semibold text-foreground">
              Allowed flavors
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
          {flavors.length === 0 ? (
            <p className="typography-body text-muted-foreground">
              No flavors configured — this policy does not restrict hardware
              type. Edit to add flavors.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {flavors.map((flavor) => (
                <FlavorChip
                  key={`${flavor.type}:${flavor.name}`}
                  flavor={flavor}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-md border border-state-warning/40 bg-state-warning-subtle px-4 py-3">
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-4 text-state-warning-text"
          />
          <div className="flex flex-col gap-1">
            <p className="typography-body font-semibold text-foreground">
              Flavor policies are not yet available in the dashboard.
            </p>
            <p className="typography-caption text-muted-foreground">
              You can manage this policy via{" "}
              <code className="font-mono">bl apply -f policy.yaml</code> or
              the REST API.
            </p>
          </div>
        </div>
      </div>
    </BandFrame>
  );
}

function FlavorChip({ flavor }: { flavor: PolicyFlavor }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 typography-code text-foreground">
      <span className="font-medium text-muted-foreground">
        {flavor.type.toUpperCase()}:
      </span>
      <span>{flavor.name}</span>
    </span>
  );
}
