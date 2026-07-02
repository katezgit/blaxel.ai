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

/** Top of the Settings tab — Display name + Description. The only two
 *  inline-editable fields on the Settings surface (every other row is
 *  read-only per wireframe §3). Each row is its own self-contained
 *  state machine — entering edit on one row does not affect the other. */
export default function SandboxSettingsIdentity({
  sandboxName,
  initialDisplayName,
  initialDescription,
}: SandboxSettingsIdentityProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [description, setDescription] = useState(initialDescription);

  return (
    <section
      aria-label="Identity"
      className="flex flex-col gap-6 pt-2"
    >
      <DisplayNameRow
        sandboxName={sandboxName}
        value={displayName}
        onSaved={setDisplayName}
      />
      <DescriptionRow
        sandboxName={sandboxName}
        value={description}
        onSaved={setDescription}
      />
    </section>
  );
}

interface DisplayNameRowProps {
  sandboxName: string;
  value: string;
  onSaved: (next: string) => void;
}

function DisplayNameRow({ sandboxName, value, onSaved }: DisplayNameRowProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <InlineEditFrame label="Display name">
        <InlineEditForm
          fieldKind="input"
          initialValue={value}
          ariaLabel="Display name"
          onCancel={() => setEditing(false)}
          onSubmit={async (next) => {
            await saveSandboxIdentity(accountId, workspaceId, sandboxName, {
              displayName: next,
            });
            onSaved(next);
            setEditing(false);
            toast.success("Display name updated.");
          }}
        />
      </InlineEditFrame>
    );
  }

  return (
    <InlineEditFrame label="Display name">
      <ValueRow
        value={value}
        editLabel="Edit display name"
        onEdit={() => setEditing(true)}
      />
    </InlineEditFrame>
  );
}

interface DescriptionRowProps {
  sandboxName: string;
  value: string;
  onSaved: (next: string) => void;
}

function DescriptionRow({ sandboxName, value, onSaved }: DescriptionRowProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <InlineEditFrame label="Description">
        <InlineEditForm
          fieldKind="textarea"
          initialValue={value}
          ariaLabel="Description"
          onCancel={() => setEditing(false)}
          onSubmit={async (next) => {
            await saveSandboxIdentity(accountId, workspaceId, sandboxName, {
              description: next,
            });
            onSaved(next);
            setEditing(false);
            toast.success("Description updated.");
          }}
        />
      </InlineEditFrame>
    );
  }

  return (
    <InlineEditFrame label="Description">
      <ValueRow
        value={value || "—"}
        muted={!value}
        editLabel="Edit description"
        onEdit={() => setEditing(true)}
      />
    </InlineEditFrame>
  );
}

interface InlineEditFrameProps {
  label: string;
  children: React.ReactNode;
}

function InlineEditFrame({ label, children }: InlineEditFrameProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="typography-meta text-meta-foreground">{label}</h3>
      {children}
    </div>
  );
}

interface ValueRowProps {
  value: string;
  muted?: boolean;
  editLabel: string;
  onEdit: () => void;
}

function ValueRow({ value, muted, editLabel, onEdit }: ValueRowProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p
        className={
          muted
            ? "typography-body text-meta-foreground"
            : "typography-body text-foreground"
        }
      >
        {value}
      </p>
      <IconButton
        type="button"
        variant="ghost"
        size="sm"
        aria-label={editLabel}
        onClick={onEdit}
      >
        <Pencil aria-hidden="true" />
      </IconButton>
    </div>
  );
}

interface InlineEditFormProps {
  fieldKind: "input" | "textarea";
  initialValue: string;
  ariaLabel: string;
  onCancel: () => void;
  onSubmit: (next: string) => Promise<void>;
}

function InlineEditForm({
  fieldKind,
  initialValue,
  ariaLabel,
  onCancel,
  onSubmit,
}: InlineEditFormProps) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const dirty = value !== initialValue;

  async function handleSave() {
    if (!dirty) {
      onCancel();
      return;
    }
    setSaving(true);
    try {
      await onSubmit(value);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
      className="flex flex-col gap-3"
    >
      {fieldKind === "input" ? (
        <Input
          aria-label={ariaLabel}
          value={value}
          autoFocus
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
          }}
        />
      ) : (
        <Textarea
          aria-label={ariaLabel}
          value={value}
          autoFocus
          rows={3}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
          }}
        />
      )}
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
  );
}
