"use client";

import { useId } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { AlertTriangle, Globe, MapPin } from "lucide-react";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/cn";
import { Field, FieldRow } from "@/app/(manage)/_components/page-primitives";
import type {
  MaxTokenGranularity,
  PolicyResourceType,
  PolicyType,
} from "@/lib/mock/policies";
import {
  GRANULARITY_OPTIONS,
  POLICY_TYPE_BY_VALUE,
  POLICY_TYPE_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
  SAMPLE_LOCATIONS,
  type LocationItem,
  type PolicyFormValues,
  type PolicyTypeOption,
  type TokenLimits,
} from "./form-schema";

// ─── Numbered section heading ────────────────────────────────────────────────

interface StepHeadingProps {
  index: number;
  title: string;
  description?: string;
  headingId?: string;
}

export function StepHeading({
  index,
  title,
  description,
  headingId,
}: StepHeadingProps) {
  return (
    <header className="flex flex-col gap-1">
      <h2
        id={headingId}
        className="typography-subtitle font-semibold text-foreground"
      >
        <span className="font-mono text-meta-foreground">{index}.</span> {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}

// ─── Policy type — selectable (Create) ───────────────────────────────────────

interface PolicyTypeSelectFieldProps {
  form: UseFormReturn<PolicyFormValues>;
}

export function PolicyTypeSelectField({ form }: PolicyTypeSelectFieldProps) {
  const policyType = form.watch("policyType");
  const helper = POLICY_TYPE_BY_VALUE[policyType].hint;
  const helperId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <Field label="Policy type">
        <Controller
          control={form.control}
          name="policyType"
          render={({ field }) => {
            const current = POLICY_TYPE_BY_VALUE[field.value];
            const CurrentIcon = current.icon;
            return (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  aria-label="Policy type"
                  aria-describedby={helperId}
                  className="w-full"
                >
                  <SelectValue>
                    <span className="inline-flex items-center gap-2">
                      <CurrentIcon
                        aria-hidden="true"
                        className="size-4 text-muted-foreground"
                      />
                      <span className="typography-body text-foreground">
                        {current.label}
                      </span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {POLICY_TYPE_OPTIONS.map((option) => (
                    <PolicyTypeOptionRow key={option.value} option={option} />
                  ))}
                </SelectContent>
              </Select>
            );
          }}
        />
      </Field>
      <p id={helperId} className="text-muted-foreground">
        {helper}
      </p>
    </div>
  );
}

function PolicyTypeOptionRow({ option }: { option: PolicyTypeOption }) {
  const Icon = option.icon;
  return (
    <SelectItem
      value={option.value}
      textValue={option.label}
      disabled={option.disabled}
    >
      <span className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-2">
          <Icon
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0",
              option.disabled ? "text-text-disabled" : "text-muted-foreground",
            )}
          />
          <span
            className={cn(
              "typography-body",
              option.disabled ? "text-text-disabled" : "text-foreground",
            )}
          >
            {option.label}
          </span>
          {option.disabled ? (
            <span className="typography-meta text-meta-foreground">
              [coming soon]
            </span>
          ) : null}
        </span>
        <span
          className={cn(
            "typography-meta pl-6",
            option.disabled ? "text-text-disabled" : "text-muted-foreground",
          )}
        >
          {option.hint}
        </span>
      </span>
    </SelectItem>
  );
}

// ─── Policy type — read-only display (Edit) ──────────────────────────────────

interface PolicyTypeReadOnlyFieldProps {
  policyType: PolicyType;
}

export function PolicyTypeReadOnlyField({
  policyType,
}: PolicyTypeReadOnlyFieldProps) {
  const option = POLICY_TYPE_BY_VALUE[policyType];
  const Icon = option.icon;
  return (
    <div className="flex flex-col gap-1.5">
      <Field label="Policy type">
        <div
          className={cn(
            "flex w-full items-center gap-2 rounded-md border border-border bg-muted-surface px-3 py-2",
          )}
          aria-readonly="true"
        >
          <Icon
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          <span className="typography-body text-foreground">
            {option.label}
          </span>
        </div>
      </Field>
      <p className="typography-caption text-meta-foreground">
        Policy type is fixed at creation. Create a new policy to change it.
      </p>
    </div>
  );
}

