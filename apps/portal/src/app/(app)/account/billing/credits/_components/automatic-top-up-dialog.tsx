"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Calendar, Loader2, Zap } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import { Field, FieldRow } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

interface AutomaticTopUpDialogProps {
  /** Trigger element — rendered inside DialogTrigger asChild. */
  trigger: ReactNode;
}

const schema = z
  .object({
    autoEnabled: z.boolean(),
    autoThresholdUsd: z.number({ message: "Threshold is required" }),
    autoAmountUsd: z.number({ message: "Amount is required" }),
    monthlyEnabled: z.boolean(),
    monthlyAmountUsd: z.number({ message: "Amount is required" }),
  })
  .superRefine((values, ctx) => {
    if (values.autoEnabled) {
      if (!Number.isFinite(values.autoThresholdUsd) || values.autoThresholdUsd < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["autoThresholdUsd"],
          message: "Enter a threshold between $1 and $10,000",
        });
      } else if (values.autoThresholdUsd > 10000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["autoThresholdUsd"],
          message: "Enter a threshold between $1 and $10,000",
        });
      }
      if (!Number.isFinite(values.autoAmountUsd) || values.autoAmountUsd < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["autoAmountUsd"],
          message: "Enter an amount between $1 and $10,000",
        });
      } else if (values.autoAmountUsd > 10000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["autoAmountUsd"],
          message: "Enter an amount between $1 and $10,000",
        });
      }
    }
    if (values.monthlyEnabled) {
      if (
        !Number.isFinite(values.monthlyAmountUsd) ||
        values.monthlyAmountUsd < 1
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["monthlyAmountUsd"],
          message: "Enter an amount between $1 and $10,000",
        });
      } else if (values.monthlyAmountUsd > 10000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["monthlyAmountUsd"],
          message: "Enter an amount between $1 and $10,000",
        });
      }
    }
  });

type Values = z.infer<typeof schema>;

const PAYMENT_METHOD_HREF = "/account/billing/invoices-payment#payment-method";

