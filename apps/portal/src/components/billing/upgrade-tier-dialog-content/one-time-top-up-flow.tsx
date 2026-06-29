"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign } from "lucide-react";
import type { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import { Button } from "@repo/ui/components/button";
import { DialogBody, DialogFooter } from "@repo/ui/components/dialog";
import BalanceProtectionCard from "./balance-protection-card";
import AmountPicker from "./amount-picker";
import NumberedStepper from "./numbered-stepper";
import {
  ONE_TIME_INITIAL_VALUES,
  oneTimeTopUpSchema,
  resolveOneTimeAmountUsd,
  type OneTimeTopUpFormValues,
  type TopUpFormValues,
} from "./wizard-state";

type StepIndex = 1 | 2;

const STEPS = [
  { label: "Choose how much to top-up" },
  { label: "Configure balance protection" },
] as const;

interface OneTimeTopUpFlowProps {
  onCancel: () => void;
  onCheckout: (amountUsd: number) => void;
}

export default function OneTimeTopUpFlow({
  onCancel,
  onCheckout,
}: OneTimeTopUpFlowProps) {
  const [step, setStep] = useState<StepIndex>(1);
  const form = useForm<OneTimeTopUpFormValues>({
    resolver: zodResolver(oneTimeTopUpSchema),
    defaultValues: ONE_TIME_INITIAL_VALUES,
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
  const amountUsd = resolveOneTimeAmountUsd(values);
  const hasAmount = amountUsd > 0;

  // BalanceProtectionCard is typed against the Monthly form. Its fields
  // (autoTopUp*, monthlyLimit*) are identical in shape and name on the
  // One-time form, so re-typing at the boundary is a no-op at runtime —
  // RHF resolves field names against the underlying form instance.
  const sharedRegister = register as unknown as UseFormRegister<TopUpFormValues>;
  const sharedSetValue = setValue as unknown as UseFormSetValue<TopUpFormValues>;
  const sharedErrors = errors as unknown as FieldErrors<TopUpFormValues>;

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    onCheckout(amountUsd);
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <DialogBody>
        <div className="flex flex-col gap-6">
          <NumberedStepper steps={STEPS} currentStep={step} />
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <DollarSign
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                <span className="font-mono typography-body font-medium text-foreground">
                  Amount to top up
                </span>
              </div>
              <AmountPicker
                presetValue={values.presetAmountUsd}
                customValue={values.customAmountUsd}
                customError={errors.customAmountUsd?.message}
                onPresetChange={(next) => {
                  setValue("presetAmountUsd", next, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  if (next !== null) {
                    setValue("customAmountUsd", undefined, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
                onCustomChange={(next) =>
                  setValue("customAmountUsd", next, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
            </div>
          ) : (
            <BalanceProtectionCard
              register={sharedRegister}
              setValue={sharedSetValue}
              errors={sharedErrors}
              autoTopUpEnabled={values.autoTopUpEnabled}
              monthlyLimitEnabled={values.monthlyLimitEnabled}
            />
          )}
        </div>
      </DialogBody>
      {step === 1 ? (
        // Keys force React to unmount these buttons on the step transition.
        // Without them, React reuses the DOM nodes by index and patches the
        // primary button's `type` attribute from "button" to "submit"
        // (Checkout) mid-click; the in-flight click event then triggers form
        // submission instead of just advancing the step.
        <DialogFooter>
          <Button key="step1-cancel" type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            key="step1-continue"
            type="button"
            variant="primary"
            onClick={() => setStep(2)}
            disabled={!hasAmount}
          >
            Continue
          </Button>
        </DialogFooter>
      ) : (
        <DialogFooter className="justify-between">
          <Button
            key="step2-previous"
            type="button"
            variant="ghost"
            onClick={() => setStep(1)}
            disabled={isSubmitting}
          >
            Previous
          </Button>
          <Button key="step2-checkout" type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Processing…" : "Checkout"}
          </Button>
        </DialogFooter>
      )}
    </form>
  );
}
