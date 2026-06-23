"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { CodeBlock } from "@repo/ui/components/code-block";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@repo/ui/components/drawer";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Field, FieldRow } from "@/app/(manage)/_components/page-primitives";
import type {
  MaxTokenGranularity,
  PolicyResourceType,
  PolicyType,
} from "@/lib/mock/policies";
import { policyTypeLabel } from "@/lib/mock/policies";

const POLICY_TYPE_OPTIONS: ReadonlyArray<{
  value: PolicyType;
  label: string;
  hint: string;
  disabled?: boolean;
}> = [
  {
    value: "location",
    label: "Location",
    hint: "Continent or country allow-list.",
  },
  {
    value: "maxToken",
    label: "Token usage",
    hint: "Per-period token cap.",
  },
  {
    value: "flavor",
    label: "Flavor",
    hint: "CPU type allow-list. Coming soon in the dashboard.",
    disabled: false,
  },
];

const RESOURCE_TYPE_OPTIONS: ReadonlyArray<{
  value: PolicyResourceType;
  label: string;
}> = [
  { value: "agent", label: "Agents" },
  { value: "model", label: "Model APIs" },
  { value: "function", label: "MCP Servers" },
  { value: "sandbox", label: "Sandboxes" },
  { value: "application", label: "Applications" },
];

const baseSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required.")
    .max(64, "Max 64 characters."),
  name: z
    .string()
    .trim()
    .min(1, "Policy name is required.")
    .max(64, "Max 64 characters.")
    .regex(
      /^[a-z0-9-]+$/,
      "Lowercase letters, digits, and hyphens only.",
    ),
  resourceTypes: z
    .array(z.enum(["agent", "model", "function", "sandbox", "application"]))
    .min(1, "Select at least one target."),
  policyType: z.enum(["location", "maxToken", "flavor"]),
});

type Step1Values = z.infer<typeof baseSchema>;

interface CreatePolicyDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePolicyDrawer({ open, onClose }: CreatePolicyDrawerProps) {
  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DrawerContent size="lg" aria-describedby={undefined}>
        <CreatePolicyForm key={String(open)} onClose={onClose} />
      </DrawerContent>
    </Drawer>
  );
}

type Step = 1 | 2;

function CreatePolicyForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const form = useForm<Step1Values>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      displayName: "",
      name: "",
      resourceTypes: ["agent"],
      policyType: "location",
    },
    mode: "onChange",
  });

  // Auto-suggest a slug from the display name only while the user has not
  // typed into the slug field directly. A boolean ref-style flag is overkill;
  // we just compare against the suggested slug and overwrite if it matches.
  const displayName = form.watch("displayName");
  const slug = form.watch("name");
  useEffect(() => {
    const suggested = slugify(displayName);
    if (slug === "" || slug === slugify(displayName.slice(0, -1))) {
      form.setValue("name", suggested, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayName]);

  const policyType = form.watch("policyType");
  const resourceTypes = form.watch("resourceTypes");
  const cleanName = form.watch("name") || "my-policy";

  const onSubmit = form.handleSubmit(async () => {
    // Mocked write — the drawer simulates the API roundtrip and closes.
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success("Policy created");
    onClose();
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex h-full flex-col"
    >
      <DrawerHeader>
        <DrawerTitle>Create Policy</DrawerTitle>
        <DrawerDescription>
          {step === 1
            ? "Define the policy type and the workload kinds it can be attached to."
            : `Configure the ${policyTypeLabel(policyType).toLowerCase()} clause.`}
        </DrawerDescription>
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-6">
        {step === 1 && <Step1Fields form={form} />}
        {step === 2 && <ClauseStepFor policyType={policyType} />}

        <YamlManifestPanel
          policyType={policyType}
          name={cleanName}
          displayName={form.watch("displayName") || cleanName}
          resourceTypes={resourceTypes}
        />
      </DrawerBody>

      <DrawerFooter className="justify-between">
        {step === 1 ? (
          <>
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              disabled={!form.formState.isValid}
              onClick={(event) => {
                event.preventDefault();
                setStep(2);
              }}
            >
              Continue
              <ArrowRight aria-hidden="true" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setStep(1)}
            >
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              Create Policy
            </Button>
          </>
        )}
      </DrawerFooter>
    </form>
  );
}

// Clause-step router — composition, not configuration. Picks one of three
// sibling components based on the selected policy type and renders it. The
// children each own their own state/copy/layout.
function ClauseStepFor({ policyType }: { policyType: PolicyType }) {
  if (policyType === "location") return <LocationClauseStep />;
  if (policyType === "maxToken") return <MaxTokenClauseStep />;
  return <FlavorClauseStep />;
}

function Step1Fields({
  form,
}: {
  form: ReturnType<typeof useForm<Step1Values>>;
}) {
  const {
    register,
    control,
    formState: { errors },
  } = form;
  return (
    <div className="flex flex-col gap-6">
      <Field label="Policy type" error={errors.policyType?.message}>
        <Controller
          control={control}
          name="policyType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-label="Policy type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POLICY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col gap-0.5">
                      <span>
                        {option.label}
                        {option.value === "flavor" && (
                          <span className="ml-2 typography-meta text-muted-foreground">
                            [coming soon]
                          </span>
                        )}
                      </span>
                      <span className="typography-meta text-muted-foreground">
                        {option.hint}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <FieldRow cols={1}>
        <Field
          label="Display name"
          hint="Human label. Shown in the dashboard."
          error={errors.displayName?.message}
        >
          <Input
            placeholder="EU-only production"
            aria-invalid={errors.displayName ? true : undefined}
            {...register("displayName")}
          />
        </Field>
      </FieldRow>

      <FieldRow cols={1}>
        <Field
          label="Policy name"
          hint="Canonical id used in bl commands and spec.policies[]. Lowercase, hyphens only."
          error={errors.name?.message}
        >
          <Input
            placeholder="eu-only-prod"
            aria-invalid={errors.name ? true : undefined}
            className="font-mono"
            {...register("name")}
          />
        </Field>
      </FieldRow>

      <Field
        label="Target workload types"
        error={errors.resourceTypes?.message}
      >
        <Controller
          control={control}
          name="resourceTypes"
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {RESOURCE_TYPE_OPTIONS.map((option) => {
                const checked = field.value.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 hover:border-border-strong"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) => {
                        if (next === true) {
                          field.onChange([...field.value, option.value]);
                        } else {
                          field.onChange(
                            field.value.filter((v) => v !== option.value),
                          );
                        }
                      }}
                    />
                    <span className="typography-body text-foreground">
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        />
      </Field>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 sub-components — split per spec.type rather than configured via prop.
// Composition discipline: each clause is a separate component with its own
// state and chrome; the parent decides which to render.
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_LOCATIONS = [
  { type: "continent" as const, name: "North America" },
  { type: "continent" as const, name: "Europe" },
  { type: "continent" as const, name: "Asia Pacific" },
  { type: "country" as const, name: "United States" },
  { type: "country" as const, name: "Germany" },
  { type: "country" as const, name: "France" },
  { type: "country" as const, name: "Japan" },
];

function LocationClauseStep() {
  const [selected, setSelected] = useState<
    ReadonlyArray<{ type: "continent" | "country"; name: string }>
  >([
    { type: "continent", name: "North America" },
    { type: "country", name: "United States" },
  ]);

  function toggle(item: { type: "continent" | "country"; name: string }) {
    setSelected((prev) => {
      const exists = prev.some(
        (s) => s.type === item.type && s.name === item.name,
      );
      return exists
        ? prev.filter((s) => !(s.type === item.type && s.name === item.name))
        : [...prev, item];
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="typography-label font-medium text-foreground">
        Allowed locations
      </h3>
      <p className="typography-caption text-muted-foreground">
        Workloads are deployed only to matching data centers. Mixed granularity
        allowed in one policy.
      </p>
      <div className="flex flex-wrap gap-2">
        {SAMPLE_LOCATIONS.map((item) => {
          const checked = selected.some(
            (s) => s.type === item.type && s.name === item.name,
          );
          return (
            <button
              type="button"
              key={`${item.type}:${item.name}`}
              onClick={() => toggle(item)}
              aria-pressed={checked}
              className={
                checked
                  ? "rounded-md border border-primary bg-primary-soft px-3 py-1.5 typography-meta text-foreground"
                  : "rounded-md border border-border bg-background px-3 py-1.5 typography-meta text-muted-foreground hover:border-border-strong"
              }
            >
              <span className="font-medium">
                {item.type === "continent" ? "Continent" : "Country"}:
              </span>{" "}
              {item.name}
            </button>
          );
        })}
      </div>
      <p className="typography-caption text-muted-foreground">
        Combination note: adding both a continent and a country from the same
        region creates a UNION (OR) — the workload can run in either. The
        INTERSECTION (AND) applies only across policy types.
      </p>
    </div>
  );
}

const GRANULARITY_OPTIONS: ReadonlyArray<{
  value: MaxTokenGranularity;
  label: string;
}> = [
  { value: "month", label: "Month" },
  { value: "day", label: "Day" },
  { value: "hour", label: "Hour" },
  { value: "minute", label: "Minute" },
];

function MaxTokenClauseStep() {
  const [granularity, setGranularity] = useState<MaxTokenGranularity>("month");
  const [step, setStep] = useState(1);
  const [thresholds, setThresholds] = useState({
    input: 1_000_000,
    output: 0,
    total: 2_000_000,
    ratio: 0,
  });

  function updateThreshold(key: keyof typeof thresholds, value: number) {
    setThresholds((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="typography-label font-medium text-foreground">
          Window
        </h3>
        <FieldRow cols={2}>
          <Field label="Granularity">
            <Select
              value={granularity}
              onValueChange={(value) =>
                setGranularity(value as MaxTokenGranularity)
              }
            >
              <SelectTrigger aria-label="Granularity">
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
          </Field>
          <Field label="Step" hint="Number of granularity units per window.">
            <Input
              type="number"
              min={1}
              value={step}
              onChange={(e) => setStep(Number(e.target.value) || 1)}
            />
          </Field>
        </FieldRow>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="typography-label font-medium text-foreground">
          Token thresholds
        </h3>
        <p className="typography-caption text-muted-foreground">
          A threshold of 0 means &ldquo;not evaluated&rdquo; — the policy does
          not enforce that dimension.
        </p>
        <ThresholdField
          label="Input tokens per window"
          field="spec.maxTokens.input"
          value={thresholds.input}
          onChange={(v) => updateThreshold("input", v)}
        />
        <ThresholdField
          label="Output tokens per window"
          field="spec.maxTokens.output"
          value={thresholds.output}
          onChange={(v) => updateThreshold("output", v)}
        />
        <ThresholdField
          label="Total tokens per window"
          field="spec.maxTokens.total"
          value={thresholds.total}
          onChange={(v) => updateThreshold("total", v)}
        />
        <ThresholdField
          label="Input / output ratio cap"
          field="spec.maxTokens.ratioInputOverOutput"
          value={thresholds.ratio}
          onChange={(v) => updateThreshold("ratio", v)}
        />
      </div>
    </div>
  );
}

function ThresholdField({
  label,
  field,
  value,
  onChange,
}: {
  label: string;
  field: string;
  value: number;
  onChange: (next: number) => void;
}) {
  const notEvaluated = value === 0;
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[1fr_180px]">
      <div className="flex flex-col gap-0.5">
        <span className="typography-label text-foreground">{label}</span>
        <span className="font-mono typography-meta text-meta-foreground">
          {field}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <Input
          type="number"
          min={0}
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className="font-mono tabular-nums"
        />
        {notEvaluated && (
          <span className="typography-meta text-muted-foreground">
            Not evaluated
          </span>
        )}
      </div>
    </div>
  );
}

function FlavorClauseStep() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="typography-label font-medium text-foreground">
          Allowed hardware flavors
        </h3>
        <p className="typography-caption text-muted-foreground">
          Workloads are deployed only on matching hardware.
        </p>
      </div>
      <div className="flex flex-col gap-2 rounded-md border border-state-warning/40 bg-state-warning-subtle px-4 py-3">
        <div className="flex items-start gap-2">
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-4 text-state-warning-text"
          />
          <div className="flex flex-col gap-1">
            <p className="typography-label font-medium text-foreground">
              Flavor policies are not yet available in the dashboard.
            </p>
            <p className="typography-caption text-muted-foreground">
              You can author and apply them via{" "}
              <code className="font-mono">bl apply -f policy.yaml</code> or the
              REST API. Dashboard UI coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// YAML manifest peer panel — always visible alongside the form, mirroring
// production's "OR — apply a YAML manifest" peer path.
// ─────────────────────────────────────────────────────────────────────────────

interface YamlManifestPanelProps {
  policyType: PolicyType;
  name: string;
  displayName: string;
  resourceTypes: ReadonlyArray<PolicyResourceType>;
}

function YamlManifestPanel({
  policyType,
  name,
  displayName,
  resourceTypes,
}: YamlManifestPanelProps) {
  const manifest = buildManifest({ policyType, name, displayName, resourceTypes });
  return (
    <section
      aria-labelledby="create-policy-yaml-heading"
      className="flex flex-col gap-3 border-t border-border pt-6"
    >
      <div className="flex flex-col gap-1">
        <h3
          id="create-policy-yaml-heading"
          className="font-mono typography-meta uppercase tracking-wider text-meta-foreground"
        >
          Or apply a YAML manifest
        </h3>
        <p className="typography-caption text-muted-foreground">
          Reflects the form above. Save to a file and apply with{" "}
          <code className="font-mono">bl apply -f</code>.
        </p>
      </div>
      <CodeBlock variant="block" language="yaml" code={manifest} />
    </section>
  );
}

function buildManifest({
  policyType,
  name,
  displayName,
  resourceTypes,
}: YamlManifestPanelProps): string {
  const lines: string[] = [
    "apiVersion: blaxel.ai/v1alpha1",
    "kind: Policy",
    "metadata:",
    `  name: ${name}`,
    `  displayName: ${displayName}`,
    "spec:",
    `  type: ${policyType}`,
    "  resourceTypes:",
    ...resourceTypes.map((kind) => `    - ${kind}`),
  ];
  if (policyType === "location") {
    lines.push(
      "  locations:",
      "    - type: continent",
      "      name: North America",
      "    - type: country",
      "      name: United States",
    );
  } else if (policyType === "maxToken") {
    lines.push(
      "  maxTokens:",
      "    granularity: month",
      "    step: 1",
      "    input: 1000000",
      "    output: 0",
      "    total: 2000000",
      "    ratioInputOverOutput: 0",
    );
  } else if (policyType === "flavor") {
    lines.push("  flavors:", "    - name: t4", "      type: cpu");
  }
  return lines.join("\n");
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
