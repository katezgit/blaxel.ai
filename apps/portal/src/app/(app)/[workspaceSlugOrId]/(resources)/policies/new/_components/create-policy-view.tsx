"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Code2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CodeBlock } from "@repo/ui/components/code-block";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
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
import CreatePolicySkeleton from "./create-policy-skeleton";

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
    return <CreatePolicySkeleton listHref={listHref} />;
  }

  return (
    <CreatePolicyForm
      listHref={listHref}
      initialType={typeParam}
      duplicateFrom={duplicateQuery.data ?? null}
    />
  );
}

// Height-bound shell: fills `<main>` so the form column owns its own scroll
// region via ScrollArea, while header + footer stay pinned. xl padding mirrors
// the rest of the app shell.
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-(--page-max-width) flex-col gap-6 overflow-hidden px-6 pb-6 pt-6 md:px-8 lg:px-12 xl:px-20">
      {children}
    </div>
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
  // Placeholder uses angle brackets so an unfilled snippet looks visibly
  // non-runnable — discourages copying before the form is filled in.
  const cleanName = (form.watch("name") || "<your-policy-name>").trim();
  const cleanDisplayName = (form.watch("displayName") || cleanName).trim();

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
  const [codeOpen, setCodeOpen] = useState(false);

  const snapshot = useMemo<PolicySnapshot>(
    () => ({
      policyType,
      name: cleanName,
      displayName: cleanDisplayName,
      resourceTypes,
      locations,
      tokenLimits,
    }),
    [policyType, cleanName, cleanDisplayName, resourceTypes, locations, tokenLimits],
  );

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

  return (
    <PageShell>
      <header className="flex flex-col gap-3">
        <Breadcrumb
          parent={{ href: listHref, label: "Policies" }}
          current="Create policy"
        />
        <div className="flex items-start justify-between gap-4">
          <div className="page-header">
            <h1 className="typography-display font-semibold text-foreground">
              Create policy
            </h1>
            <p className="typography-body text-muted-foreground">
              Define a rule and the workloads it attaches to.
            </p>
          </div>
          {/* Below lg, the code rail is gone and the form takes full width;
              this button summons the snippet in a drawer so the user can copy
              it without losing the form they're filling. Hidden on lg+ where
              the side rail is already visible. */}
          <Button
            type="button"
            variant="ghost"
            className="shrink-0 gap-1.5 lg:hidden"
            onClick={() => setCodeOpen(true)}
          >
            <Code2 aria-hidden="true" className="size-4" />
            Or use in code
          </Button>
        </div>
      </header>

      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,36rem)_minmax(0,28rem)]">
          <ScrollArea className="min-h-0">
            <div className="flex flex-col gap-10 pb-2 pl-1 pr-4">
              <section className="flex flex-col gap-4">
                <SectionHeading
                  title="Choose a policy type"
                  headingId="policy-type-heading"
                />
                <PolicyTypeSelectField
                  form={form}
                  labelledBy="policy-type-heading"
                />
              </section>

              <section className="flex flex-col gap-4">
                <SectionHeading title="Name the policy" />
                <IdentityEditableFields form={form} />
              </section>

              <section className="flex flex-col gap-4">
                <SectionHeading
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
                <SectionHeading
                  title="Choose target workloads"
                  description="Attaches only to the workload types selected here."
                />
                <ResourceTypesField form={form} />
              </section>

              <section className="flex flex-col gap-4">
                <SectionHeading
                  title="Labels"
                  description="Key/value pairs for organizing and filtering. Optional."
                />
                <LabelsEditor form={form} />
              </section>
            </div>
          </ScrollArea>

          {/* Side rail on lg+. Below lg it's hidden and the header's
              "Use in code" button surfaces the same panel inside a drawer. */}
          <div className="hidden min-h-0 pb-2 pl-1 pr-4 lg:block">
            <CodeReferencePanel snapshot={snapshot} />
          </div>
        </div>

        {/* Footer hairline + actions live inside the form column cell — the
            code column has no footer affordance, so the divider stops at the
            form column gap. Buttons are anchored to max-w-sm (Display name /
            Name input width) so they read as siblings of those fields. */}
        <div
          role="region"
          aria-label={isDirty ? "Unsaved changes" : "Create policy actions"}
          className="shrink-0 lg:grid lg:grid-cols-[minmax(0,36rem)_minmax(0,28rem)] lg:gap-8"
        >
          <div className="border-t border-border pt-6">
            <div className="flex max-w-sm items-center justify-between gap-2">
              {isDirty && !form.formState.isSubmitting ? (
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              ) : (
                <span aria-hidden="true" />
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating…" : "Create policy"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Below lg, the snippet panel lives in this drawer instead of a side
          rail. Triggered by the header "Use in code" button. */}
      <Drawer open={codeOpen} onOpenChange={setCodeOpen} direction="right">
        <DrawerContent size="md">
          <DrawerHeader>
            <DrawerTitle>Or use in code</DrawerTitle>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody>
            <CodeReferencePanel snapshot={snapshot} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

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
              Your unsaved changes will be lost.
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
    </PageShell>
  );
}

