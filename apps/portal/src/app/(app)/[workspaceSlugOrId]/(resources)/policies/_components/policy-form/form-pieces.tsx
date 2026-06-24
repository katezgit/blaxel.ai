"use client";

import { useId, type ReactNode } from "react";
import {
  Controller,
  useFieldArray,
  type UseFormReturn,
} from "react-hook-form";
import { AlertTriangle, Globe, MapPin, Plus, Server, X } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Chip, ChipGroup } from "@repo/ui/components/chip";
import { IconButton } from "@repo/ui/components/icon-button";
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

// Dirty check — chip state lives outside RHF, so isDirty needs help.
interface BodyDirtyInitial {
  locations: ReadonlyArray<LocationItem>;
  maxTokens: TokenLimits | null;
}

export function computeBodyDirty(
  type: PolicyType,
  currentLocations: ReadonlyArray<LocationItem>,
  currentTokenLimits: TokenLimits,
  initial: BodyDirtyInitial,
): boolean {
  if (type === "location") {
    if (currentLocations.length !== initial.locations.length) return true;
    return currentLocations.some(
      (loc, idx) =>
        loc.type !== initial.locations[idx]?.type ||
        loc.name !== initial.locations[idx]?.name,
    );
  }
  if (type === "maxToken") {
    if (initial.maxTokens === null) return true;
    return (
      currentTokenLimits.input !== initial.maxTokens.input ||
      currentTokenLimits.output !== initial.maxTokens.output ||
      currentTokenLimits.total !== initial.maxTokens.total ||
      currentTokenLimits.step !== initial.maxTokens.step ||
      currentTokenLimits.granularity !== initial.maxTokens.granularity
    );
  }
  return false;
}

interface FieldGroupProps {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}

export function FieldGroup({ label, hint, children }: FieldGroupProps) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="typography-label text-muted-foreground">
        {label}
      </span>
      {hint ? (
        <p className="typography-caption text-muted-foreground">{hint}</p>
      ) : null}
      <div role="group" aria-labelledby={labelId}>
        {children}
      </div>
    </div>
  );
}

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
        className="typography-body font-semibold text-foreground"
      >
        <span className="font-mono text-meta-foreground">{index}.</span> {title}
      </h2>
      {description ? (
        <p className="typography-caption text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}

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
      <span className="typography-label text-muted-foreground">
        Policy type
      </span>
      <Chip interactive={false} className="w-fit">
        <Icon aria-hidden="true" className="text-muted-foreground" />
        {option.label}
      </Chip>
      <p className="typography-caption text-meta-foreground">
        Policy type is fixed at creation. Create a new policy to change it.
      </p>
    </div>
  );
}

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

interface LocationBodyProps {
  value: ReadonlyArray<LocationItem>;
  onChange: (next: ReadonlyArray<LocationItem>) => void;
}

export function LocationBody({ value, onChange }: LocationBodyProps) {
  // Derive a stable string key for each location item so ChipGroup can track it.
  function locationKey(item: LocationItem) {
    return `${item.type}:${item.name}`;
  }

  const selectedKeys = value.map(locationKey);

  function handleGroupChange(next: ReadonlyArray<string>) {
    const nextItems = SAMPLE_LOCATIONS.filter((item) =>
      next.includes(locationKey(item)),
    );
    onChange(nextItems);
  }

  return (
    <div className="flex flex-col gap-3">
      <ChipGroup
        value={selectedKeys}
        onChange={handleGroupChange}
        color="info"
        variant="light"
        aria-label="Allowed locations"
      >
        {SAMPLE_LOCATIONS.map((item) => {
          const Icon =
            item.type === "continent"
              ? Globe
              : item.type === "country"
                ? MapPin
                : Server;
          const typeLabel =
            item.type === "continent"
              ? "Continent"
              : item.type === "country"
                ? "Country"
                : "Data center";
          return (
            <Chip key={locationKey(item)} value={locationKey(item)}>
              <Icon aria-hidden="true" className="text-muted-foreground" />
              <span className="sr-only">{typeLabel}: </span>
              {item.name}
            </Chip>
          );
        })}
      </ChipGroup>
      <p className="typography-caption text-muted-foreground">
        Locations union — workloads may run in any matching data center.
      </p>
    </div>
  );
}

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
          <ChipGroup
            value={field.value as ReadonlyArray<string>}
            onChange={(next) =>
              field.onChange(next as ReadonlyArray<PolicyResourceType>)
            }
            color="info"
            variant="light"
            aria-label="Allowed resource types"
          >
            {RESOURCE_TYPE_OPTIONS.map((option) => (
              <Chip key={option.value} value={option.value}>
                {option.label}
              </Chip>
            ))}
          </ChipGroup>
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

