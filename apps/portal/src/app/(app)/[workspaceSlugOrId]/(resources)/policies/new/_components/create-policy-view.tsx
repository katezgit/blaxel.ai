"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AlertTriangle, Cpu, GaugeCircle, MapPin } from "lucide-react";
import { z } from "zod";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { CodeBlock } from "@repo/ui/components/code-block";
import { Input } from "@repo/ui/components/input";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/cn";
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

// ─── Policy type catalog ─────────────────────────────────────────────────────

interface PolicyTypeOption {
  value: PolicyType;
  label: string;
  hint: string;
  icon: typeof MapPin;
  disabled?: boolean;
}

const POLICY_TYPE_OPTIONS: ReadonlyArray<PolicyTypeOption> = [
  {
    value: "location",
    label: "Location",
    hint: "Continent or country allow-list.",
    icon: MapPin,
  },
  {
    value: "maxToken",
    label: "Token usage",
    hint: "Per-period token cap.",
    icon: GaugeCircle,
  },
  {
    value: "flavor",
    label: "Flavor",
    hint: "CPU type allow-list.",
    icon: Cpu,
    disabled: true,
  },
];

const POLICY_TYPE_BY_VALUE: Record<PolicyType, PolicyTypeOption> =
  POLICY_TYPE_OPTIONS.reduce(
    (acc, option) => {
      acc[option.value] = option;
      return acc;
    },
    {} as Record<PolicyType, PolicyTypeOption>,
  );

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

// ─── Form schema ─────────────────────────────────────────────────────────────

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
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, digits, and hyphens only."),
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
  if (value === "tokenusage" || value === "tokenUsage") return "maxToken";
  return null;
}

// ─── View ────────────────────────────────────────────────────────────────────

interface CreatePolicyViewProps {
  workspaceSlug: string;
}

export function CreatePolicyView({ workspaceSlug }: CreatePolicyViewProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const searchParams = useSearchParams();
  const typeParam = readPolicyTypeParam(searchParams.get("type"));
  const duplicateName = searchParams.get("duplicate");

  const duplicateQuery = useQuery({
    ...policyQueries.detail(accountId, workspaceId, duplicateName ?? ""),
    enabled: duplicateName != null,
  });

  const listHref = `/${workspaceSlug}/policies`;

  if (duplicateName != null && duplicateQuery.isPending) {
    return (
      <div className={PAGE_SHELL_CLASS}>
        <Header listHref={listHref} />
        <p className="typography-body text-muted-foreground">
          Loading source policy…
        </p>
      </div>
    );
  }

  return (
    <div className={PAGE_SHELL_CLASS}>
      <Header listHref={listHref} />
      <CreatePolicyForm
        listHref={listHref}
        initialType={typeParam}
        duplicateFrom={duplicateQuery.data ?? null}
      />
    </div>
  );
}

// Height-bound shell: fills `<main>` so the form column owns its own scroll
// region (sections 1–5) and the footer sits below it as a natural flex sibling.
// Page itself does not scroll — overflow-hidden prevents the whole route from
// scrolling when sections overflow.
const PAGE_SHELL_CLASS =
  "mx-auto flex h-full w-full max-w-(--page-max-width) flex-col gap-6 overflow-hidden px-4 pb-6 pt-8 md:px-6 lg:px-8 xl:px-20";

function Header({ listHref }: { listHref: string }) {
  return (
    <header className="flex flex-col gap-3">
      <Breadcrumb
        parent={{ href: listHref, label: "Policies" }}
        current="Create policy"
      />
      <div className="page-header">
        <h1 className="typography-display font-semibold text-foreground">
          Create policy
        </h1>
        <p className="typography-body text-muted-foreground">
          Define the policy type and the workload kinds it can be attached to.
        </p>
      </div>
    </header>
  );
}

// ─── Form orchestration ──────────────────────────────────────────────────────

interface CreatePolicyFormProps {
  listHref: string;
  initialType: PolicyType | null;
  duplicateFrom: Policy | null;
}

