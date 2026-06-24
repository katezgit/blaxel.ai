"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CodeBlock } from "@repo/ui/components/code-block";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { policyQueries } from "@/lib/query/policies";
import type {
  Policy,
  PolicyResourceType,
  PolicyType,
} from "@/lib/mock/policies";
import {
  computeBodyDirty,
  FlavorUnavailableNotice,
  IdentityEditableFields,
  LabelsEditor,
  LocationBody,
  PolicyTypeSelectField,
  ResourceTypesField,
  StepHeading,
  TokenUsageBody,
} from "@/app/(app)/[workspaceSlugOrId]/(resources)/policies/_components/policy-form/form-pieces";
import {
  labelsRecordToEntries,
  POLICY_TYPE_BY_VALUE,
  policyFormSchema,
  readPolicyTypeParam,
  slugify,
  type LocationItem,
  type PolicyFormValues,
  type TokenLimits,
} from "@/app/(app)/[workspaceSlugOrId]/(resources)/policies/_components/policy-form/form-schema";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

interface CreatePolicyViewProps {
  workspaceSlug: string;
}

export default function CreatePolicyView({ workspaceSlug }: CreatePolicyViewProps) {
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
// scrolling when sections overflow. Padding ramps with viewport so two-column
// content keeps breathing room from the sidebar edge below the xl breakpoint.
const PAGE_SHELL_CLASS =
  "mx-auto flex h-full w-full max-w-(--page-max-width) flex-col gap-6 overflow-hidden px-6 pb-6 pt-8 md:px-8 lg:px-12 xl:px-20";

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
          Define a rule and the workloads it attaches to.
        </p>
      </div>
    </header>
  );
}

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

  const defaultValues = useMemo<PolicyFormValues>(() => {
    if (duplicateFrom) {
      return {
        displayName: `${duplicateFrom.metadata.displayName} copy`,
        name: "",
        resourceTypes: [...duplicateFrom.spec.resourceTypes],
        policyType:
          duplicateFrom.spec.type === "flavor"
            ? "location"
            : duplicateFrom.spec.type,
        labels: [...labelsRecordToEntries(duplicateFrom.metadata.labels)],
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
      labels: [],
    };
  }, [duplicateFrom, initialType]);

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
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
  const INITIAL_LOCATIONS: ReadonlyArray<LocationItem> = [
    { type: "continent", name: "North America" },
    { type: "country", name: "United States of America" },
  ];
  const INITIAL_TOKEN_LIMITS: TokenLimits = {
    input: 1_000_000,
    output: 0,
    total: 2_000_000,
    step: 1,
    granularity: "month",
  };
  const [locations, setLocations] =
    useState<ReadonlyArray<LocationItem>>(INITIAL_LOCATIONS);
  const [tokenLimits, setTokenLimits] = useState<TokenLimits>(
    INITIAL_TOKEN_LIMITS,
  );

  const bodyDirty = computeBodyDirty(policyType, locations, tokenLimits, {
    locations: INITIAL_LOCATIONS,
    maxTokens: INITIAL_TOKEN_LIMITS,
  });
  const isDirty = form.formState.isDirty || bodyDirty;
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const onSubmit = form.handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success("Policy created");
    router.push(listHref);
  });

  function navigateBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(listHref);
    }
  }

  function onCancel() {
    if (isDirty) {
      setConfirmDiscard(true);
    } else {
      navigateBack();
    }
  }

  // Shared step list — rendered once in the mobile single-scroll viewport,
  // once in the lg split-column layout. React renders each <section> tree
  // independently so useId-driven aria-* IDs stay unique per instance.
  const formSections = (
    <>
      <section className="flex flex-col gap-4">
        <StepHeading index={1} title="Choose a policy type" />
        <PolicyTypeSelectField form={form} />
      </section>

      <section className="flex flex-col gap-4">
        <StepHeading
          index={2}
          title="Configure the rule"
          description={POLICY_TYPE_BY_VALUE[policyType].hint}
        />
        {flavorDeepLink ? <FlavorUnavailableNotice /> : null}
        {policyType === "location" ? (
          <LocationBody value={locations} onChange={setLocations} />
        ) : null}
        {policyType === "maxToken" ? (
          <TokenUsageBody value={tokenLimits} onChange={setTokenLimits} />
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <StepHeading
          index={3}
          title="Choose target workloads"
          description="Attaches only to the workload types selected here."
        />
        <ResourceTypesField form={form} />
      </section>

      <section className="flex flex-col gap-4">
        <StepHeading
          index={4}
          title="Name the policy"
          description="Display name is the dashboard label; the slug is auto-derived for CLI."
        />
        <IdentityEditableFields form={form} />
      </section>

      <section className="flex flex-col gap-4">
        <StepHeading
          index={5}
          title="Labels"
          description="Key/value pairs for organizing and filtering. Optional."
        />
        <LabelsEditor form={form} />
      </section>
    </>
  );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      {/* Layout splits at lg: mobile reads the form and code panel as one
          continuous step list (single scroll viewport); lg+ splits into
          form-left / code-right with each column scrolling independently.
          Footer stays pinned in both layouts. */}
      <ScrollArea className="block min-h-0 flex-1 lg:hidden">
        {/* pl-1 clears the 4px focus halo (base.css) from the ScrollArea
            viewport's overflow:hidden boundary; pr-4 keeps the scrollbar gutter. */}
        <div className="flex flex-col gap-10 pb-2 pl-1 pr-4">
          {formSections}
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

      <div className="hidden min-h-0 flex-1 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8">
        <ScrollArea className="min-h-0">
          <div className="flex flex-col gap-10 pb-2 pl-1 pr-4">{formSections}</div>
        </ScrollArea>

        <ScrollArea className="min-h-0">
          <div className="pb-2 pl-1 pr-4">
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
      </div>

      <FormFooter
        onCancel={onCancel}
        submitting={form.formState.isSubmitting}
      />
      <Dialog
        open={confirmDiscard}
        onOpenChange={(next) => {
          if (!next) setConfirmDiscard(false);
        }}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="typography-body text-foreground">
              Leave this page without creating the policy?
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmDiscard(false)}
            >
              Keep editing
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setConfirmDiscard(false);
                navigateBack();
              }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

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
      className="flex min-w-0 flex-col gap-4"
    >
      <StepHeading
        index={6}
        title="Create policy"
        description="Review the artifact below, then create."
        headingId="create-policy-reference-heading"
      />
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
      {/* Mirror of the Policies list-page footer pattern — Docs + API
        * reference inline under the snippet so the developer eye lands on
        * both affordances without leaving the code panel. */}
      <p className="typography-caption text-muted-foreground">
        <Link
          href="https://docs.blaxel.ai/Model-Governance/Policies"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Policies documentation, opens in new tab"
          className="inline-flex items-baseline gap-0.5 text-muted-foreground hover:text-foreground hover:underline"
        >
          Docs
          <ArrowUpRight aria-hidden="true" className="size-3 self-center" />
        </Link>
        {" · "}
        <Link
          href="https://docs.blaxel.ai/api-reference/policies/create-or-update-policy"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Policies API reference, opens in new tab"
          className="inline-flex items-baseline gap-0.5 text-muted-foreground hover:text-foreground hover:underline"
        >
          API reference
          <ArrowUpRight aria-hidden="true" className="size-3 self-center" />
        </Link>
      </p>
    </aside>
  );
}

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
    lines.push("  flavors:", "    - name: t4", "      type: gpu");
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
      lines.push(`\t\t\t{Type: "${loc.type}", Name: "${loc.name}"},`);
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
      `\t\t\t{Name: "t4", Type: "gpu"},`,
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
  return [`cat <<'EOF' | bl apply -f -`, yaml, `EOF`].join("\n");
}

function buildPolicyObjectLiteral(
  ctx: SnippetBuildContext,
  opts: { lang: "ts" | "py" | "json" },
): string {
  const quoteKey = (key: string) =>
    opts.lang === "ts" ? key : `"${key}"`;
  const str = (value: string) => `"${value}"`;
  const arr = (items: ReadonlyArray<string>) =>
    `[${items.map(str).join(", ")}]`;
  const open = "{";
  const close = "}";

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
      `      { ${quoteKey("name")}: ${str("t4")}, ${quoteKey("type")}: ${str("gpu")} },`,
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
      className="shrink-0 border-t border-border pt-3 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8"
    >
      {/* Buttons anchor under the form column on lg+ (3fr cell), keeping the
          primary CTA on the form's F-reading axis. Code panel (2fr cell on the
          right) intentionally has no footer affordance — the form-filler is
          the primary actor; the code viewer is consulting reference. */}
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          Create policy
        </Button>
      </div>
    </div>
  );
}
