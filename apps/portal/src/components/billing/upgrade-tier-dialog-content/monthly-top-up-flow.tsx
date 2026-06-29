"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { DialogBody, DialogFooter } from "@repo/ui/components/dialog";
import { type DisplayTier, type SelectableTier } from "@/lib/mock/billing-tiers";
import SelectedTierSummary from "./selected-tier-summary";
import TierPicker from "./tier-picker";
import TierContextBanner from "./tier-context-banner";
import {
  INITIAL_VALUES,
  resolveAmountUsd,
  selectedTier,
  topUpSchema,
  type TopUpFormValues,
} from "./wizard-state";

type StepIndex = 1 | 2;

interface MonthlyTopUpFlowProps {
  currentTier: DisplayTier;
  /** Tier the launching surface needs — preselected, marked Recommended. */
  recommendedTier?: SelectableTier;
  onCancel: () => void;
  onCheckout: (amountUsd: number) => void;
}

export default function MonthlyTopUpFlow({
  currentTier,
  recommendedTier,
  onCancel,
  onCheckout,
}: MonthlyTopUpFlowProps) {
  const [step, setStep] = useState<StepIndex>(1);
  const form = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      ...INITIAL_VALUES,
      ...(recommendedTier
        ? { selectedTier: String(recommendedTier) as `${SelectableTier}` }
        : null),
    },
    mode: "onChange",
  });
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const values = watch();
  const amountUsd = resolveAmountUsd(values);
  const targetTier = selectedTier(values);

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    onCheckout(amountUsd);
  });

  return (
    // The <form> wraps DialogBody + DialogFooter as siblings so DialogBody owns
    // the scroll while the submit button in the footer still reaches onSubmit.
    // The form is a flex column slot so DialogBody's flex-1 min-h-0 resolves.
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <DialogBody>
        {step === 1 ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="typography-subtitle font-semibold text-foreground">
                Choose your target tier
              </h3>
              <p className="typography-body text-muted-foreground">
                Select a target quota tier to determine your monthly top-up.
                All topped-up funds go directly toward your Blaxel usage.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <TierPicker
                value={values.selectedTier}
                onChange={(next) =>
                  setValue("selectedTier", next, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                recommendedTier={recommendedTier}
              />
              <SelectedTierSummary
                targetTier={targetTier}
                currentTier={currentTier}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="typography-subtitle font-semibold text-foreground">
                Review your top-up
              </h3>
              <p className="typography-body text-muted-foreground">
                Confirm the monthly charge below before checkout.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <TierContextBanner
                targetTier={targetTier}
                amountUsd={amountUsd}
                cadence="monthly"
              />
              <Alert variant="info">
                <AlertDescription>
                  You will be charged ${amountUsd.toLocaleString()} today, and
                  every 30 days thereafter.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
      </DialogBody>
      {step === 1 ? (
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => setStep(2)}
          >
            Continue
          </Button>
        </DialogFooter>
      ) : (
        <DialogFooter className="justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(1)}
            disabled={isSubmitting}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Processing…" : "Checkout"}
            </Button>
          </div>
        </DialogFooter>
      )}
    </form>
  );
}