// ─── Flavor deep-link / unavailable notice ───────────────────────────────────

export function FlavorUnavailableNotice() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-state-warning/40 bg-state-warning-subtle px-4 py-3">
      <AlertTriangle
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-state-warning-text"
      />
      <p className="typography-body text-foreground">
        Flavor policies are authorable via{" "}
        <code className="font-mono">bl apply -f</code> only — the dashboard form
        does not yet support them.
      </p>
    </div>
  );
}

// ─── Body editor — location chips ────────────────────────────────────────────

interface LocationBodyProps {
  value: ReadonlyArray<LocationItem>;
  onChange: (next: ReadonlyArray<LocationItem>) => void;
}

export function LocationBody({ value, onChange }: LocationBodyProps) {
  function toggle(item: LocationItem) {
    const exists = value.some(
      (s) => s.type === item.type && s.name === item.name,
    );
    onChange(
      exists
        ? value.filter((s) => !(s.type === item.type && s.name === item.name))
        : [...value, item],
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {SAMPLE_LOCATIONS.map((item) => {
          const checked = value.some(
            (s) => s.type === item.type && s.name === item.name,
          );
          const Icon = item.type === "continent" ? Globe : MapPin;
          const typeLabel = item.type === "continent" ? "Continent" : "Country";
          return (
            <button
              type="button"
              key={`${item.type}:${item.name}`}
              onClick={() => toggle(item)}
              aria-pressed={checked}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 typography-caption transition-colors duration-fast ease-out-standard",
                checked
                  ? "border-border-strong bg-muted-surface text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              <Icon
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground"
              />
              <span className="sr-only">{typeLabel}: </span>
              {item.name}
            </button>
          );
        })}
      </div>
      <p className="typography-caption text-muted-foreground">
        Continents and countries union — workloads may run in any selected
        region.
      </p>
    </div>
  );
}

// ─── Body editor — token-usage caps + period ─────────────────────────────────

interface TokenUsageBodyProps {
  value: TokenLimits;
  onChange: (next: TokenLimits) => void;
}

export function TokenUsageBody({ value, onChange }: TokenUsageBodyProps) {
  function update<K extends keyof TokenLimits>(key: K, next: TokenLimits[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldRow cols={3}>
        <TokenCapField
          label="Input"
          value={value.input}
          onChange={(v) => update("input", v)}
        />
        <TokenCapField
          label="Output"
          value={value.output}
          onChange={(v) => update("output", v)}
        />
        <TokenCapField
          label="Total"
          value={value.total}
          onChange={(v) => update("total", v)}
        />
      </FieldRow>
      <div className="flex flex-col gap-1.5">
        <span className="typography-label text-muted-foreground">
          Per period
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr]">
          <Input
            type="number"
            min={1}
            value={value.step}
            onChange={(event) =>
              update("step", Number(event.target.value) || 1)
            }
            className="font-mono tabular-nums"
            aria-label="Period length"
          />
          <Select
            value={value.granularity}
            onValueChange={(next) =>
              update("granularity", next as MaxTokenGranularity)
            }
          >
            <SelectTrigger aria-label="Period unit" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRANULARITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="typography-caption text-meta-foreground">
          Leave any cap blank for Unlimited.
        </span>
      </div>
    </div>
  );
}

function TokenCapField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  // 0 in the model means "unlimited"; surface as empty so the placeholder shows.
  const display = value === 0 ? "" : String(value);
  return (
    <Field label={label}>
      <Input
        type="number"
        min={0}
        inputMode="numeric"
        value={display}
        placeholder="Unlimited"
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? 0 : Number(raw) || 0);
        }}
        className="font-mono tabular-nums"
      />
    </Field>
  );
}

// ─── Resource type field ─────────────────────────────────────────────────────

interface ResourceTypesFieldProps {
  form: UseFormReturn<PolicyFormValues>;
}

