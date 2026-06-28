"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Zap } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import InlineGate from "@/app/(app)/account/_components/inline-gate";
import { Field, FieldRow } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

const schema = z.object({
  thresholdUsd: z
    .number({ message: "Threshold is required" })
    .min(1, "Threshold must be at least $1")
    .max(10000, "Threshold must be at most $10,000"),
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

// Outer shell is shared across idle / enabled / editing — uniform border in every
// state. The "On" Badge below is the sole signal that a rule is active; an enabled
// rule is not a warning, so no left-edge stripe or primary tint.
function RuleShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3">
      {children}
    </div>
  );
}

function RuleIcon() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary-surface text-muted-foreground">
      <Zap className="size-4" aria-hidden="true" />
    </div>
  );
}

interface AutoTopUpRuleProps {
  isExpanded: boolean;
  onRequestEdit: () => void;
  onCollapse: () => void;
}

export default function AutoTopUpRule({
  isExpanded,
  onRequestEdit,
  onCollapse,
}: AutoTopUpRuleProps) {
  const { state, setAutoTopUp } = useAccountState();
  const { enabled, thresholdUsd, amountUsd } = state.autoTopUp;
  const { brand, last4 } = state.paymentMethod;
  const hasPaymentMethod = brand !== null;

  if (isExpanded) {
    return (
      <AutoTopUpEditor
        wasOn={enabled}
        defaults={{ thresholdUsd, amountUsd }}
        hasPaymentMethod={hasPaymentMethod}
        paymentMethodLabel={hasPaymentMethod ? `${brand} ending ${last4}` : null}
        onSave={(values) => {
          setAutoTopUp({ enabled: true, ...values });
          toast.success(enabled ? "Auto top-up updated" : "Auto top-up enabled");
          onCollapse();
        }}
        onCancel={onCollapse}
      />
    );
  }

  if (enabled) {
    return (
      <RuleShell>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RuleIcon />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h4 className="typography-body font-medium text-foreground">
                  Auto top-up
                </h4>
                <Badge variant="success" showDot>
                  On
                </Badge>
              </div>
              <p className="typography-caption text-muted-foreground">
                When balance drops below{" "}
                <span className="font-mono text-foreground">
                  {formatUsd(thresholdUsd)}
                </span>
                , add{" "}
                <span className="font-mono text-foreground">
                  {formatUsd(amountUsd)}
                </span>
                .
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked
              aria-label="Disable auto top-up"
              onCheckedChange={() => {
                setAutoTopUp({ enabled: false, thresholdUsd, amountUsd });
                toast.success("Auto top-up disabled");
              }}
            />
            <Button variant="ghost" onClick={onRequestEdit}>
              Edit
            </Button>
          </div>
        </div>
      </RuleShell>
    );
  }

  return (
    <RuleShell>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RuleIcon />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h4 className="typography-body font-medium text-foreground">
                Auto top-up
              </h4>
              <Badge variant="neutral">Off</Badge>
            </div>
            <p className="typography-caption text-muted-foreground">
              Add credits when the balance drops below a threshold.
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={onRequestEdit}>
          Enable
        </Button>
      </div>
    </RuleShell>
  );
}

interface AutoTopUpEditorProps {
  defaults: Values;
  wasOn: boolean;
  hasPaymentMethod: boolean;
  paymentMethodLabel: string | null;
  onSave: (values: Values) => void;
  onCancel: () => void;
}

function AutoTopUpEditor({
  defaults,
  wasOn,
  hasPaymentMethod,
  paymentMethodLabel,
  onSave,
  onCancel,
}: AutoTopUpEditorProps) {
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

  const threshold = watch("thresholdUsd");
  const amount = watch("amountUsd");
  const previewThreshold = Number.isFinite(threshold) ? formatUsd(threshold) : "$—";
  const previewAmount = Number.isFinite(amount) ? formatUsd(amount) : "$—";

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    onSave(values);
  });

  const submitLabel = resolveSubmitLabel(isSubmitting, wasOn);

  return (
    <RuleShell>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <RuleIcon />
          <h4 className="typography-body font-medium text-foreground mt-1">
            Auto top-up
          </h4>
        </div>

        <div className="pl-11 flex flex-col gap-3">
          <FieldRow cols={2}>
            <Field
              label="Balance threshold"
              error={errors.thresholdUsd?.message}
              hint="USD"
            >
              <Input
                type="number"
                step="1"
                min="1"
                aria-invalid={errors.thresholdUsd ? true : undefined}
                {...register("thresholdUsd", { valueAsNumber: true })}
              />
            </Field>
            <Field
              label="Top-up amount"
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
          </FieldRow>

          <div className="flex flex-col gap-0.5">
            <p className="typography-caption text-muted-foreground">
              When balance drops below {previewThreshold}, {previewAmount} will
              be added automatically.
            </p>
            {paymentMethodLabel ? (
              <p className="typography-caption text-meta-foreground">
                Charged to {paymentMethodLabel}.
              </p>
            ) : null}
          </div>

          {!hasPaymentMethod ? (
            <InlineGate tier={1} verb="enable auto top-up" />
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
        </div>
      </form>
    </RuleShell>
  );
}
