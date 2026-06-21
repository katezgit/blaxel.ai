"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { useAccountState } from "@/lib/mock/account-context";
import QuotaDetail from "./quota-detail";
import TierComparison from "./tier-comparison";

export default function PlanQuotasView() {
  const { state } = useAccountState();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">
          Tier &amp; quotas
        </h1>
        <p className="text-muted-foreground">
          Review workspace capacity, execution limits, and tier requirements.
        </p>
      </header>

      <TierComparison currentTier={state.tier} />

      <div className="flex">
        <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
          <ListChecks aria-hidden="true" />
          See all quotas
        </Button>
      </div>

      <Drawer
        direction="right"
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      >
        <DrawerContent size="lg">
          <DrawerHeader className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <DrawerTitle className="text-subtitle">
                All quotas — Tier {state.tier}
              </DrawerTitle>
              <DrawerDescription className="text-muted-foreground">
                Current usage and limits across every resource, grouped by
                concern.
              </DrawerDescription>
            </div>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody>
            <QuotaDetail />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
