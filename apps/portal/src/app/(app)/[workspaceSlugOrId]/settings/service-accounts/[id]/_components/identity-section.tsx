"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import type { Role, ServiceAccount } from "@/lib/mock/types";
import CliLine from "../../_components/cli-line";
import { formatCreatedAtUtc } from "../../_components/format";

interface IdentitySectionProps {
  serviceAccount: ServiceAccount;
  onNameSave: (name: string) => void;
  onDescriptionSave: (description: string) => void;
  onRoleChange: (role: Role) => void;
}

export default function IdentitySection({
  serviceAccount,
  onNameSave,
  onDescriptionSave,
  onRoleChange,
}: IdentitySectionProps) {
  return (
    <section
      aria-labelledby="sa-identity-heading"
      className="flex flex-col gap-6"
    >
      <h2
        id="sa-identity-heading"
        className="typography-subtitle font-semibold text-foreground"
      >
        Identity
      </h2>

      <InlineTextField
        label="Name"
        value={serviceAccount.name}
        onSave={onNameSave}
        ariaLabel="Edit service account name"
      />
      <InlineTextField
        label="Description"
        value={serviceAccount.description}
        onSave={onDescriptionSave}
        ariaLabel="Edit description"
      />

      <FieldRow label="Role">
        <Select
          value={serviceAccount.role === "owner" ? "admin" : serviceAccount.role}
          onValueChange={(v) => onRoleChange(v as Role)}
        >
          <SelectTrigger className="w-full max-w-56" aria-label="Role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow label="Created">
        <span className="typography-body text-foreground">
          {formatCreatedAtUtc(serviceAccount.createdAt)}
        </span>
      </FieldRow>

      <FieldRow label="Client ID">
        <span className="inline-flex items-center gap-1.5">
          <code className="font-mono typography-code text-foreground">
            {serviceAccount.clientId}
          </code>
          <CopyButton
            value={serviceAccount.clientId}
            ariaLabel="Copy client ID"
          />
        </span>
      </FieldRow>

      <CliLine
        label="CLI"
        command={`bl service-account get ${serviceAccount.name}`}
      />
    </section>
  );
}

interface FieldRowProps {
  label: string;
  children: React.ReactNode;
}

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="typography-caption font-medium text-meta-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

interface InlineTextFieldProps {
  label: string;
  value: string;
  ariaLabel: string;
  onSave: (next: string) => void;
}

function InlineTextField({
  label,
  value,
  ariaLabel,
  onSave,
}: InlineTextFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(value);
  };

  const save = async () => {
    const next = draft.trim();
    if (next === "" || next === value) {
      cancel();
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 150));
    onSave(next);
    setSaving(false);
    setEditing(false);
  };

  return (
    <FieldRow label={label}>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void save();
              } else if (event.key === "Escape") {
                cancel();
              }
            }}
            aria-label={ariaLabel}
            className="max-w-md"
            disabled={saving}
          />
          <Button
            type="button"
            variant="primary"
            onClick={() => void save()}
            disabled={saving}
          >
            Save
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={cancel}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="typography-body text-foreground">{value}</span>
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={startEdit}
            aria-label={ariaLabel}
          >
            <Pencil />
          </IconButton>
        </div>
      )}
    </FieldRow>
  );
}
