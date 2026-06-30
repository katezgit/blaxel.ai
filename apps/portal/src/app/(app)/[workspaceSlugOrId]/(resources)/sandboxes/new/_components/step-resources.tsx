"use client";

import { Pencil, Plus, X } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { IconButton } from "@repo/ui/components/icon-button";
import { FormField } from "@repo/ui/components/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import type { Volume } from "@/lib/mock/volumes";
import type { SandboxRegion } from "@/lib/mock/sandboxes";
import { findSandboxImage } from "@/lib/mock/sandbox-images";
import type { CreateFormState, EnvVar, SandboxTtl } from "./form-state";
import { VolumesField } from "./volumes-field";

interface StepResourcesProps {
  state: CreateFormState;
  onChange: (next: CreateFormState) => void;
  workspaceVolumes: ReadonlyArray<Volume>;
  onEditImage: () => void;
}

const MEMORY_OPTIONS: ReadonlyArray<CreateFormState["memoryMib"]> = [
  2048, 4096, 8192, 16384,
];

const TTL_OPTIONS: ReadonlyArray<{
  value: SandboxTtl;
  label: string;
  hint?: string;
}> = [
  { value: "none", label: "No expiry" },
  { value: "1d", label: "1 day" },
  { value: "7d", label: "7 days", hint: "Tier 0 cap" },
  { value: "30d", label: "30 days", hint: "Tier 1 required" },
];

const REGION_OPTIONS: ReadonlyArray<{ value: SandboxRegion; label: string }> = [
  { value: "auto", label: "Auto (closest)" },
  { value: "eu-fra-1", label: "eu-fra-1" },
  { value: "eu-lon-1", label: "eu-lon-1" },
  { value: "us-was-1", label: "us-was-1" },
  { value: "us-pdx-1", label: "us-pdx-1" },
];

export function StepResources({
  state,
  onChange,
  workspaceVolumes,
  onEditImage,
}: StepResourcesProps) {
  const image = state.imageRef ? findSandboxImage(state.imageRef) : undefined;

  function updateField<K extends keyof CreateFormState>(
    key: K,
    value: CreateFormState[K],
  ) {
    onChange({ ...state, [key]: value });
  }

  function addEnvVar() {
    const next: EnvVar = {
      id: `env-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: "",
      value: "",
    };
    onChange({ ...state, envVars: [...state.envVars, next] });
  }

  function updateEnvVar(id: string, patch: Partial<EnvVar>) {
    onChange({
      ...state,
      envVars: state.envVars.map((envVar) =>
        envVar.id === id ? { ...envVar, ...patch } : envVar,
      ),
    });
  }

  function removeEnvVar(id: string) {
    onChange({
      ...state,
      envVars: state.envVars.filter((envVar) => envVar.id !== id),
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h2 className="typography-body font-semibold text-foreground">Image</h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 typography-caption">
            <span className="typography-meta font-mono text-foreground">
              {image?.ref ?? "—"}
            </span>
          </span>
          <Button
            type="button"
            variant="ghost"
            onClick={onEditImage}
            aria-label="Change Image"
          >
            <Pencil aria-hidden="true" />
            Change
          </Button>
        </div>
      </section>

      <FormField id="memory" label="Memory" required>
        <Select
          value={String(state.memoryMib)}
          onValueChange={(value) =>
            updateField(
              "memoryMib",
              Number(value) as CreateFormState["memoryMib"],
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEMORY_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} MiB
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        id="ttl"
        label="TTL"
        helper="Tier 0 max: 7 days · Upgrade to Tier 1 for 30 days"
      >
        <Select
          value={state.ttl}
          onValueChange={(value) => updateField("ttl", value as SandboxTtl)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TTL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-baseline gap-2">
                  <span>{option.label}</span>
                  {option.hint ? (
                    <span className="typography-caption text-meta-foreground">
                      {option.hint}
                    </span>
                  ) : null}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField id="region" label="Region" required>
        <Select
          value={state.region}
          onValueChange={(value) =>
            updateField("region", value as SandboxRegion)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REGION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <section className="flex flex-col gap-3">
        <h2 className="typography-body font-semibold text-foreground">
          Volumes
        </h2>
        <VolumesField
          workspaceVolumes={workspaceVolumes}
          attached={state.volumes}
          onChange={(next) => updateField("volumes", next)}
          targetRegion={state.region}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="typography-body font-semibold text-foreground">
          Environment variables
        </h2>
        {state.envVars.length === 0 ? (
          <p className="typography-caption text-muted-foreground">
            No variables set.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {state.envVars.map((envVar) => (
              <li key={envVar.id} className="flex items-center gap-2">
                <Input
                  value={envVar.name}
                  onChange={(e) =>
                    updateEnvVar(envVar.id, { name: e.target.value })
                  }
                  placeholder="NAME"
                  aria-label="Variable name"
                  className="font-mono"
                />
                <Input
                  value={envVar.value}
                  onChange={(e) =>
                    updateEnvVar(envVar.id, { value: e.target.value })
                  }
                  placeholder="value"
                  aria-label="Variable value"
                  className="font-mono"
                />
                <IconButton
                  variant="ghost"
                  aria-label={`Remove ${envVar.name || "variable"}`}
                  onClick={() => removeEnvVar(envVar.id)}
                >
                  <X aria-hidden="true" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
        <Button
          type="button"
          variant="ghost"
          className="self-start"
          onClick={addEnvVar}
        >
          <Plus aria-hidden="true" />
          Add variable
        </Button>
      </section>
    </div>
  );
}