const formatUsdCompact = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function AutomaticTopUpDialog({
  trigger,
}: AutomaticTopUpDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent size="md">
        {open ? <AutomaticTopUpForm onClose={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function AutomaticTopUpForm({ onClose }: { onClose: () => void }) {
  const { state, setAutoTopUp, setMonthlyTopUp } = useAccountState();
  const { autoTopUp, monthlyTopUp, paymentMethod } = state;
  const hasPaymentMethod = paymentMethod.brand !== null;
  const paymentLabel = hasPaymentMethod
    ? `${paymentMethod.brand} ending ${paymentMethod.last4}`
    : null;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      autoEnabled: autoTopUp.enabled,
      autoThresholdUsd: autoTopUp.thresholdUsd,
      autoAmountUsd: autoTopUp.amountUsd,
      monthlyEnabled: monthlyTopUp.enabled,
      monthlyAmountUsd: monthlyTopUp.amountUsd,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const autoEnabled = watch("autoEnabled");
  const monthlyEnabled = watch("monthlyEnabled");
  const autoThreshold = watch("autoThresholdUsd");
  const autoAmount = watch("autoAmountUsd");
  const monthlyAmount = watch("monthlyAmountUsd");

  // Toggling an enable flag changes which fields are required by the schema.
  // Clear any stale errors on fields that just became inactive.
  useEffect(() => {
    if (!autoEnabled) {
      form.clearErrors(["autoThresholdUsd", "autoAmountUsd"]);
    }
    if (!monthlyEnabled) {
      form.clearErrors(["monthlyAmountUsd"]);
    }
  }, [form, autoEnabled, monthlyEnabled]);

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    setAutoTopUp({
      enabled: values.autoEnabled,
      thresholdUsd: values.autoThresholdUsd,
      amountUsd: values.autoAmountUsd,
    });
    setMonthlyTopUp({
      enabled: values.monthlyEnabled,
      amountUsd: values.monthlyAmountUsd,
    });
    toast.success("Top-up rules saved.");
    onClose();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <DialogHeader>
        <DialogTitle>Automatic top-up</DialogTitle>
        <DialogDescription>
          Configure rules that add credits automatically.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="flex flex-col">
          <RuleRow
            icon={<Zap aria-hidden="true" className="size-4" />}
            title="Auto top-up"
            description="Add credits when balance drops below a threshold."
            enabled={autoEnabled}
            onEnabledChange={(next) =>
              setValue("autoEnabled", next, { shouldDirty: true })
            }
            switchLabel={autoEnabled ? "Disable auto top-up" : "Enable auto top-up"}
            disabled={isSubmitting}
          >
            <FieldRow cols={2}>
              <Field
                label="Balance threshold"
                error={errors.autoThresholdUsd?.message}
                hint="USD"
              >
                <Input
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min="1"
                  placeholder="5"
                  disabled={isSubmitting}
                  aria-invalid={errors.autoThresholdUsd ? true : undefined}
                  {...register("autoThresholdUsd", { valueAsNumber: true })}
                />
              </Field>
              <Field
                label="Top-up amount"
                error={errors.autoAmountUsd?.message}
                hint="USD"
              >
                <Input
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min="1"
                  placeholder="25"
                  disabled={isSubmitting}
                  aria-invalid={errors.autoAmountUsd ? true : undefined}
                  {...register("autoAmountUsd", { valueAsNumber: true })}
                />
              </Field>
            </FieldRow>
            <RulePreview>
              When balance drops below{" "}
              <PreviewAmount value={autoThreshold} />, <PreviewAmount value={autoAmount} />{" "}
              will be added.
            </RulePreview>
            {hasPaymentMethod ? (
              <PaymentMethodLine label={paymentLabel ?? ""} />
            ) : (
              <PaymentMissingNotice />
            )}
          </RuleRow>

          <RuleRow
            icon={<Calendar aria-hidden="true" className="size-4" />}
            title="Monthly top-up"
            description="Add a fixed credit amount every month."
            enabled={monthlyEnabled}
            onEnabledChange={(next) =>
              setValue("monthlyEnabled", next, { shouldDirty: true })
            }
            switchLabel={
              monthlyEnabled ? "Disable monthly top-up" : "Enable monthly top-up"
            }
            disabled={isSubmitting}
            withTopBorder
          >
            <FieldRow cols={2}>
              <Field
                label="Amount"
                error={errors.monthlyAmountUsd?.message}
                hint="USD"
              >
                <Input
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min="1"
                  placeholder="25"
                  disabled={isSubmitting}
                  aria-invalid={errors.monthlyAmountUsd ? true : undefined}
                  {...register("monthlyAmountUsd", { valueAsNumber: true })}
                />
              </Field>
              <Field label="Charge date">
                <div className="flex h-9 items-center rounded-md border border-border bg-card px-3 typography-body text-muted-foreground">
                  First of each month
                </div>
              </Field>
            </FieldRow>
            <RulePreview>
              <PreviewAmount value={monthlyAmount} /> will be added on the 1st of each
              month.
            </RulePreview>
            {hasPaymentMethod ? (
              <PaymentMethodLine label={paymentLabel ?? ""} />
            ) : (
              <PaymentMissingNotice />
            )}
          </RuleRow>
        </div>
      </DialogBody>
      <DialogFooter>
        {isDirty && !isSubmitting ? (
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface RuleRowProps {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onEnabledChange: (next: boolean) => void;
  switchLabel: string;
  disabled?: boolean;
  withTopBorder?: boolean;
  children: ReactNode;
}

function RuleRow({
  icon,
  title,
  description,
  enabled,
  onEnabledChange,
  switchLabel,
  disabled,
  withTopBorder,
  children,
}: RuleRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        withTopBorder && "border-t border-border pt-4 mt-4",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-hover-surface text-muted-foreground">
            {icon}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="typography-body font-semibold text-foreground">{title}</h3>
            <p className="typography-caption text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          disabled={disabled}
          aria-label={switchLabel}
        />
      </div>
      {/* pl-11 (44px) = size-8 icon (32px) + gap-3 (12px); aligns rule body under the title text. */}
      {enabled ? <div className="pl-11 flex flex-col gap-3">{children}</div> : null}
    </div>
  );
}

function RulePreview({ children }: { children: ReactNode }) {
  return <p className="typography-caption text-muted-foreground">{children}</p>;
}

function PreviewAmount({ value }: { value: number }) {
  const display =
    Number.isFinite(value) && value > 0 ? formatUsdCompact(value) : "$—";
  return <span className="font-mono text-foreground">{display}</span>;
}

function PaymentMethodLine({ label }: { label: string }) {
  return (
    <p className="typography-caption text-muted-foreground">Charged to {label}.</p>
  );
}

function PaymentMissingNotice() {
  return (
    <p className="typography-caption text-muted-foreground">
      No payment method on file. This rule will activate once you add one.{" "}
      <Link
        href={PAYMENT_METHOD_HREF}
        className="text-primary hover:underline focus-visible:shadow-focus-ring rounded-sm"
      >
        Add payment method →
      </Link>
    </p>
  );
}
