"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { tierProgressFor } from "../../_components/tier-progression";
import { useAccountState } from "@/lib/mock/account-context";

export default function CurrentTierBand() {
  const { state } = useAccountState();
  const progress = tierProgressFor(state.tier);

  return (
    <Card className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="neutral">Tier {state.tier}</Badge>
          <span className="text-caption text-muted-foreground">
            {progress.reason}
          </span>
        </div>
        <p className="text-body text-foreground">
          {progress.nextRequirement
            ? `Reach Tier ${progress.nextTier} by ${progress.nextRequirement.toLowerCase()}.`
            : "You have reached the highest tier in this demo. Contact sales for higher limits."}
        </p>
      </div>
      {progress.nextRequirement ? (
        <Button asChild variant="primary">
          <Link href="/account/billing/credits">
            <Plus aria-hidden="true" />
            Add credits
          </Link>
        </Button>
      ) : null}
    </Card>
  );
}
