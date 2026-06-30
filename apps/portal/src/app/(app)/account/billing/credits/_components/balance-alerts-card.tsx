"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Bell } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import { Field, FieldRow } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

const schema = z.object({
  thresholdUsd: z
    .number({ message: "Threshold is required" })
    .min(1, "Threshold must be at least $1")
    .max(10000, "Threshold must be at most $10,000"),
});

type Values = z.infer<typeof schema>;

const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

function RuleShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3">
      {children}
    </div>
  );
}

function RuleIcon() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-hover-surface text-muted-foreground">
      <Bell className="size-4" aria-hidden="true" />
    </div>
  );
}

export default function BalanceAlertsCard() {
  const { state, setLowBalanceAlert } = useAccountState();
  const { enabled, thresholdUsd } = state.lowBalanceAlert;
  const [isEditing, setIsEditing] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="typography-subtitle font-semibold text-foreground">
          Balance alerts
        </h2>
        <p className="typography-body text-muted-foreground">
          Get an email when your credit balance drops below a threshold.
        </p>
      </div>
      <RuleShell>
        {isEditing ? (
          <EditingRow
            thresholdUsd={thresholdUsd}
            onCancel={() => setIsEditing(false)}
            onSaved={() => setIsEditing(false)}
            onSave={(next) => setLowBalanceAlert({ enabled: true, thresholdUsd: next })}
          />
        ) : enabled ? (
          <CollapsedOnRow
            thresholdUsd={thresholdUsd}
            onToggleOff={() => {
              setLowBalanceAlert({ enabled: false, thresholdUsd });
              setIsEditing(false);
              toast.success("Balance alerts disabled");
            }}
            onEdit={() => setIsEditing(true)}
          />
        ) : (
          <OffRow onEnable={() => setIsEditing(true)} />
        )}
      </RuleShell>
    </section>
  );
}

function OffRow({ onEnable }: { onEnable: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <RuleIcon />
        <div className="flex flex-col gap-1">
          <span className="typography-body font-semibold text-foreground">
            Balance alert
          </span>
          <span className="typography-caption text-muted-foreground">
            Add an email alert when your balance falls below a threshold.
          </span>
        </div>
      </div>
      <Button type="button" variant="secondary" onClick={onEnable}>
        Enable
      </Button>
    </div>
  );
}

function CollapsedOnRow({
  thresholdUsd,
  onToggleOff,
  onEdit,
}: {
  thresholdUsd: number;
  onToggleOff: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <RuleIcon />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="typography-body font-semibold text-foreground">
              Balance alert
            </span>
            <Badge variant="success" showDot>
              On
            </Badge>
          </div>
          <span className="typography-caption text-muted-foreground">
            Email me when balance falls below{" "}
            <span className="font-mono text-foreground">{formatUsd(thresholdUsd)}</span>.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={true}
          aria-label="Disable balance alerts"
          onCheckedChange={(checked) => {
            if (!checked) onToggleOff();
          }}
        />
        <Button type="button" variant="ghost" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>
  );
}

function EditingRow({
  thresholdUsd,
  onCancel,
  onSave,
  onSaved,
}: {
  thresholdUsd: number;
  onCancel: () => void;
  onSave: (next: number) => void;
  onSaved: () => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { thresholdUsd },
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = form;

  // Re-sync the editor with the persisted value when it changes from elsewhere
  // (e.g. tier toggle reseeds the account state).
  useEffect(() => {
    reset({ thresholdUsd });
  }, [reset, thresholdUsd]);

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    onSave(values.thresholdUsd);
    reset({ thresholdUsd: values.thresholdUsd });
    toast.success("Balance alert updated");
    onSaved();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <RuleIcon />
        <span className="typography-body font-semibold text-foreground">
          Balance alert
        </span>
      </div>
      {/* pl-11 (44px) = size-8 RuleIcon (32px) + gap-3 (12px); aligns the threshold field under the label. */}
      <div className="pl-11">
        <FieldRow cols={2}>
          <div className="flex flex-col gap-6">
            <Field
              label="Alert threshold"
              error={errors.thresholdUsd?.message}
            >
              <Input
                type="number"
                inputMode="decimal"
                step="1"
                min="1"
                aria-invalid={errors.thresholdUsd ? true : undefined}
                trailing={
                  <span aria-hidden="true" className="typography-meta">
                    USD
                  </span>
                }
                {...register("thresholdUsd", { valueAsNumber: true })}
              />
            </Field>
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
                disabled={isSubmitting || !isValid || !isDirty}
              >
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </FieldRow>
      </div>
    </form>
  );
}
