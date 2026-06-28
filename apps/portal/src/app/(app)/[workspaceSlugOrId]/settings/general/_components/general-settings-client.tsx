"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import { toast } from "sonner";
import type { Org } from "@/lib/mock/types";
import DirtyActionBar from "@/app/(manage)/_components/dirty-action-bar";
import ConfirmByNameDialog from "../../_components/confirm-by-name-dialog";

const NAME_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Workspace name is required.")
    .max(48, "Workspace name must be 48 characters or fewer."),
});

type NameFormValues = z.infer<typeof NAME_SCHEMA>;

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

interface GeneralSettingsClientProps {
  workspace: Org;
}

export default function GeneralSettingsClient({
  workspace,
}: GeneralSettingsClientProps) {
  const router = useRouter();
  const [savedName, setSavedName] = useState(workspace.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<NameFormValues>({
    resolver: zodResolver(NAME_SCHEMA),
    defaultValues: { name: savedName },
  });

  const onSubmit = handleSubmit(async ({ name }) => {
    await new Promise((r) => setTimeout(r, 200));
    setSavedName(name);
    reset({ name });
    toast.success(`Workspace renamed to ${name}.`);
  });

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 lg:gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="typography-subtitle font-semibold text-foreground">
          Workspace identity
        </h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField
            id="workspace-display-name"
            label="Display name"
            error={errors.name?.message}
          >
            <Input {...register("name")} autoComplete="off" maxLength={48} />
          </FormField>
          <FormField id="workspace-slug" label="Name">
            <Input
              value={workspace.slug}
              readOnly
              className="font-mono"
              trailing={
                <CopyButton
                  value={workspace.slug}
                  ariaLabel="Copy workspace name"
                />
              }
            />
          </FormField>
          <FormField id="workspace-id" label="Workspace ID">
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
          <DirtyActionBar
            isDirty={isDirty}
            onCancel={() => reset()}
            onSave={onSubmit}
            saveLabel="Update workspace"
            saving={isSubmitting}
            className="mt-2 border-t-0 pt-0"
          />
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="typography-subtitle font-semibold text-foreground">
            Account context
          </h2>
          <p className="text-muted-foreground">
            This workspace belongs to the following billing account.
          </p>
        </div>
        <dl className="grid grid-cols-[max-content_1fr] items-center gap-x-6 gap-y-2 typography-caption">
          <dt className="text-meta-foreground">Account ID</dt>
          <dd className="flex items-center gap-2 font-mono text-foreground">
            <span className="truncate">{workspace.accountId}</span>
            <CopyButton
              value={workspace.accountId}
              ariaLabel="Copy account ID"
            />
          </dd>
          <dt className="text-meta-foreground">Account owner</dt>
          <dd className="truncate text-foreground">{workspace.accountOwner}</dd>
        </dl>
      </section>

      <section id="danger" className="flex flex-col gap-4 border-t-2 border-destructive pt-6">
        <div className="flex flex-col gap-1">
          <h2 className="typography-subtitle font-semibold text-destructive">
            Danger zone
          </h2>
          <p className="text-muted-foreground">
            Permanently delete this workspace and all workspace-scoped
            resources.
          </p>
        </div>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setConfirmOpen(true)}
          className="self-end"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete workspace
        </Button>
      </section>

      <ConfirmByNameDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        actionLabel="Delete workspace"
        targetLabel={savedName}
        workspaceName={savedName}
        onConfirm={() => {
          toast.success(`Workspace ${savedName} deleted (mock).`);
          router.push("/");
        }}
      >
        <p className="typography-body text-foreground">
          Deleting the workspace is permanent. Every workspace-scoped resource
          and credential below will be removed.
        </p>
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <p className="typography-label font-medium text-foreground">
            The following will be permanently removed:
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 typography-caption text-muted-foreground sm:grid-cols-3">
            {DELETION_TARGETS.map((target) => (
              <li key={target}>{target}</li>
            ))}
          </ul>
        </div>
      </ConfirmByNameDialog>
    </div>
  );
}
