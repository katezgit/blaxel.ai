"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { z } from "zod";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { CodeBlock } from "@repo/ui/components/code-block";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import { Field, FieldRow } from "@/app/(manage)/_components/page-primitives";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { policyQueries } from "@/lib/query/policies";
import type {
  MaxTokenGranularity,
  Policy,
  PolicyResourceType,
  PolicyType,
} from "@/lib/mock/policies";

const POLICY_TYPE_OPTIONS: ReadonlyArray<{
  value: PolicyType;
  label: string;
  hint: string;
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
  },
];

const POLICY_TYPE_TRIGGER_LABEL: Record<PolicyType, string> = {
  location: "Location",
  maxToken: "Token usage",
  flavor: "Flavor [coming soon]",
};

const POLICY_TYPE_HELPER: Record<PolicyType, string> = {
  location: "Continent or country allow-list.",
  maxToken: "Per-period token cap.",
  flavor: "CPU type allow-list. Coming soon in the dashboard.",
};

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

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

function readPolicyTypeParam(value: string | null): PolicyType | null {
  if (value === "location" || value === "maxToken" || value === "flavor") {
    return value;
  }
  // Permissive lowercase aliases — survives external links from CLI / docs.
  if (value === "tokenusage" || value === "tokenUsage") return "maxToken";
  return null;
}

interface CreatePolicyViewProps {
  workspaceSlug: string;
}

