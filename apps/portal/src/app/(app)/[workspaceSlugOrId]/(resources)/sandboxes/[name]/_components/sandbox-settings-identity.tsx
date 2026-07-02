"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { saveSandboxIdentity } from "@/lib/mock/sandbox-settings-fixtures";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";

interface SandboxSettingsIdentityProps {
  sandboxName: string;
  initialDisplayName: string;
  initialDescription: string;
}

export default function SandboxSettingsIdentity({
  sandboxName,
  initialDisplayName,
  initialDescription,
}: SandboxSettingsIdentityProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [description, setDescription] = useState(initialDescription);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <IdentityForm
        initialDisplayName={displayName}
        initialDescription={description}
        onCancel={() => setEditing(false)}
        onSubmit={async (next) => {
          await saveSandboxIdentity(accountId, workspaceId, sandboxName, {
            displayName: next.displayName,
            description: next.description,
          });
          setDisplayName(next.displayName);
          setDescription(next.description);
          setEditing(false);
          toast.success("Identity updated.");
        }}
      />
    );
  }

  return (
    <section
      aria-label="Identity"
      className="flex items-start justify-between gap-3 pt-2"
    >
      <div className="flex flex-1 flex-col gap-6">
        <IdentityField label="Display name" value={displayName} />
        <IdentityField
          label="Description"
          value={description || "—"}
          muted={!description}
        />
      </div>
      <IconButton
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Edit identity"
        onClick={() => setEditing(true)}
      >
        <Pencil aria-hidden="true" />
      </IconButton>
    </section>
  );
}

function IdentityField({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="typography-meta text-meta-foreground">{label}</h3>
      <p
        className={
          muted
            ? "typography-body text-meta-foreground"
            : "typography-body text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}

interface IdentityFormProps {
  initialDisplayName: string;
  initialDescription: string;
  onCancel: () => void;
  onSubmit: (next: {
    displayName: string;
    description: string;
  }) => Promise<void>;
}

function IdentityForm({
  initialDisplayName,
  initialDescription,
  onCancel,
  onSubmit,
}: IdentityFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const dirty =
    displayName !== initialDisplayName ||
    description !== initialDescription;

  async function handleSave() {
    if (!dirty) {
      onCancel();
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ displayName, description });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-label="Identity" className="pt-2">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="identity-display-name"
            className="typography-meta text-meta-foreground"
          >
            Display name
          </label>
          <Input
            id="identity-display-name"
            value={displayName}
            autoFocus
            onChange={(event) => setDisplayName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
              }
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="identity-description"
            className="typography-meta text-meta-foreground"
          >
            Description
          </label>
          <Textarea
            id="identity-description"
            value={description}
            rows={3}
            onChange={(event) => setDescription(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
              }
            }}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving || !dirty}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </section>
  );
}
