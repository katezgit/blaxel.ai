"use client";

import { Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Chip } from "@repo/ui/components/chip";
import BandFrame from "./band-frame";
import type { PolicyFlavor } from "@/lib/mock/policies";

interface FlavorClauseBandProps {
  flavors: ReadonlyArray<PolicyFlavor>;
  onRequestEdit: () => void;
  className?: string;
}

export default function FlavorClauseBand({
  flavors,
  onRequestEdit,
  className,
}: FlavorClauseBandProps) {
  return (
    <BandFrame
      label="Allowed flavors"
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
      {flavors.length === 0 ? (
        <p className="typography-body text-muted-foreground">
          No flavors configured — this policy does not restrict hardware type.
          Edit to add flavors.
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
    </BandFrame>
  );
}

function FlavorChip({ flavor }: { flavor: PolicyFlavor }) {
  return (
    <Chip interactive={false} className="gap-1 typography-code">
      <span className="font-medium text-muted-foreground">
        {flavor.type.toUpperCase()}:
      </span>
      <span>{flavor.name}</span>
    </Chip>
  );
}
