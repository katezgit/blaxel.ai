"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import { InlineGate } from "@/app/(account)/account/_components/inline-gate";
import { Field, FieldRow, Panel } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

const schema = z.object({
  enabled: z.boolean(),
  amountUsd: z
    .number({ message: "Amount is required" })
    .min(1, "Amount must be at least $1")
    .max(10000, "Amount must be at most $10,000"),
});

type Values = z.infer<typeof schema>;

export default function MonthlyTopUpForm() {
  const { state, setMonthlyTopUp } = useAccountState();
  const hasPaymentMethod = state.paymentMethod.brand !== null;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: state.monthlyTopUp,
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting, isValid },
  } = form;

  useEffect(() => {
    reset(state.monthlyTopUp);
  }, [reset, state.monthlyTopUp]);

  const enabled = watch("enabled");

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    setMonthlyTopUp(values);
    reset(values);
    toast.success("Monthly top-up saved");
  });

  return (
    <Panel
      title="Monthly top-up"
      subtitle="Schedule a fixed credit top-up every month."
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3">
          <span className="flex flex-col gap-0.5">
            <span className="text-body text-foreground">Enable monthly top-up</span>
            <span className="text-caption text-muted-foreground">
              {enabled ? "On" : "Off"}
            </span>
          </span>
          <Switch
            checked={enabled}
            onCheckedChange={(next) => setValue("enabled", next, { shouldDirty: true })}
            aria-label="Enable monthly top-up"
          />
        </div>

        <FieldRow cols={1}>
          <Field
            label="Amount to top up each month"
            error={errors.amountUsd?.message}
            hint="USD"
          >
            <Input
              type="number"
              step="1"
              min="1"
              disabled={!enabled}
              aria-invalid={errors.amountUsd ? true : undefined}
              {...register("amountUsd", { valueAsNumber: true })}
            />
          </Field>
        </FieldRow>

        <p className="flex items-start gap-2 text-caption text-muted-foreground">
          <Info className="mt-0.5 size-3.5" aria-hidden="true" />
          Top-ups are charged to your default payment method on the first of each
          month.
        </p>

        {!hasPaymentMethod ? (
          <InlineGate tier={1} verb="enable monthly top-up" />
        ) : null}

        <div className="flex items-center justify-end gap-2">
          {isDirty ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => reset(state.monthlyTopUp)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !isValid || !isDirty}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
