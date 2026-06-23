"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
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

const QUOTAS_DOC_URL =
  "https://docs.blaxel.ai/Security/Quotas#how-tiers-are-calculated";

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
  const [mode, setMode] = useState<Mode>("monthly");
  const { state } = useAccountState();
  // `state.tier` is 0|1|2|3 in the existing fixture. Cast to the wider
  // DisplayTier so the About-Tier panel can compare against any tier 0..6
  // without overflow.
  const currentTier = state.tier as DisplayTier;

  const handleCheckout = (amountUsd: number) => {
    const verb = mode === "monthly" ? "Monthly top-up scheduled" : "Top-up confirmed";
    toast.success(`${verb} · ${formatUsd(amountUsd)}`);
    onClose();
  };

  return (
    <>
      {/* gap-4 + pb-2: tightened header chrome to give the dialog breathing
          room — title-unit → mode toggle = 16px; pb-2 + body pt-2 yields a
          16px segmented→stepper section gap. Title↔description stays 4px via
          the inner gap-1 wrapper. */}
      <DialogHeader className="gap-4 pb-2">
        <div className="flex flex-col gap-1">
          <DialogTitle>Top up your account</DialogTitle>
          <DialogDescription>
            {mode === "monthly"
              ? "Monthly top-ups to your balance ensure you maintain eligibility for a specific quota tier. "
              : "Immediately add credits to your account balance. "}
            <a
              href={QUOTAS_DOC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
            >
              Learn more
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          </DialogDescription>
        </div>
        {/* self-start: SegmentedControl is inline-flex at root, but DialogHeader's
            flex-col stretches direct children. Wrap with self-start so the
            control hugs its labels. */}
        <SegmentedControl
          aria-label="Top-up frequency"
          value={mode}
          onValueChange={(next) => setMode(next as Mode)}
          className="self-start"
        >
          <SegmentedControl.Item value="monthly">Monthly</SegmentedControl.Item>
          <SegmentedControl.Item value="one-time">
            One-time purchase
          </SegmentedControl.Item>
        </SegmentedControl>
      </DialogHeader>
      {/* className flex-col makes DialogBody's inner scroll container a flex
          column so the flow form's flex-1 min-h-0 resolves against it — the
          tier list / balance protection ScrollAreas then bound themselves and
          the action row stays pinned at the dialog bottom. */}
      <DialogBody className="flex flex-col">
        {mode === "one-time" ? (
          <OneTimeTopUpFlow
            key="one-time"
            currentTier={currentTier}
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
