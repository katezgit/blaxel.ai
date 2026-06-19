"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { FormField } from "@repo/ui/components/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/cn";
import type { Role } from "@/lib/mock/types";
import { ROLE_META } from "./team-mock-helpers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailChip {
  value: string;
  valid: boolean;
}

export interface InviteResult {
  emails: ReadonlyArray<string>;
  role: Role;
}

interface InviteUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (result: InviteResult) => void;
}

const INVITE_ROLES: ReadonlyArray<Role> = ["admin", "member"];

export function InviteUsersDialog({
  open,
  onOpenChange,
  onSubmit,
}: InviteUsersDialogProps) {
  const [chips, setChips] = useState<EmailChip[]>([]);
  const [draft, setDraft] = useState("");
  const [role, setRole] = useState<Role>("member");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) return;
    setChips([]);
    setDraft("");
    setRole("member");
  }, [open]);

  const commitDraft = (raw: string) => {
    const parts = raw
      .split(/[\s,;]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setChips((prev) => {
      const seen = new Set(prev.map((c) => c.value.toLowerCase()));
      const next = [...prev];
      for (const value of parts) {
        if (seen.has(value.toLowerCase())) continue;
        seen.add(value.toLowerCase());
        next.push({ value, valid: EMAIL_REGEX.test(value) });
      }
      return next;
    });
    setDraft("");
  };

  const removeChip = (value: string) => {
    setChips((prev) => prev.filter((c) => c.value !== value));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft(draft);
      return;
    }
    if (event.key === "Backspace" && draft === "" && chips.length > 0) {
      event.preventDefault();
      const last = chips[chips.length - 1];
      if (!last) return;
      setChips((prev) => prev.slice(0, -1));
      setDraft(last.value);
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  const validEmails = [...chips, ...(draft.trim() ? [{ value: draft.trim(), valid: EMAIL_REGEX.test(draft.trim()) }] : [])]
    .filter((c) => c.valid)
    .map((c) => c.value);

  const handleSubmit = () => {
    commitDraft(draft);
    if (validEmails.length === 0) return;
    onSubmit({ emails: validEmails, role });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Invite users</DialogTitle>
          <DialogDescription>
            Invite multiple emails with the same role. They will receive a sign-up
            link.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <FormField
            id="invite-emails-group"
            label="Emails"
            helper="Press Enter or comma to add. Paste a CSV to add many at once."
          >
            <div
              role="group"
              className={cn(
                "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5",
                "focus-within:border-primary focus-within:shadow-focus-ring",
              )}
              onClick={() => inputRef.current?.focus()}
            >
              {chips.map((chip) => (
                <EmailChipView
                  key={chip.value}
                  chip={chip}
                  onRemove={() => removeChip(chip.value)}
                />
              ))}
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => commitDraft(draft)}
                onPaste={(event) => {
                  const text = event.clipboardData.getData("text");
                  if (/[\s,;]/.test(text)) {
                    event.preventDefault();
                    commitDraft(text);
                  }
                }}
                placeholder={chips.length === 0 ? "name@company.com" : ""}
                className="min-w-[10ch] flex-1 bg-transparent text-label text-foreground outline-none placeholder:text-meta-foreground"
                autoComplete="off"
                aria-label="Add invite email"
              />
            </div>
          </FormField>
          <FormField id="invite-role" label="Role">
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVITE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_META[r].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <p className="text-caption text-muted-foreground">
            Press <kbd className="font-mono">{"⌘"}</kbd> +{" "}
            <kbd className="font-mono">Enter</kbd> to send invites.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={validEmails.length === 0}
            onClick={handleSubmit}
          >
            Invite {validEmails.length > 0 ? `(${validEmails.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EmailChipViewProps {
  chip: EmailChip;
  onRemove: () => void;
}

function EmailChipView({ chip, onRemove }: EmailChipViewProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-caption font-medium",
        chip.valid
          ? "border-border bg-secondary-surface text-foreground"
          : "border-destructive/40 bg-destructive/5 text-destructive",
      )}
      title={chip.valid ? undefined : "Invalid email"}
    >
      <span className="font-mono">{chip.value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${chip.value}`}
        className="inline-flex size-4 items-center justify-center rounded-sm text-meta-foreground hover:bg-secondary-hover hover:text-foreground"
      >
        <X aria-hidden="true" className="size-3" />
      </button>
    </span>
  );
}
