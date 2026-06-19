"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { CopyButton } from "@repo/ui/components/copy-button";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { Org } from "@/lib/mock/types";
import { ConfirmByNameDialog } from "../../_components/confirm-by-name-dialog";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const NAME_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Workspace name is required.")
    .max(48, "Workspace name must be 48 characters or fewer."),
});

type NameFormValues = z.infer<typeof NAME_SCHEMA>;

/**
 * Resources blown away when a workspace is deleted — pulled verbatim from
 * `docs/product/platform.md` so the wording stays load-bearing-honest.
 */
const DELETION_TARGETS = [
  "sandboxes",
  "volumes",
  "agent drives",
  "images",
  "agents",
  "jobs",
  "MCP servers",
  "model APIs",
  "network rules",
  "custom domains",
  "API keys",
  "service accounts",
  "integrations",
  "policies",
];

interface NameSettingsClientProps {
  workspace: Org;
}

export function NameSettingsClient({ workspace }: NameSettingsClientProps) {
  const router = useRouter();
  const [savedName, setSavedName] = useState(workspace.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NameFormValues>({
    resolver: zodResolver(NAME_SCHEMA),
    defaultValues: { name: savedName },
  });

  const currentValue = watch("name");
  const isDirty = currentValue.trim() !== savedName;

  const onSubmit = async ({ name }: NameFormValues) => {
    await new Promise((r) => setTimeout(r, 200));
    setSavedName(name);
    reset({ name });
    toast.success(`Workspace renamed to ${name}.`);
  };

  return (
    // Each card is independently scoped — Identity is the only `<form>`. The
    // destructive Danger zone + the Sandbox-settings toggle sit OUTSIDE so an
    // Enter keystroke or accidental submit from those controls can't trigger
    // an Identity save (or vice versa).
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-subtitle font-semibold text-foreground">
            Identity
          </h2>
          <p className="text-muted-foreground">
            How this workspace is referenced in URLs, the CLI, and the dashboard.
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-4">
          <FormField
            id="workspace-display-name"
            label="Display name"
            helper="1–48 characters. Used wherever the workspace is referenced."
            error={errors.name?.message}
          >
            <Input
              {...register("name")}
              autoComplete="off"
              maxLength={48}
            />
          </FormField>
          <FormField
            id="workspace-slug"
            label="Slug"
            helper="Permanent — used in URLs and CLI commands."
          >
            <Input
              value={workspace.slug}
              readOnly
              className="font-mono"
              trailing={
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <CopyButton
                        value={workspace.slug}
                        ariaLabel="Copy workspace slug"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Slug is permanent — used in URLs and CLI.
                  </TooltipContent>
                </Tooltip>
              }
            />
          </FormField>
          <FormField
            id="workspace-id"
            label="Workspace ID"
            helper="Short identifier used in the dashboard and CLI."
          >
            <Input
              value={workspace.workspaceId}
              readOnly
              className="font-mono"
              trailing={
                <CopyButton
                  value={workspace.workspaceId}
                  ariaLabel="Copy workspace ID"
                />
              }
            />
          </FormField>
          <FormField
            id="account-id"
            label="Account ID"
            helper="Parent account UUID. Useful for support and billing."
          >
            <Input
              value={workspace.accountId}
              readOnly
              className="font-mono"
              trailing={
                <CopyButton
                  value={workspace.accountId}
                  ariaLabel="Copy account ID"
                />
              }
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <span className="text-label font-medium text-foreground">
                Account
              </span>
              <span className="font-mono text-caption text-meta-foreground">
                {workspace.accountName}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label font-medium text-foreground">
                Account owner
              </span>
              <span className="font-mono text-caption text-meta-foreground">
                {workspace.accountOwner}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label font-medium text-foreground">
                Created
              </span>
              <span className="text-caption text-meta-foreground">
                {DATE_FMT.format(new Date(workspace.createdAt))}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={!isDirty || isSubmitting}
          >
            Save changes
          </Button>
        </div>
        </Card>
      </form>

      <SandboxSettingsCard
        initial={workspace.sandboxSettings.disableProcessLogging}
      />

      <DangerZoneCard
        workspaceName={savedName}
        onDelete={() => setConfirmOpen(true)}
      />

      <ConfirmByNameDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        actionLabel="Delete workspace"
        targetLabel={savedName}
        workspaceName={savedName}
        description="Deleting the workspace is permanent. Every workspace-scoped resource and credential below will be removed."
        details={
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-label font-medium text-foreground">
              The following will be permanently removed:
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-caption text-muted-foreground sm:grid-cols-3">
              {DELETION_TARGETS.map((target) => (
                <li key={target}>{target}</li>
              ))}
            </ul>
          </div>
        }
        onConfirm={() => {
          toast.success(`Workspace ${savedName} deleted (mock).`);
          router.push("/");
        }}
      />
    </div>
  );
}

interface SandboxSettingsCardProps {
  initial: boolean;
}

function SandboxSettingsCard({ initial }: SandboxSettingsCardProps) {
  const [disabled, setDisabled] = useState(initial);
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-subtitle font-semibold text-foreground">
          Sandbox settings
        </h2>
        <p className="text-muted-foreground">
          Defaults applied to every sandbox launched in this workspace.
        </p>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4 rounded-md border border-border bg-secondary-surface px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <label
            htmlFor="disable-process-logging"
            className="text-body font-medium text-foreground"
          >
            Disable process logging
          </label>
          <p className="text-caption text-muted-foreground">
            Prevent sandboxes from capturing per-process stdout / stderr logs.
            Requires sandbox-api v0.2.28+.
          </p>
        </div>
        <Switch
          id="disable-process-logging"
          checked={disabled}
          onCheckedChange={(next) => {
            setDisabled(next);
            toast.success(
              next
                ? "Process logging disabled for new sandboxes."
                : "Process logging enabled for new sandboxes.",
            );
          }}
          aria-label="Disable process logging"
        />
      </div>
    </Card>
  );
}

interface DangerZoneCardProps {
  workspaceName: string;
  onDelete: () => void;
}

function DangerZoneCard({ workspaceName, onDelete }: DangerZoneCardProps) {
  return (
    <Card
      id="danger"
      className="border-destructive/30 bg-destructive/5 p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-subtitle font-semibold text-foreground">
          Danger zone
        </h2>
        <p className="text-muted-foreground">
          Permanently delete this workspace and everything inside it.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption text-muted-foreground">
          You will be asked to type{" "}
          <span className="font-mono text-foreground">{workspaceName}</span>{" "}
          to confirm.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
        >
          Delete workspace
        </Button>
      </div>
    </Card>
  );
}
