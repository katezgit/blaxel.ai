"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DialogBody,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import { useAccountState } from "@/lib/mock/account-context";
import type { DisplayTier } from "@/lib/mock/billing-tiers";
import { OneTimeTopUpFlow } from "./one-time-top-up-flow";
import { MonthlyTopUpFlow } from "./monthly-top-up-flow";

type Mode = "one-time" | "monthly";

interface UpgradeTierDialogContentProps {
  /** Called when the dialog should close — e.g. on Cancel or after Checkout. */
  onClose: () => void;
}

const formatUsd = (n: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * The full body of the rebuilt UpgradeTierDialog. Owns the mode toggle; each
 * mode mounts its own flow component (no `variant=` / `mode=` props shared).
 * Switching modes resets the flow's internal step state via `key={mode}`.
 *
 * Self-contained — no imports from `apps/portal/src/app/(account)/**`.
 */
export function UpgradeTierDialogContent({ onClose }: UpgradeTierDialogContentProps) {
  const [mode, setMode] = useState<Mode>("one-time");
  const { state } = useAccountState();
  // `state.tier` is 0|1|2|3 in the existing fixture. Cast to the wider
  // DisplayTier (0..4); the About-Tier panel can compare against any of
  // those without overflow.
  const currentTier = state.tier as DisplayTier;

  const handleCheckout = (amountUsd: number) => {
    const verb = mode === "monthly" ? "Monthly top-up scheduled" : "Top-up confirmed";
    toast.success(`${verb} · ${formatUsd(amountUsd)}`);
    onClose();
  };

  return (
    <>
      {/* gap-6 + pb-4: header chrome owns rhythm between the title-unit and
          the mode toggle (24px), then pb-4 + body pt-2 yields the 24px
          segmented→stepper section gap. Title↔description stays 4px via the
          inner gap-1 wrapper. */}
      <DialogHeader className="gap-6 pb-4">
        <div className="flex flex-col gap-1">
          <DialogTitle>Top up your account</DialogTitle>
          <DialogDescription>
            {mode === "monthly" ? (
              <>
                Monthly top-ups to your balance ensure you maintain eligibility
                for a specific quota tier.{" "}
                <a
                  href="https://docs.blaxel.ai/Get-started/Pricing"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Learn more
                </a>
              </>
            ) : (
              "Immediately add credits to your account balance."
            )}
          </DialogDescription>
        </div>
        <SegmentedControl
          aria-label="Top-up frequency"
          value={mode}
          onValueChange={(next) => setMode(next as Mode)}
        >
          <SegmentedControl.Item value="monthly">Monthly</SegmentedControl.Item>
          <SegmentedControl.Item value="one-time">
            One-time purchase
          </SegmentedControl.Item>
        </SegmentedControl>
      </DialogHeader>
      <DialogBody>
        {mode === "one-time" ? (
          <OneTimeTopUpFlow
            key="one-time"
            onCancel={onClose}
            onCheckout={handleCheckout}
          />
        ) : (
          <MonthlyTopUpFlow
            key="monthly"
            currentTier={currentTier}
            onCancel={onClose}
            onCheckout={handleCheckout}
          />
        )}
      </DialogBody>
    </>
  );
}