interface LabelsEditorProps {
  form: UseFormReturn<PolicyFormValues>;
}

export function LabelsEditor({ form }: LabelsEditorProps) {
  const { control, register, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "labels" });
  const rowErrors = formState.errors.labels;
  const arrayError =
    rowErrors && "root" in rowErrors ? rowErrors.root?.message : undefined;

  return (
    <div className="flex flex-col gap-2">
      {fields.length === 0 ? (
        <p className="typography-caption text-muted-foreground">
          No labels yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          <li
            aria-hidden="true"
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2"
          >
            <span className="typography-label font-medium text-foreground">
              Key
            </span>
            <span className="typography-label font-medium text-foreground">
              Value
            </span>
            <span />
          </li>
          {fields.map((field, index) => {
            const keyError = Array.isArray(rowErrors)
              ? rowErrors[index]?.key?.message
              : undefined;
            const valueError = Array.isArray(rowErrors)
              ? rowErrors[index]?.value?.message
              : undefined;
            return (
              <li key={field.id} className="flex flex-col gap-1">
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
                  <Input
                    aria-label={`Label key ${index + 1}`}
                    placeholder="env"
                    className="font-mono"
                    {...register(`labels.${index}.key` as const)}
                  />
                  <Input
                    aria-label={`Label value ${index + 1}`}
                    placeholder="prod"
                    className="font-mono"
                    {...register(`labels.${index}.value` as const)}
                  />
                  <IconButton
                    type="button"
                    variant="ghost"
                    aria-label={`Remove label ${index + 1}`}
                    onClick={() => remove(index)}
                  >
                    <X aria-hidden="true" />
                  </IconButton>
                </div>
                {(keyError || valueError) && (
                  <span
                    role="alert"
                    className="typography-caption font-medium text-state-errored-text"
                  >
                    {keyError ?? valueError}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {arrayError && (
        <span
          role="alert"
          className="typography-caption font-medium text-state-errored-text"
        >
          {arrayError}
        </span>
      )}
      <Button
        type="button"
        variant="ghost"
        className="self-start"
        onClick={() => append({ key: "", value: "" })}
      >
        <Plus aria-hidden="true" />
        Add label
      </Button>
    </div>
  );
}

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
      <div className="flex max-w-sm flex-col gap-1.5">
        <Field label="Display name" error={errors.displayName?.message}>
          <Input
            placeholder="EU-only production"
            aria-describedby={displayHelperId}
            {...register("displayName")}
          />
        </Field>
        <p id={displayHelperId} className="typography-caption text-muted-foreground">
          Shown in the dashboard.
        </p>
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <Field label="Name" error={errors.name?.message}>
          <Input
            placeholder="eu-only-prod"
            className="font-mono"
            aria-describedby={nameHelperId}
            {...register("name")}
          />
        </Field>
        <p id={nameHelperId} className="typography-caption text-muted-foreground">
          Used in <code className="typography-code">bl</code> commands and{" "}
          <code className="typography-code">spec.policies[]</code>.
          Auto-derived; editable.
        </p>
      </div>
      {slug ? (
        <p className="typography-caption text-meta-foreground">
          Slug preview:{" "}
          <code className="font-mono text-foreground">{slug}</code>
        </p>
      ) : null}
    </>
  );
}

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
      <div className="flex max-w-sm flex-col gap-1.5">
        <Field label="Display name" error={errors.displayName?.message}>
          <Input
            placeholder="EU-only production"
            aria-describedby={displayHelperId}
            {...register("displayName")}
          />
        </Field>
        <p id={displayHelperId} className="typography-caption text-muted-foreground">
          Shown in the dashboard.
        </p>
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <Field label="Name">
          <div
            role="textbox"
            aria-readonly="true"
            className={cn(
              "flex w-full items-center rounded-md border border-border bg-muted-surface px-3 py-2 font-mono typography-body text-foreground",
            )}
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
    </>
  );
}