function SectionHeading({
  title,
  description,
  headingId,
}: {
  title: string;
  description?: string;
  headingId?: string;
}) {
  return (
    <header className="flex flex-col gap-1">
      <h2
        id={headingId}
        className="typography-body font-semibold text-foreground"
      >
        {title}
      </h2>
      {description ? (
        <p className="typography-caption text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}

interface PolicySnapshot {
  policyType: PolicyType;
  name: string;
  displayName: string;
  resourceTypes: ReadonlyArray<PolicyResourceType>;
  locations: ReadonlyArray<LocationItem>;
  tokenLimits: TokenLimits;
}

interface CodeReferencePanelProps {
  snapshot: PolicySnapshot;
}

const LANGUAGE_TABS = [
  { value: "typescript", label: "TypeScript", language: "typescript" },
  { value: "python", label: "Python", language: "python" },
  { value: "go", label: "Go", language: "go" },
  { value: "curl", label: "cURL", language: "bash" },
  { value: "cli", label: "CLI", language: "bash" },
] as const;

function CodeReferencePanel({ snapshot }: CodeReferencePanelProps) {
  const snippets = useMemo(
    () => ({
      typescript: buildTypescriptSnippet(snapshot),
      python: buildPythonSnippet(snapshot),
      go: buildGoSnippet(snapshot),
      curl: buildCurlSnippet(snapshot),
      cli: buildCliSnippet(snapshot),
    }),
    [snapshot],
  );

  return (
    <aside
      aria-labelledby="code-panel-heading"
      className="flex min-w-0 flex-col gap-4"
    >
      <header className="flex flex-col gap-1">
        <h2
          id="code-panel-heading"
          className="typography-body font-semibold text-foreground"
        >
          Or use in code
        </h2>
        <p className="typography-caption text-muted-foreground">
          Updates as you fill the form.
        </p>
      </header>
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
    </aside>
  );
}

function buildYamlBody(ctx: PolicySnapshot): string {
  const lines: string[] = [
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

function buildTypescriptSnippet(ctx: PolicySnapshot): string {
  const body = buildPolicyObjectLiteral(ctx, { lang: "ts" });
  return [
    'import { createPolicy } from "@blaxel/core";',
    "",
    `await createPolicy({`,
    `  body: ${indent(body, 2).trimStart()},`,
    `});`,
  ].join("\n");
}

function buildPythonSnippet(ctx: PolicySnapshot): string {
  const body = buildPolicyObjectLiteral(ctx, { lang: "py" });
  return [
    "from blaxel import create_policy",
    "",
    `await create_policy(body=${indent(body, 2).trimStart()})`,
  ].join("\n");
}

function buildGoSnippet(ctx: PolicySnapshot): string {
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

function buildCurlSnippet(ctx: PolicySnapshot): string {
  const body = buildPolicyObjectLiteral(ctx, { lang: "json" });
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

function buildCliSnippet(ctx: PolicySnapshot): string {
  const yaml = buildYamlBody(ctx);
  return [`cat <<'EOF' | bl apply -f -`, yaml, `EOF`].join("\n");
}

function buildPolicyObjectLiteral(
  ctx: PolicySnapshot,
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
