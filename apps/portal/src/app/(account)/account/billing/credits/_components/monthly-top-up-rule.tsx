"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import InlineGate from "@/app/(account)/account/_components/inline-gate";
import { Field, FieldRow } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

const schema = z.object({
  amountUsd: z
    .number({ message: "Amount is required" })
    .min(1, "Amount must be at least $1")
    .max(10000, "Amount must be at most $10,000"),
});

type Values = z.infer<typeof schema>;

function resolveSubmitLabel(isSubmitting: boolean, wasOn: boolean): string {
  if (isSubmitting) return "Saving…";
  if (wasOn) return "Save changes";
  return "Enable";
}

const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

interface MonthlyTopUpRuleProps {
  isExpanded: boolean;
  onRequestEdit: () => void;
  onCollapse: () => void;
}

export default function MonthlyTopUpRule({
  isExpanded,
  onRequestEdit,
  onCollapse,
}: MonthlyTopUpRuleProps) {
  const { state, setMonthlyTopUp } = useAccountState();
  const { enabled, amountUsd } = state.monthlyTopUp;
  const { brand, last4 } = state.paymentMethod;
  const hasPaymentMethod = brand !== null;

  if (isExpanded) {
    return (
      <MonthlyTopUpEditor
        defaults={{ amountUsd }}
        wasOn={enabled}
        hasPaymentMethod={hasPaymentMethod}
        paymentMethodLabel={hasPaymentMethod ? `${brand} ending ${last4}` : null}
        onSave={(values) => {
          setMonthlyTopUp({ enabled: true, ...values });
          toast.success(
            enabled ? "Monthly top-up updated" : "Monthly top-up enabled",
          );
          onCollapse();
        }}
        onCancel={onCollapse}
      />
    );
  }

  if (enabled) {
    return (
      <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-card px-4 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h4 className="text-body font-medium text-foreground">
              Monthly top-up
            </h4>
            <Badge variant="success" showDot>
              On
            </Badge>
          </div>
          <p className="text-caption text-muted-foreground">
            Add {formatUsd(amountUsd)} on the first day of each month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onRequestEdit}>
            Edit
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setMonthlyTopUp({ enabled: false, amountUsd });
              toast.success("Monthly top-up disabled");
            }}
          >
            Turn off
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-card px-4 py-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h4 className="text-body font-medium text-foreground">
            Monthly top-up
          </h4>
          <Badge variant="neutral">Off</Badge>
        </div>
        <p className="text-caption text-muted-foreground">
          Add a fixed credit amount every month.
        </p>
      </div>
      <Button variant="secondary" onClick={onRequestEdit}>
        Enable
      </Button>
    </div>
  );
}

interface MonthlyTopUpEditorProps {
  defaults: Values;
  wasOn: boolean;
  hasPaymentMethod: boolean;
  paymentMethodLabel: string | null;
  onSave: (values: Values) => void;
  onCancel: () => void;
}

function MonthlyTopUpEditor({
  defaults,
  wasOn,
  hasPaymentMethod,
  paymentMethodLabel,
  onSave,
  onCancel,
}: MonthlyTopUpEditorProps) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = form;

  useEffect(() => {
    reset(defaults);
  }, [reset, defaults]);

  const amount = watch("amountUsd");
  const previewAmount = Number.isFinite(amount) ? formatUsd(amount) : "$—";

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    onSave(values);
  });

  const submitLabel = resolveSubmitLabel(isSubmitting, wasOn);

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-md border border-border bg-card px-4 py-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h4 className="text-body font-medium text-foreground">
            Monthly top-up
          </h4>
          <p className="text-caption text-muted-foreground">
            Add a fixed credit amount every month.
          </p>
        </div>
      </div>

      <FieldRow cols={2}>
        <Field
          label="Monthly top-up amount"
          error={errors.amountUsd?.message}
          hint="USD"
        >
          <Input
            type="number"
            step="1"
            min="1"
            aria-invalid={errors.amountUsd ? true : undefined}
            {...register("amountUsd", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Charge date">
          <div className="flex h-9 items-center rounded-md border border-border bg-muted-surface px-3 text-body text-muted-foreground">
            First day of each month
          </div>
        </Field>
      </FieldRow>

      <div className="flex flex-col gap-1">
        <p className="text-caption text-muted-foreground">
          {previewAmount} will be added on the first day of each month.
        </p>
        {paymentMethodLabel ? (
          <p className="text-caption text-meta-foreground">
            Charged to {paymentMethodLabel}.
          </p>
        ) : null}
      </div>

      {!hasPaymentMethod ? (
        <InlineGate tier={1} verb="enable monthly top-up" />
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !isValid || !hasPaymentMethod}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
