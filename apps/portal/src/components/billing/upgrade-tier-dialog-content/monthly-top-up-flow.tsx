"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Stepper, type StepperStep } from "@repo/ui/components/stepper";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { type DisplayTier } from "@/lib/mock/billing-tiers";
import { AboutTierPanel } from "./about-tier-panel";
import { TierPicker } from "./tier-picker";
import { BalanceProtectionCard } from "./balance-protection-card";
import {
  INITIAL_VALUES,
  resolveAmountUsd,
  selectedTier,
  topUpSchema,
  type TopUpFormValues,
} from "./wizard-state";

const STEPS: ReadonlyArray<StepperStep> = [
  { label: "Choose target tier" },
  { label: "Balance protection" },
];

type StepIndex = 1 | 2;

interface MonthlyTopUpFlowProps {
  currentTier: DisplayTier;
  onCancel: () => void;
  onCheckout: (amountUsd: number) => void;
}

export function MonthlyTopUpFlow({
  currentTier,
  onCancel,
  onCheckout,
}: MonthlyTopUpFlowProps) {
  const [step, setStep] = useState<StepIndex>(1);
  const form = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpSchema),
    defaultValues: INITIAL_VALUES,
    mode: "onChange",
  });
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const values = watch();
  const amountUsd = resolveAmountUsd(values);
  const targetTier = selectedTier(values);

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    onCheckout(amountUsd);
  });

  return (
    // flex-1 min-h-0: form fills DialogBody (its inner is a flex column —
    // configured at the index.tsx callsite) so internal ScrollAreas can be
    // bounded — keeps the action row visible at the dialog bottom regardless
    // of step-body length.
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      <Stepper steps={STEPS} currentStep={step} />

      {/* gap-8: peer major regions (form column ↔ About-Tier panel).
          flex-1 min-h-0: grid takes the remaining height so each column's
          internal ScrollArea has a bounded scroll region. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {step === 1 ? (
          <div className="flex min-h-0 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="typography-subtitle font-semibold text-foreground">
                Step 1: Choose the top-up for your target tier
              </h3>
              <p className="typography-body text-muted-foreground">
                Select a target quota tier to determine your monthly top-up.
                All topped-up funds go directly toward your Blaxel usage.
              </p>
            </div>

            <ScrollArea className="-mr-3 flex-1 pr-3">
              <TierPicker
                value={values.selectedTier}
                onChange={(next) =>
                  setValue("selectedTier", next, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
            </ScrollArea>
          </div>
        ) : (
          <div className="flex min-h-0 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="typography-subtitle font-semibold text-foreground">
                Step 2: Configure balance protection
              </h3>
              <p className="typography-body text-muted-foreground">
                Optional settings that keep your balance above a floor and help
                avoid downgrades.
              </p>
            </div>

            <ScrollArea className="-mr-3 flex-1 pr-3">
              <div className="flex flex-col gap-6">
                <BalanceProtectionCard
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  autoTopUpEnabled={values.autoTopUpEnabled}
                  monthlyLimitEnabled={values.monthlyLimitEnabled}
                />

                <Alert variant="info">
                  <AlertDescription>
                    You will be charged ${amountUsd.toLocaleString()} today, and
                    every 30 days thereafter.
                  </AlertDescription>
                </Alert>
              </div>
            </ScrollArea>
          </div>
        )}

        <AboutTierPanel targetTier={targetTier} currentTier={currentTier} />
      </div>

      {/* Action row spans the full dialog width below the grid so it stays
          visible regardless of step-body scroll. Step 2 anchors Previous to
          the left edge and groups Cancel + Checkout on the right. */}
      {step === 1 ? (
        <div className="flex shrink-0 items-center justify-end gap-2">
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
        </div>
      ) : (
        <div className="flex shrink-0 items-center justify-between gap-2">
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
        </div>
      )}
    </form>
  );
}