function CreatePolicyForm({
  listHref,
  initialType,
  duplicateFrom,
}: CreatePolicyFormProps) {
  const router = useRouter();

  // Flavor deep-link falls through: form pre-selects Location, but section 2
  // surfaces a one-time notice explaining flavor is CLI-only.
  const flavorDeepLink = initialType === "flavor";

  const defaultValues = useMemo<FormValues>(() => {
    if (duplicateFrom) {
      return {
        displayName: `${duplicateFrom.metadata.displayName} copy`,
        name: "",
        resourceTypes: [...duplicateFrom.spec.resourceTypes],
        // Flavor source → user can duplicate the spec but UI keeps the form
        // on Location; flavor in dropdown stays disabled.
        policyType:
          duplicateFrom.spec.type === "flavor"
            ? "location"
            : duplicateFrom.spec.type,
      };
    }
    return {
      displayName: "",
      name: "",
      resourceTypes: ["agent"],
      policyType:
        initialType === "maxToken" || initialType === "location"
          ? initialType
          : "location",
    };
  }, [duplicateFrom, initialType]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

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
  const cleanName = (form.watch("name") || "my-policy").trim();
  const cleanDisplayName = (form.watch("displayName") || cleanName).trim();

  // Body-editor state lives below RHF so the code-reference panel can read it.
  const [locations, setLocations] = useState<ReadonlyArray<LocationItem>>([
    { type: "continent", name: "North America" },
    { type: "country", name: "United States of America" },
  ]);
  const [tokenLimits, setTokenLimits] = useState<TokenLimits>({
    input: 1_000_000,
    output: 0,
    total: 2_000_000,
    step: 1,
    granularity: "month",
  });

  const onSubmit = form.handleSubmit(async () => {
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
      className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr] lg:gap-8"
    >
      {/* Form column owns its own scroll region and pins the action footer at
          the column bottom — actions land under col 1 only, never under the
          code panel. Both columns are height-bound by the grid's `min-h-0
          flex-1` so each viewport scrolls independently. */}
      <div className="flex min-h-0 flex-col gap-4">
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-10 pr-4 pb-2">
            <PolicyTypeSection form={form} />
            <PolicyBodySection
              policyType={policyType}
              flavorDeepLink={flavorDeepLink}
              locations={locations}
              onLocationsChange={setLocations}
              tokenLimits={tokenLimits}
              onTokenLimitsChange={setTokenLimits}
            />
            <ResourceTypesSection form={form} />
            <IdentitySection form={form} />
            <FinalNoteSection />
          </div>
        </ScrollArea>

        <FormFooter
          onCancel={onCancel}
          submitting={form.formState.isSubmitting}
        />
      </div>

      <ScrollArea className="min-h-0">
        {/* pt-1 drops the eyebrow line so its cap-height visually lands on
            the same row as the left column's section-1 heading; without it
            the meta line-height (14) sits ~10px higher than the subtitle
            line-height (22) and reads as a misaligned top. */}
        <div className="pr-4 pb-2 pt-1">
          <CodeReferencePanel
            policyType={policyType}
            name={cleanName}
            displayName={cleanDisplayName}
            resourceTypes={resourceTypes}
            locations={locations}
            tokenLimits={tokenLimits}
          />
        </div>
      </ScrollArea>
    </form>
  );
}

// ─── Numbered section heading ────────────────────────────────────────────────

function StepHeading({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description?: string;
}) {
  return (
    <header className="flex flex-col gap-1">
      <h2 className="typography-subtitle font-semibold text-foreground">
        <span className="font-mono text-meta-foreground">{index}.</span> {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}

// ─── Section 1: policy type ──────────────────────────────────────────────────

function PolicyTypeSection({
  form,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
}) {
  const policyType = form.watch("policyType");
  const helper = POLICY_TYPE_BY_VALUE[policyType].hint;
  const helperId = useId();

  return (
    <section className="flex flex-col gap-4">
      <StepHeading index={1} title="What is your policy on?" />
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
    </section>
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
      {/* Icon belongs to the title row only — hint indents under the title at
          icon-width + gap (16 + 8 = 24, i.e. pl-6). */}
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

// ─── Section 2: policy body editor ───────────────────────────────────────────

interface LocationItem {
  type: "continent" | "country";
  name: string;
}

interface TokenLimits {
  input: number;
  output: number;
  total: number;
  step: number;
  granularity: MaxTokenGranularity;
}

interface PolicyBodySectionProps {
  policyType: PolicyType;
  flavorDeepLink: boolean;
  locations: ReadonlyArray<LocationItem>;
  onLocationsChange: (next: ReadonlyArray<LocationItem>) => void;
  tokenLimits: TokenLimits;
  onTokenLimitsChange: (next: TokenLimits) => void;
}

function PolicyBodySection({
  policyType,
  flavorDeepLink,
  locations,
  onLocationsChange,
  tokenLimits,
  onTokenLimitsChange,
}: PolicyBodySectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <StepHeading
        index={2}
        title="Configure your policy"
        description={POLICY_TYPE_BY_VALUE[policyType].hint}
      />
      {flavorDeepLink ? <FlavorDeepLinkNotice /> : null}
      {policyType === "location" ? (
        <LocationBody value={locations} onChange={onLocationsChange} />
      ) : null}
      {policyType === "maxToken" ? (
        <TokenUsageBody value={tokenLimits} onChange={onTokenLimitsChange} />
      ) : null}
    </section>
  );
}

function FlavorDeepLinkNotice() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-state-warning/40 bg-state-warning-subtle px-4 py-3">
      <AlertTriangle
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-state-warning-text"
      />
      <p className="typography-body text-foreground">
        Flavor policies are authorable via{" "}
        <code className="font-mono">bl apply -f</code> only — the dashboard form
        does not yet support them. We&apos;ve switched the form to Location;
        change the type if you need a different one.
      </p>
    </div>
  );
}

// Location body — toggle chips, mixed continent + country.
// Option set mirrors production: 3 entries total, alphabetical within each group.
const SAMPLE_LOCATIONS: ReadonlyArray<LocationItem> = [
  { type: "continent", name: "Europe" },
  { type: "continent", name: "North America" },
  { type: "country", name: "United States of America" },
];

function LocationBody({
  value,
  onChange,
}: {
  value: ReadonlyArray<LocationItem>;
  onChange: (next: ReadonlyArray<LocationItem>) => void;
}) {
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
      <div className="flex flex-wrap gap-2">
        {SAMPLE_LOCATIONS.map((item) => {
          const checked = value.some(
            (s) => s.type === item.type && s.name === item.name,
          );
          return (
            <button
              type="button"
              key={`${item.type}:${item.name}`}
              onClick={() => toggle(item)}
              aria-pressed={checked}
              className={cn(
                "rounded-md border px-3 py-1.5 typography-meta transition-colors duration-fast ease-out-standard",
                checked
                  ? "border-border-strong bg-muted-surface text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              <span className="font-medium">
                {item.type === "continent" ? "Continent" : "Country"} :
              </span>{" "}
              {item.name}
            </button>
          );
        })}
      </div>
      <p className="typography-caption text-muted-foreground">
        Mixed granularity allowed. Continents and countries OR together — the
        workload can run anywhere in the union.
      </p>
    </div>
  );
}

// Token-usage body — three caps + period selector.
const GRANULARITY_OPTIONS: ReadonlyArray<{
  value: MaxTokenGranularity;
  label: string;
}> = [
  { value: "month", label: "Month" },
  { value: "day", label: "Day" },
  { value: "hour", label: "Hour" },
  { value: "minute", label: "Minute" },
];

function TokenUsageBody({
  value,
  onChange,
}: {
  value: TokenLimits;
  onChange: (next: TokenLimits) => void;
}) {
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
          Over which period?
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

// ─── Section 3: workload targets ─────────────────────────────────────────────

function ResourceTypesSection({
  form,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
}) {
  return (
    <section className="flex flex-col gap-4">
      <StepHeading
        index={3}
        title="Pick the workload kinds"
        description="The policy will only attach to workloads of these kinds."
      />
      <Controller
        control={form.control}
        name="resourceTypes"
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {RESOURCE_TYPE_OPTIONS.map((option) => {
                const checked = field.value.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 transition-colors duration-fast ease-out-standard hover:border-border-strong"
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
    </section>
  );
}

// ─── Section 4: identity (display name → slug) ───────────────────────────────

function IdentitySection({
  form,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
}) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const slug = watch("name");
  const displayHelperId = useId();
  const nameHelperId = useId();

  return (
    <section className="flex flex-col gap-4">
      <StepHeading
        index={4}
        title="Confirm display name"
        description="The display name is the human label; we derive a canonical slug for bl commands."
      />
      <FieldRow cols={1}>
        <div className="flex flex-col gap-1.5">
          <Field
            label="Display name"
            error={errors.displayName?.message}
          >
            <Input
              placeholder="EU-only production"
              aria-describedby={displayHelperId}
              {...register("displayName")}
            />
          </Field>
          <p id={displayHelperId} className="text-muted-foreground">
            Human label. Shown in the dashboard.
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
            Canonical id used in{" "}
            <code className="typography-code">bl</code> commands and{" "}
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
    </section>
  );
}

// ─── Section 5: code reference + create ──────────────────────────────────────

function FinalNoteSection() {
  return (
    <section className="flex flex-col gap-2">
      <StepHeading index={5} title="Create policy" />
      <p className="text-muted-foreground">
        Review the artifact in any of the supported clients on the right, then
        hit Create policy.
      </p>
    </section>
  );
}

// ─── Code reference panel — language-tabbed, reflects form state ─────────────

interface CodeReferencePanelProps {
  policyType: PolicyType;
  name: string;
  displayName: string;
  resourceTypes: ReadonlyArray<PolicyResourceType>;
  locations: ReadonlyArray<LocationItem>;
  tokenLimits: TokenLimits;
}

const LANGUAGE_TABS = [
  { value: "typescript", label: "TypeScript", language: "typescript" },
  { value: "python", label: "Python", language: "python" },
  { value: "go", label: "Go", language: "go" },
  { value: "curl", label: "cURL", language: "bash" },
  { value: "cli", label: "CLI", language: "bash" },
] as const;

function CodeReferencePanel(props: CodeReferencePanelProps) {
  const snippets = useMemo(
    () => ({
      typescript: buildTypescriptSnippet(props),
      python: buildPythonSnippet(props),
      go: buildGoSnippet(props),
      curl: buildCurlSnippet(props),
      cli: buildCliSnippet(props),
    }),
    [props],
  );

  return (
    <aside
      aria-labelledby="create-policy-reference-heading"
      className="flex min-w-0 flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="create-policy-reference-heading"
          className="font-mono typography-meta uppercase tracking-wider text-meta-foreground"
        >
          Apply via code
        </h2>
        <p className="typography-caption text-muted-foreground">
          Mirrors the form. Copy and run from your own client.
        </p>
      </div>
      <Tabs defaultValue="typescript" className="gap-3">
        <TabsList variant="underline" aria-label="Client language">
          {LANGUAGE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {LANGUAGE_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="m-0">
            <CodeBlock
              variant="block"
              language={tab.language}
              code={snippets[tab.value]}
              className="whitespace-pre-wrap break-words overflow-x-hidden"
            />
          </TabsContent>
        ))}
      </Tabs>
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

// ─── Snippet builders ────────────────────────────────────────────────────────

type SnippetBuildContext = CodeReferencePanelProps;

function buildYamlBody(ctx: SnippetBuildContext): string {
  const lines: string[] = [
    "apiVersion: blaxel.ai/v1alpha1",
    "kind: Policy",
    "metadata:",
    `  name: ${ctx.name}`,
    `  displayName: ${ctx.displayName}`,
    "spec:",
    `  type: ${ctx.policyType}`,
    "  resourceTypes:",
    ...ctx.resourceTypes.map((kind) => `    - ${kind}`),
  ];
  if (ctx.policyType === "location") {
    lines.push("  locations:");
    if (ctx.locations.length === 0) {
      lines.push("    []");
    } else {
      for (const loc of ctx.locations) {
        lines.push(`    - type: ${loc.type}`, `      name: ${loc.name}`);
      }
    }
  } else if (ctx.policyType === "maxToken") {
    lines.push(
      "  maxTokens:",
      `    granularity: ${ctx.tokenLimits.granularity}`,
      `    step: ${ctx.tokenLimits.step}`,
      `    input: ${ctx.tokenLimits.input}`,
      `    output: ${ctx.tokenLimits.output}`,
      `    total: ${ctx.tokenLimits.total}`,
    );
  } else if (ctx.policyType === "flavor") {
    lines.push(
      "  flavors:",
      "    - name: t4",
      "      type: cpu",
    );
  }
  return lines.join("\n");
}

function buildTypescriptSnippet(ctx: SnippetBuildContext): string {
  const body = buildPolicyObjectLiteral(ctx, { lang: "ts" });
  return [
    'import { createPolicy } from "@blaxel/core";',
    "",
    `await createPolicy({`,
    `  body: ${indent(body, 2).trimStart()},`,
    `});`,
  ].join("\n");
}

function buildPythonSnippet(ctx: SnippetBuildContext): string {
  const body = buildPolicyObjectLiteral(ctx, { lang: "py" });
  return [
    "from blaxel import create_policy",
    "",
    `await create_policy(body=${indent(body, 2).trimStart()})`,
  ].join("\n");
}

function buildGoSnippet(ctx: SnippetBuildContext): string {
  const lines = [
    `client, _ := blaxel.NewClient()`,
    ``,
    `_, err := client.CreatePolicy(ctx, blaxel.Policy{`,
    `\tMetadata: blaxel.PolicyMetadata{`,
    `\t\tName:        "${ctx.name}",`,
    `\t\tDisplayName: "${ctx.displayName}",`,
    `\t},`,
    `\tSpec: blaxel.PolicySpec{`,
    `\t\tType: "${ctx.policyType}",`,
    `\t\tResourceTypes: []string{${ctx.resourceTypes
      .map((kind) => `"${kind}"`)
      .join(", ")}},`,
  ];
  if (ctx.policyType === "location") {
    lines.push(`\t\tLocations: []blaxel.PolicyLocation{`);
    for (const loc of ctx.locations) {
      lines.push(
        `\t\t\t{Type: "${loc.type}", Name: "${loc.name}"},`,
      );
    }
    lines.push(`\t\t},`);
  } else if (ctx.policyType === "maxToken") {
    lines.push(
      `\t\tMaxTokens: &blaxel.PolicyMaxTokens{`,
      `\t\t\tGranularity: "${ctx.tokenLimits.granularity}",`,
      `\t\t\tStep:        ${ctx.tokenLimits.step},`,
      `\t\t\tInput:       ${ctx.tokenLimits.input},`,
      `\t\t\tOutput:      ${ctx.tokenLimits.output},`,
      `\t\t\tTotal:       ${ctx.tokenLimits.total},`,
      `\t\t},`,
    );
  } else if (ctx.policyType === "flavor") {
    lines.push(
      `\t\tFlavors: []blaxel.PolicyFlavor{`,
      `\t\t\t{Name: "t4", Type: "cpu"},`,
      `\t\t},`,
    );
  }
  lines.push(`\t},`, `})`);
  return lines.join("\n");
}

function buildCurlSnippet(ctx: SnippetBuildContext): string {
  const body = buildPolicyObjectLiteral(ctx, { lang: "json" });
  // Indent body so each subsequent line aligns under the opening `'{` of `-d '…'`.
  // Bash single-quoted strings preserve embedded newlines — the JSON stays valid.
  const bodyLines = body.split("\n");
  const indentedBody = bodyLines
    .map((line, i) => (i === 0 ? line : `     ${line}`))
    .join("\n");
  return [
    `curl -X POST https://api.blaxel.ai/v0/policies \\`,
    `  -H "Authorization: Bearer $BLAXEL_API_KEY" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '${indentedBody}'`,
  ].join("\n");
}

function buildCliSnippet(ctx: SnippetBuildContext): string {
  const yaml = buildYamlBody(ctx);
  return [
    `cat <<'EOF' | bl apply -f -`,
    yaml,
    `EOF`,
  ].join("\n");
}

// Object-literal builder shared by TS / Python / cURL — each language picks
// the quote and key style it wants.
function buildPolicyObjectLiteral(
  ctx: SnippetBuildContext,
  opts: { lang: "ts" | "py" | "json" },
): string {
  const quoteKey = (key: string) =>
    opts.lang === "ts" ? key : `"${key}"`;
  const str = (value: string) =>
    opts.lang === "py" ? `"${value}"` : `"${value}"`;
  const arr = (items: ReadonlyArray<string>) =>
    `[${items.map(str).join(", ")}]`;
  const open = opts.lang === "py" ? "{" : "{";
  const close = opts.lang === "py" ? "}" : "}";

  const lines: string[] = [`${open}`];
  lines.push(`  ${quoteKey("metadata")}: {`);
  lines.push(`    ${quoteKey("name")}: ${str(ctx.name)},`);
  lines.push(`    ${quoteKey("displayName")}: ${str(ctx.displayName)},`);
  lines.push(`  },`);
  lines.push(`  ${quoteKey("spec")}: {`);
  lines.push(`    ${quoteKey("type")}: ${str(ctx.policyType)},`);
  lines.push(`    ${quoteKey("resourceTypes")}: ${arr(ctx.resourceTypes)},`);
  if (ctx.policyType === "location") {
    lines.push(`    ${quoteKey("locations")}: [`);
    for (const loc of ctx.locations) {
      lines.push(
        `      { ${quoteKey("type")}: ${str(loc.type)}, ${quoteKey("name")}: ${str(loc.name)} },`,
      );
    }
    lines.push(`    ],`);
  } else if (ctx.policyType === "maxToken") {
    lines.push(`    ${quoteKey("maxTokens")}: {`);
    lines.push(
      `      ${quoteKey("granularity")}: ${str(ctx.tokenLimits.granularity)},`,
    );
    lines.push(`      ${quoteKey("step")}: ${ctx.tokenLimits.step},`);
    lines.push(`      ${quoteKey("input")}: ${ctx.tokenLimits.input},`);
    lines.push(`      ${quoteKey("output")}: ${ctx.tokenLimits.output},`);
    lines.push(`      ${quoteKey("total")}: ${ctx.tokenLimits.total},`);
    lines.push(`    },`);
  } else if (ctx.policyType === "flavor") {
    lines.push(`    ${quoteKey("flavors")}: [`);
    lines.push(
      `      { ${quoteKey("name")}: ${str("t4")}, ${quoteKey("type")}: ${str("cpu")} },`,
    );
    lines.push(`    ],`);
  }
  lines.push(`  },`);
  lines.push(close);
  return lines.join("\n");
}

function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => `${pad}${line}`)
    .join("\n");
}

// ─── Form footer — pinned at the bottom of the form column ───────────────────

function FormFooter({
  onCancel,
  submitting,
}: {
  onCancel: () => void;
  submitting: boolean;
}) {
  return (
    <div
      role="region"
      aria-label="Create policy actions"
      className="flex shrink-0 items-center justify-end gap-2 border-t border-border pt-3"
    >
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" variant="primary" disabled={submitting}>
        Create policy
      </Button>
    </div>
  );
}

// ─── Util ────────────────────────────────────────────────────────────────────

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
