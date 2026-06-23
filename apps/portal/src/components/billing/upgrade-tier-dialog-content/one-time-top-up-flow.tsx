"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Stepper, type StepperStep } from "@repo/ui/components/stepper";
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

interface OneTimeTopUpFlowProps {
  onCancel: () => void;
  onCheckout: (amountUsd: number) => void;
}

export function OneTimeTopUpFlow({ onCancel, onCheckout }: OneTimeTopUpFlowProps) {
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

      {step === 1 ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="typography-subtitle font-semibold text-foreground">
              Choose how much to top-up
            </h3>
            <p className="typography-body text-muted-foreground">
              Credits will be added to your Blaxel balance immediately after
              checking out.
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
    </form>
  );
}