export function CreatePolicyView({ workspaceSlug }: CreatePolicyViewProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const searchParams = useSearchParams();
  const typeParam = readPolicyTypeParam(searchParams.get("type"));
  const duplicateName = searchParams.get("duplicate");

  // Duplicate-source fetched from the same cache the list page prefetches.
  // Detail cache may also be warm if user came from a detail page.
  const duplicateQuery = useQuery({
    ...policyQueries.detail(accountId, workspaceId, duplicateName ?? ""),
    enabled: duplicateName != null,
  });

  const listHref = `/${workspaceSlug}/policies`;

  if (duplicateName != null && duplicateQuery.isPending) {
    return (
      <div className="page-shell">
        <Header listHref={listHref} />
        <p className="typography-body text-muted-foreground">
          Loading source policy…
        </p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Header listHref={listHref} />
      <CreatePolicyForm
        workspaceSlug={workspaceSlug}
        listHref={listHref}
        initialType={typeParam}
        duplicateFrom={duplicateQuery.data ?? null}
      />
    </div>
  );
}

function Header({ listHref }: { listHref: string }) {
  return (
    <header className="flex flex-col gap-3">
      <Breadcrumb
        parent={{ href: listHref, label: "Policies" }}
        current="Create policy"
      />
      <div className="page-header">
        <div className="flex items-center gap-2">
          <h1 className="typography-display font-semibold text-foreground">
            Create policy
          </h1>
          <Badge variant="neutral" size="sm">
            Tier 1
          </Badge>
        </div>
        <p className="typography-body text-muted-foreground">
          Define the policy type and the workload kinds it can be attached to.
        </p>
      </div>
    </header>
  );
}

interface CreatePolicyFormProps {
  workspaceSlug: string;
  listHref: string;
  initialType: PolicyType | null;
  duplicateFrom: Policy | null;
}

function CreatePolicyForm({
  workspaceSlug,
  listHref,
  initialType,
  duplicateFrom,
}: CreatePolicyFormProps) {
  void workspaceSlug;
  const router = useRouter();

  const defaultValues = useMemo<FormValues>(() => {
    if (duplicateFrom) {
      return {
        // `name` deliberately cleared — duplicate must be renamed before save.
        displayName: `${duplicateFrom.metadata.displayName} copy`,
        name: "",
        resourceTypes: [...duplicateFrom.spec.resourceTypes],
        policyType: duplicateFrom.spec.type,
      };
    }
    return {
      displayName: "",
      name: "",
      resourceTypes: ["agent"],
      policyType: initialType ?? "location",
    };
  }, [duplicateFrom, initialType]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  // Auto-suggest slug from displayName while the user has not deviated.
  // Compare against the prior step's suggestion — if they match, advance it.
  // Skip the initial render: defaults must not trigger autofill (a duplicate
  // prefill carries a displayName but its `name` is deliberately cleared so
  // the user must rename — autofilling here would defeat that).
  const displayName = form.watch("displayName");
  const slug = form.watch("name");
  const initialDisplayName = useRef(displayName);
  useEffect(() => {
    if (displayName === initialDisplayName.current) return;
    if (displayName === "") return;
    const suggested = slugify(displayName);
    if (slug === "" || slug === slugify(displayName.slice(0, -1))) {
      form.setValue("name", suggested, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayName]);

  const policyType = form.watch("policyType");
  const resourceTypes = form.watch("resourceTypes");
  const cleanName = form.watch("name") || "my-policy";
  const cleanDisplayName = form.watch("displayName") || cleanName;

  const onSubmit = form.handleSubmit(async () => {
    // Mocked write — simulate API round-trip then navigate to the list.
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success("Policy created");
    router.push(listHref);
  });

  function onCancel() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(listHref);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]"
    >
      <div className="flex flex-col gap-8">
        <TypeAndTargetsSection form={form} />
        <BodySectionFor policyType={policyType} />
        <div className="flex items-center justify-end gap-2 border-t border-border pt-6">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={form.formState.isSubmitting}
          >
            Create policy
          </Button>
        </div>
      </div>
      <YamlManifestPanel
        policyType={policyType}
        name={cleanName}
        displayName={cleanDisplayName}
        resourceTypes={resourceTypes}
      />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Form sections — composition, not configuration. Each policy type renders its
// own sibling body component; the parent picks one based on form state.
// ─────────────────────────────────────────────────────────────────────────────

function TypeAndTargetsSection({
  form,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
}) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;
  const policyType = watch("policyType");

  return (
    <section className="flex flex-col gap-6">
      <h2 className="typography-subtitle font-semibold text-foreground">
        Type and targets
      </h2>

      <Field label="Policy type" hint={POLICY_TYPE_HELPER[policyType]}>
        <Controller
          control={control}
          name="policyType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-label="Policy type" className="w-full">
                {/* Children on SelectValue override the portaled ItemText, so
                 * the trigger shows the label alone — the hint sits below as
                 * a Field helper-text slot. */}
                <SelectValue>
                  {POLICY_TYPE_TRIGGER_LABEL[field.value]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {POLICY_TYPE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    textValue={option.label}
                  >
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
    </section>
  );
}

function BodySectionFor({ policyType }: { policyType: PolicyType }) {
  if (policyType === "location") return <LocationBody />;
  if (policyType === "maxToken") return <MaxTokenBody />;
  return <FlavorBody />;
}

// ── Location body ────────────────────────────────────────────────────────────

const SAMPLE_LOCATIONS = [
  { type: "continent" as const, name: "North America" },
  { type: "continent" as const, name: "Europe" },
  { type: "continent" as const, name: "Asia Pacific" },
  { type: "country" as const, name: "United States" },
  { type: "country" as const, name: "Germany" },
  { type: "country" as const, name: "France" },
  { type: "country" as const, name: "Japan" },
];

function LocationBody() {
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
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="typography-subtitle font-semibold text-foreground">
          Allowed locations
        </h2>
        <p className="typography-body text-muted-foreground">
          Workloads are deployed only to matching data centers. Mixed
          granularity allowed in one policy.
        </p>
      </header>
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
    </section>
  );
}

// ── Token-usage body ─────────────────────────────────────────────────────────

const GRANULARITY_OPTIONS: ReadonlyArray<{
  value: MaxTokenGranularity;
  label: string;
}> = [
  { value: "month", label: "Month" },
  { value: "day", label: "Day" },
  { value: "hour", label: "Hour" },
  { value: "minute", label: "Minute" },
];

function MaxTokenBody() {
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
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="typography-subtitle font-semibold text-foreground">
          Token thresholds
        </h2>
        <p className="typography-body text-muted-foreground">
          A threshold of 0 means &ldquo;not evaluated&rdquo; — the policy does
          not enforce that dimension.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <h3 className="typography-label font-medium text-foreground">Window</h3>
        <FieldRow cols={2}>
          <Field label="Granularity">
            <Select
              value={granularity}
              onValueChange={(value) =>
                setGranularity(value as MaxTokenGranularity)
              }
            >
              <SelectTrigger aria-label="Granularity" className="w-full">
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
          Thresholds
        </h3>
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
    </section>
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

// ── Flavor body ──────────────────────────────────────────────────────────────

function FlavorBody() {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="typography-subtitle font-semibold text-foreground">
          Allowed hardware flavors
        </h2>
        <p className="typography-body text-muted-foreground">
          Workloads are deployed only on matching hardware.
        </p>
      </header>
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
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// YAML manifest panel — right column, sticky on scroll. Reflects the form
// state above; the panel is the load-bearing artifact for the Sam audit path.
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
    <aside
      aria-labelledby="create-policy-yaml-heading"
      className="flex flex-col gap-3 lg:sticky lg:top-8 lg:h-fit"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="create-policy-yaml-heading"
          className="font-mono typography-meta uppercase tracking-wider text-meta-foreground"
        >
          YAML manifest
        </h2>
        <p className="typography-caption text-muted-foreground">
          Reflects the form. Save to a file and apply with{" "}
          <code className="font-mono">bl apply -f</code>.
        </p>
      </div>
      <CodeBlock variant="block" language="yaml" code={manifest} />
      <p className="typography-caption text-muted-foreground">
        <Link
          href="https://docs.blaxel.ai/Model-Governance/Policies"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          Policies docs
        </Link>
      </p>
    </aside>
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
