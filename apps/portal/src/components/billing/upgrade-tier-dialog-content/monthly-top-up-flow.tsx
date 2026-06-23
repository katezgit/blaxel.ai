"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
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
    // gap-8: Stepper (chrome) → step body (region) at 32px per spacing canon.
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <Stepper steps={STEPS} currentStep={step} />

      {/* gap-8: peer major regions (form column ↔ About-Tier panel). */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {step === 1 ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="typography-subtitle font-semibold text-foreground">
                Step 1: Choose the top-up for your target tier
              </h3>
              <p className="typography-body text-muted-foreground">
                Select a target quota tier to determine your monthly top-up.
                All topped-up funds go directly toward your Blaxel usage.
              </p>
            </div>

            <TierPicker
              value={values.selectedTier}
              onChange={(next) =>
                setValue("selectedTier", next, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />

            <div className="flex items-center justify-end gap-2">
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
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="typography-subtitle font-semibold text-foreground">
                Step 2: Configure balance protection
              </h3>
              <p className="typography-body text-muted-foreground">
                Optional settings that keep your balance above a floor and help
                avoid downgrades.
              </p>
            </div>

            <BalanceProtectionCard
              register={register}
              setValue={setValue}
              errors={errors}
              autoTopUpEnabled={values.autoTopUpEnabled}
              monthlyLimitEnabled={values.monthlyLimitEnabled}
            />

            <Alert variant="success">
              <AlertDescription>
                You will be charged ${amountUsd.toLocaleString()} today, and
                every 30 days thereafter.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                Previous
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Processing…" : "Checkout"}
              </Button>
            </div>
          </div>
        )}

        <AboutTierPanel targetTier={targetTier} currentTier={currentTier} />
      </div>
    </form>
  );
}
