"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Calendar, Zap } from "lucide-react";
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
import InlineGate from "@/app/(app)/account/_components/inline-gate";
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
          message: "Threshold must be at least $1",
        });
      } else if (values.autoThresholdUsd > 10000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["autoThresholdUsd"],
          message: "Threshold must be at most $10,000",
        });
      }
      if (!Number.isFinite(values.autoAmountUsd) || values.autoAmountUsd < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["autoAmountUsd"],
          message: "Amount must be at least $1",
        });
      } else if (values.autoAmountUsd > 10000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["autoAmountUsd"],
          message: "Amount must be at most $10,000",
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
          message: "Amount must be at least $1",
        });
      } else if (values.monthlyAmountUsd > 10000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["monthlyAmountUsd"],
          message: "Amount must be at most $10,000",
        });
      }
    }
  });

type Values = z.infer<typeof schema>;

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

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      autoEnabled: autoTopUp.enabled,
      autoThresholdUsd: autoTopUp.thresholdUsd,
      autoAmountUsd: autoTopUp.amountUsd,
      monthlyEnabled: monthlyTopUp.enabled,
      monthlyAmountUsd: monthlyTopUp.amountUsd,
    },
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = form;

  const autoEnabled = watch("autoEnabled");
  const monthlyEnabled = watch("monthlyEnabled");

  // Re-validate when toggling enable so disabled fields' stale errors clear.
  useEffect(() => {
    form.trigger();
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
    toast.success("Automatic top-up settings saved");
    onClose();
  });

  const blockedByMissingPayment =
    !hasPaymentMethod && (autoEnabled || monthlyEnabled);

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <DialogHeader>
        <DialogTitle>Automatic top-up</DialogTitle>
        <DialogDescription>
          Rules that keep your balance from running out.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="flex flex-col gap-4">
          <RuleSection
            icon={<Zap aria-hidden="true" className="size-4" />}
            title="Auto top-up"
            description="Add credits when the balance drops below a threshold."
            enabled={autoEnabled}
            onEnabledChange={(next) =>
              setValue("autoEnabled", next, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            switchLabel={autoEnabled ? "Disable auto top-up" : "Enable auto top-up"}
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
                  aria-invalid={errors.autoAmountUsd ? true : undefined}
                  {...register("autoAmountUsd", { valueAsNumber: true })}
                />
              </Field>
            </FieldRow>
            {hasPaymentMethod ? null : (
              <InlineGate tier={1} verb="enable auto top-up" />
            )}
          </RuleSection>

          <RuleSection
            icon={<Calendar aria-hidden="true" className="size-4" />}
            title="Monthly top-up"
            description="Add a fixed credit amount every month."
            enabled={monthlyEnabled}
            onEnabledChange={(next) =>
              setValue("monthlyEnabled", next, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            switchLabel={
              monthlyEnabled ? "Disable monthly top-up" : "Enable monthly top-up"
            }
          >
            <FieldRow cols={2}>
              <Field
                label="Monthly top-up amount"
                error={errors.monthlyAmountUsd?.message}
                hint="USD"
              >
                <Input
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min="1"
                  aria-invalid={errors.monthlyAmountUsd ? true : undefined}
                  {...register("monthlyAmountUsd", { valueAsNumber: true })}
                />
              </Field>
              <Field label="Charge date">
                <div className="flex h-9 items-center rounded-md border border-border bg-card px-3 typography-body text-muted-foreground">
                  First day of each month
                </div>
              </Field>
            </FieldRow>
            {hasPaymentMethod ? null : (
              <InlineGate tier={1} verb="enable monthly top-up" />
            )}
          </RuleSection>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={
            isSubmitting || !isDirty || !isValid || blockedByMissingPayment
          }
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface RuleSectionProps {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onEnabledChange: (next: boolean) => void;
  switchLabel: string;
  children: ReactNode;
}

function RuleSection({
  icon,
  title,
  description,
  enabled,
  onEnabledChange,
  switchLabel,
  children,
}: RuleSectionProps) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-hover-surface text-muted-foreground">
            {icon}
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="typography-body font-medium text-foreground">
              {title}
            </h3>
            <p className="typography-caption text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          aria-label={switchLabel}
        />
      </div>
      {enabled ? <div className="pl-11 flex flex-col gap-3">{children}</div> : null}
    </div>
  );
}