export function ResourceTypesField({ form }: ResourceTypesFieldProps) {
  return (
    <Controller
      control={form.control}
      name="resourceTypes"
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {RESOURCE_TYPE_OPTIONS.map((option) => {
              const checked = field.value.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => {
                    const nextValues: ReadonlyArray<PolicyResourceType> =
                      checked
                        ? field.value.filter((v) => v !== option.value)
                        : [...field.value, option.value];
                    field.onChange(nextValues);
                  }}
                  aria-pressed={checked}
                  className={cn(
                    "inline-flex items-center rounded-md border px-2.5 py-1 typography-caption transition-colors duration-fast ease-out-standard",
                    checked
                      ? "border-border-strong bg-muted-surface text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {fieldState.error ? (
            <span
              role="alert"
              className="typography-caption font-medium text-state-errored-text"
            >
              {fieldState.error.message}
            </span>
          ) : null}
        </div>
      )}
    />
  );
}

// ─── Identity — editable (Create) ────────────────────────────────────────────

interface IdentityEditableFieldsProps {
  form: UseFormReturn<PolicyFormValues>;
}

export function IdentityEditableFields({ form }: IdentityEditableFieldsProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const slug = watch("name");
  const displayHelperId = useId();
  const nameHelperId = useId();

  return (
    <>
      <FieldRow cols={1}>
        <div className="flex flex-col gap-1.5">
          <Field label="Display name" error={errors.displayName?.message}>
            <Input
              placeholder="EU-only production"
              aria-describedby={displayHelperId}
              {...register("displayName")}
            />
          </Field>
          <p id={displayHelperId} className="text-muted-foreground">
            Shown in the dashboard.
          </p>
        </div>
      </FieldRow>
      <FieldRow cols={1}>
        <div className="flex flex-col gap-1.5">
          <Field label="Name" error={errors.name?.message}>
            <Input
              placeholder="eu-only-prod"
              className="font-mono"
              aria-describedby={nameHelperId}
              {...register("name")}
            />
          </Field>
          <p id={nameHelperId} className="text-muted-foreground">
            Used in <code className="typography-code">bl</code> commands and{" "}
            <code className="typography-code">spec.policies[]</code>.
            Auto-derived; editable.
          </p>
        </div>
      </FieldRow>
      {slug ? (
        <p className="typography-caption text-meta-foreground">
          Slug preview:{" "}
          <code className="font-mono text-foreground">{slug}</code>
        </p>
      ) : null}
    </>
  );
}

// ─── Identity — partial read-only (Edit: displayName editable, name fixed) ──

interface IdentityEditableNameOnlyFieldsProps {
  form: UseFormReturn<PolicyFormValues>;
  fixedName: string;
}

export function IdentityEditableNameOnlyFields({
  form,
  fixedName,
}: IdentityEditableNameOnlyFieldsProps) {
  const {
    register,
    formState: { errors },
  } = form;
  const displayHelperId = useId();

  return (
    <>
      <FieldRow cols={1}>
        <div className="flex flex-col gap-1.5">
          <Field label="Display name" error={errors.displayName?.message}>
            <Input
              placeholder="EU-only production"
              aria-describedby={displayHelperId}
              {...register("displayName")}
            />
          </Field>
          <p id={displayHelperId} className="text-muted-foreground">
            Shown in the dashboard.
          </p>
        </div>
      </FieldRow>
      <FieldRow cols={1}>
        <div className="flex flex-col gap-1.5">
          <Field label="Name">
            <div
              className={cn(
                "flex w-full items-center rounded-md border border-border bg-muted-surface px-3 py-2 font-mono typography-body text-foreground",
              )}
              aria-readonly="true"
            >
              {fixedName}
            </div>
          </Field>
          <p className="typography-caption text-meta-foreground">
            Resource identifier — fixed at creation, referenced in{" "}
            <code className="typography-code">bl</code> commands and{" "}
            <code className="typography-code">spec.policies[]</code>.
          </p>
        </div>
      </FieldRow>
    </>
  );
}
