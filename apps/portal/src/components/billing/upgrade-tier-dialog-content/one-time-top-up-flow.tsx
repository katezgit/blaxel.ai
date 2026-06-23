"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Stepper, type StepperStep } from "@repo/ui/components/stepper";
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

interface OneTimeTopUpFlowProps {
  currentTier: DisplayTier;
  onCancel: () => void;
  onCheckout: (amountUsd: number) => void;
}

export function OneTimeTopUpFlow({
  currentTier,
  onCancel,
  onCheckout,
}: OneTimeTopUpFlowProps) {
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
    // configured at the index.tsx callsite) so the internal ScrollArea can be
    // bounded — keeps the action row visible at the dialog bottom.
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      <Stepper steps={STEPS} currentStep={step} />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {step === 1 ? (
          <div className="flex min-h-0 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="typography-subtitle font-semibold text-foreground">
                Step 1: Choose the top-up for your target tier
              </h3>
              <p className="typography-body text-muted-foreground">
                Credits will be added to your Blaxel balance immediately after
                checking out.
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
              <BalanceProtectionCard
                register={register}
                setValue={setValue}
                errors={errors}
                autoTopUpEnabled={values.autoTopUpEnabled}
                monthlyLimitEnabled={values.monthlyLimitEnabled}
              />
            </ScrollArea>
          </div>
        )}

        <AboutTierPanel targetTier={targetTier} currentTier={currentTier} />
      </div>

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
