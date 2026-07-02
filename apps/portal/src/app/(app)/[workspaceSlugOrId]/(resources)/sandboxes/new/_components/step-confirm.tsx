"use client";

import { useMemo } from "react";
import { AlertTriangle, Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { CodeBlock } from "@repo/ui/components/code-block";
import { FormField } from "@repo/ui/components/form-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { findSandboxImage } from "@/lib/mock/sandbox-images";
import type { CreateFormState } from "./form-state";
import { isValidSandboxName, slugify } from "./form-state";
import { buildSnippet, snippetContextFrom, type SnippetLanguage } from "./snippets";

interface StepConfirmProps {
  state: CreateFormState;
  onChange: (next: CreateFormState) => void;
  onEditImage: () => void;
  onEditResources: () => void;
  /** Inline name conflict error, if any. */
  nameError?: string | null;
}

const LANG_TABS: ReadonlyArray<{ value: SnippetLanguage; label: string; language: string }> = [
  { value: "typescript", label: "TypeScript", language: "typescript" },
  { value: "python", label: "Python", language: "python" },
  { value: "go", label: "Go", language: "go" },
  { value: "curl", label: "cURL", language: "bash" },
  { value: "cli", label: "CLI", language: "bash" },
];

export function StepConfirm({
  state,
  onChange,
  onEditImage,
  onEditResources,
  nameError,
}: StepConfirmProps) {
  const image = state.imageRef ? findSandboxImage(state.imageRef) : undefined;
  const ctx = useMemo(() => snippetContextFrom(state), [state]);

  function setDisplayName(value: string) {
    const slug = slugify(value);
    onChange({
      ...state,
      displayName: value,
      // Auto-sync the sandbox name only while the user hasn't edited it.
      sandboxName:
        state.sandboxName === "" ||
        state.sandboxName === slugify(state.displayName)
          ? slug
          : state.sandboxName,
    });
  }

  const nameInvalid =
    state.sandboxName !== "" && !isValidSandboxName(state.sandboxName);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="typography-body font-semibold text-foreground">
          Summary
        </h2>
        <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
          <SummaryLine
            label="Image"
            value={
              image
                ? `${image.ref}@${image.sha.slice(0, 4)}…`
                : "—"
            }
            mono
            onEdit={onEditImage}
            editLabel="Change Image"
          />
          <SummaryLine
            label="Memory"
            value={`${state.memoryMib} MiB`}
            onEdit={onEditResources}
            editLabel="Change Memory"
          />
          <SummaryLine
            label="Region"
            value={state.region}
            mono
            onEdit={onEditResources}
            editLabel="Change Region"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="typography-body font-semibold text-foreground">
          Name your Sandbox
        </h2>
        <FormField
          id="display-name"
          label="Display name (optional)"
          helper="Shown in the dashboard."
        >
          <Input
            value={state.displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="My eval runner"
          />
        </FormField>

        <FormField
          id="sandbox-name"
          label="Sandbox name"
          required
          error={
            nameError ??
            (nameInvalid
              ? "Lowercase letters, numbers, and hyphens only. Max 49 characters."
              : undefined)
          }
        >
          <Input
            value={state.sandboxName}
            onChange={(e) =>
              onChange({ ...state, sandboxName: e.target.value })
            }
            placeholder="my-sandbox"
            className="font-mono"
          />
        </FormField>
        <p className="flex items-start gap-1.5 typography-caption text-muted-foreground">
          <AlertTriangle
            aria-hidden="true"
            className="size-3.5 text-state-warning shrink-0 mt-px"
          />
          Cannot be changed after creation. Lowercase letters, numbers, hyphens.
          Max 49 characters.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="typography-body font-semibold text-foreground">Launch</h2>
        <Tabs defaultValue="typescript" className="gap-3">
          <TabsList variant="underline" aria-label="Snippet language">
            {LANG_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {LANG_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="m-0">
              <CodeBlock
                variant="block"
                language={tab.language}
                code={buildSnippet(tab.value, ctx)}
                className="w-full"
              />
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}

interface SummaryLineProps {
  label: string;
  value: string;
  onEdit: () => void;
  editLabel: string;
  mono?: boolean;
}

function SummaryLine({
  label,
  value,
  onEdit,
  editLabel,
  mono = false,
}: SummaryLineProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-baseline gap-3">
        <span className="typography-caption text-muted-foreground w-20 shrink-0">
          {label}
        </span>
        <span
          className={
            mono
              ? "typography-meta font-mono text-foreground"
              : "typography-body text-foreground"
          }
        >
          {value}
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={onEdit}
        aria-label={editLabel}
      >
        <Pencil aria-hidden="true" />
      </Button>
    </div>
  );
}
