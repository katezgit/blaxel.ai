"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { type DisplayTier } from "@/lib/mock/billing-tiers";
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
  onCancel: () => void;
  onCheckout: (amountUsd: number) => void;
}

export default function OneTimeTopUpFlow({
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
    // Single-column flow — no right-rail About panel. Step 1 surfaces the
    // tier grid + selected-tier summary; step 2 leads with a one-line tier
    // banner so the user keeps context while configuring protection.
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col gap-6"
    >
      {step === 1 ? (
        <div className="flex min-h-0 flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="typography-subtitle font-semibold text-foreground">
              Choose your target tier
            </h3>
            <p className="typography-body text-muted-foreground">
              Credits will be added to your Blaxel balance immediately after
              checking out.
            </p>
          </div>

          {/* -mr-3 pr-3: ScrollArea's overlay scrollbar floats inside the
              content box; without negative-margin compensation it overlaps
              right-edge fields. Net effect — scrollbar sits in the dialog
              gutter, content keeps its 12px right padding. */}
          <ScrollArea className="-mr-3 min-h-0 flex-1 pr-3">
            <div className="flex flex-col gap-4">
              <TierPicker
                value={values.selectedTier}
                onChange={(next) =>
                  setValue("selectedTier", next, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
              <SelectedTierSummary
                targetTier={targetTier}
                currentTier={currentTier}
              />
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="flex min-h-0 flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="typography-subtitle font-semibold text-foreground">
              Configure balance protection
            </h3>
            <p className="typography-body text-muted-foreground">
              Optional settings that keep your balance above a floor and help
              avoid downgrades.
            </p>
          </div>

          {/* -mr-3 pr-3: ScrollArea's overlay scrollbar floats inside the
              content box; without negative-margin compensation it overlaps
              right-edge fields. Net effect — scrollbar sits in the dialog
              gutter, content keeps its 12px right padding. */}
          <ScrollArea className="-mr-3 min-h-0 flex-1 pr-3">
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
          </ScrollArea>
        </div>
      )}

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
