"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { DialogBody, DialogFooter } from "@repo/ui/components/dialog";
import AmountPicker from "./amount-picker";
import {
  ONE_TIME_INITIAL_VALUES,
  oneTimeTopUpSchema,
  resolveOneTimeAmountUsd,
  type OneTimeTopUpFormValues,
} from "./wizard-state";

interface OneTimeTopUpFlowProps {
  onCancel: () => void;
  onCheckout: (amountUsd: number) => void;
}

export default function OneTimeTopUpFlow({
  onCancel,
  onCheckout,
}: OneTimeTopUpFlowProps) {
  const form = useForm<OneTimeTopUpFormValues>({
    resolver: zodResolver(oneTimeTopUpSchema),
    defaultValues: ONE_TIME_INITIAL_VALUES,
    mode: "onChange",
  });
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const values = watch();
  const amountUsd = resolveOneTimeAmountUsd(values);
  const hasAmount = amountUsd > 0;

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
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <DollarSign
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            <span className="font-mono typography-body text-foreground">
              Amount to top up
            </span>
          </div>
          <AmountPicker
            value={{
              preset: values.presetAmountUsd,
              custom: values.customAmountUsd,
            }}
            error={errors.customAmountUsd?.message}
            onChange={(next) => {
              setValue("presetAmountUsd", next.preset, {
                shouldValidate: true,
                shouldDirty: true,
              });
              setValue("customAmountUsd", next.custom, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !hasAmount}
        >
          {isSubmitting ? "Processing…" : `Checkout · $${amountUsd.toLocaleString()}`}
        </Button>
      </DialogFooter>
    </form>
  );
}
