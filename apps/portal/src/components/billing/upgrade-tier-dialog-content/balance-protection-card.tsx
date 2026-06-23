"use client";

import { DollarSign } from "lucide-react";
import type { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import { Card } from "@repo/ui/components/card";
import { Switch } from "@repo/ui/components/switch";
import { Input } from "@repo/ui/components/input";
import type { TopUpFormValues } from "./wizard-state";

interface BalanceProtectionCardProps {
  register: UseFormRegister<TopUpFormValues>;
  setValue: UseFormSetValue<TopUpFormValues>;
  errors: FieldErrors<TopUpFormValues>;
  autoTopUpEnabled: boolean;
  monthlyLimitEnabled: boolean;
}

export function BalanceProtectionCard({
  register,
  setValue,
  errors,
  autoTopUpEnabled,
  monthlyLimitEnabled,
}: BalanceProtectionCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="auto-top-up-toggle"
            className="typography-body font-medium text-foreground"
          >
            Enable auto top-up when balance is low
          </label>
          <Switch
            id="auto-top-up-toggle"
            checked={autoTopUpEnabled}
            onCheckedChange={(checked) =>
              setValue("autoTopUpEnabled", checked, { shouldDirty: true })
            }
          />
        </div>
        {autoTopUpEnabled ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 typography-label">
              <span className="text-muted-foreground">
                When credit balance goes below
              </span>
              <Input
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                aria-invalid={errors.autoTopUpThresholdUsd ? true : undefined}
                {...register("autoTopUpThresholdUsd", { valueAsNumber: true })}
                leading={<DollarSign aria-hidden="true" className="size-4" />}
              />
              {errors.autoTopUpThresholdUsd?.message ? (
                <span
                  role="alert"
                  className="typography-caption font-medium text-state-errored-text"
                >
                  {errors.autoTopUpThresholdUsd.message}
                </span>
              ) : null}
            </label>
            <label className="flex flex-col gap-1.5 typography-label">
              <span className="text-muted-foreground">
                Add following amount to your balance
              </span>
              <Input
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                aria-invalid={errors.autoTopUpAmountUsd ? true : undefined}
                {...register("autoTopUpAmountUsd", { valueAsNumber: true })}
                leading={<DollarSign aria-hidden="true" className="size-4" />}
              />
              {errors.autoTopUpAmountUsd?.message ? (
                <span
                  role="alert"
                  className="typography-caption font-medium text-state-errored-text"
                >
                  {errors.autoTopUpAmountUsd.message}
                </span>
              ) : null}
            </label>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="monthly-limit-toggle"
            className="typography-body font-medium text-foreground"
          >
            Enable monthly limit{" "}
            <span className="text-muted-foreground">(optional)</span>
          </label>
          <Switch
            id="monthly-limit-toggle"
            checked={monthlyLimitEnabled}
            onCheckedChange={(checked) =>
              setValue("monthlyLimitEnabled", checked, { shouldDirty: true })
            }
          />
        </div>
        {monthlyLimitEnabled ? (
          <label className="flex flex-col gap-1.5 typography-label sm:max-w-[50%]">
            <span className="text-muted-foreground">
              Maximum spend per month
            </span>
            <Input
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              aria-invalid={errors.monthlyLimitAmountUsd ? true : undefined}
              {...register("monthlyLimitAmountUsd", { valueAsNumber: true })}
              leading={<DollarSign aria-hidden="true" className="size-4" />}
            />
            {errors.monthlyLimitAmountUsd?.message ? (
              <span
                role="alert"
                className="typography-caption font-medium text-state-errored-text"
              >
                {errors.monthlyLimitAmountUsd.message}
              </span>
            ) : null}
          </label>
        ) : null}
      </div>
    </Card>
  );
}
