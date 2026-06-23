"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Stepper, type StepperStep } from "@repo/ui/components/stepper";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { tierForAmount, type DisplayTier } from "@/lib/mock/billing-tiers";
import { AboutTierPanel } from "./about-tier-panel";
import { AmountPicker } from "./amount-picker";
import { BalanceProtectionCard } from "./balance-protection-card";
import {
  INITIAL_VALUES,
  resolveAmountUsd,
  topUpSchema,
  type TopUpFormValues,
} from "./wizard-state";

const STEPS: ReadonlyArray<StepperStep> = [
  { label: "Choose amount" },
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
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  const values = watch();
  const amountUsd = resolveAmountUsd(values);
  const canContinue = amountUsd > 0;
  const targetTier = tierForAmount(amountUsd);

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    onCheckout(amountUsd);
  });

  const handleContinue = async () => {
    const valid = await trigger(["selection", "customAmount"]);
    if (valid) setStep(2);
  };

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
                Choose how much to top-up
              </h3>
              <p className="typography-body text-muted-foreground">
                Monthly top-ups secure your tier. The balance is added
                immediately and renews every 30 days.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="typography-label text-muted-foreground">
                Amount to top up
              </span>
              <AmountPicker
                selection={values.selection}
                onSelectionChange={(selection) =>
                  setValue(
                    "selection",
                    selection as TopUpFormValues["selection"],
                    { shouldValidate: true, shouldDirty: true },
                  )
                }
                customAmount={values.customAmount}
                onCustomAmountChange={(next) =>
                  setValue("customAmount", next, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                customAmountError={errors.customAmount?.message}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={!canContinue}
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="typography-subtitle font-semibold text-foreground">
                Configure balance protection
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
