"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { DialogBody, DialogFooter } from "@repo/ui/components/dialog";
import { type DisplayTier, type SelectableTier } from "@/lib/mock/billing-tiers";
import SelectedTierSummary from "./selected-tier-summary";
import TierPicker from "./tier-picker";
import TierContextBanner from "./tier-context-banner";
import BalanceProtectionCard from "./balance-protection-card";
import {
  INITIAL_VALUES,
  resolveAmountUsd,
  selectedTier,
  topUpSchema,
  type TopUpFormValues,
} from "./wizard-state";

type StepIndex = 1 | 2;

interface OneTimeTopUpFlowProps {
  currentTier: DisplayTier;
  /** Tier the launching surface needs — preselected, marked Recommended. */
  recommendedTier?: SelectableTier;
  onCancel: () => void;
  onCheckout: (amountUsd: number) => void;
}

export default function OneTimeTopUpFlow({
  currentTier,
  recommendedTier,
  onCancel,
  onCheckout,
}: OneTimeTopUpFlowProps) {
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
    // Single-column flow — no right-rail About panel. Step 1 surfaces the
    // tier grid + selected-tier summary; step 2 leads with a one-line tier
    // banner so the user keeps context while configuring protection. The
    // <form> wraps DialogBody + DialogFooter as siblings: body owns scroll,
    // footer pins to the dialog bottom, and the submit button still reaches
    // this form's onSubmit because the footer is inside the <form>.
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
                Credits will be added to your Blaxel balance immediately after
                checking out.
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
                Configure balance protection
              </h3>
              <p className="typography-body text-muted-foreground">
                Optional settings that keep your balance above a floor and help
                avoid downgrades.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <TierContextBanner
                targetTier={targetTier}
                amountUsd={amountUsd}
                cadence="one-time"
              />
              <BalanceProtectionCard
                register={register}
                setValue={setValue}
                errors={errors}
                autoTopUpEnabled={values.autoTopUpEnabled}
                monthlyLimitEnabled={values.monthlyLimitEnabled}
              />
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
