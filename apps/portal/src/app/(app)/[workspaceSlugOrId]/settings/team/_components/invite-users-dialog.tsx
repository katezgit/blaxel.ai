"use client";

import { useEffect, type KeyboardEvent } from "react";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@repo/ui/components/textarea";
import type { Role } from "@/lib/mock/types";
import { ROLE_META } from "./team-mock-helpers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmails(text: string): {
  valid: ReadonlyArray<string>;
  invalid: ReadonlyArray<string>;
} {
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const part of text
    .split(/[\s,;]+/)
    .map((p) => p.trim())
    .filter(Boolean)) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (EMAIL_REGEX.test(part)) valid.push(part);
    else invalid.push(part);
  }
  return { valid, invalid };
}

const FORM_SCHEMA = z.object({
  emailsText: z
    .string()
    .refine((text) => parseEmails(text).valid.length > 0, {
      message: "Add at least one valid email.",
    }),
  role: z.enum(["admin", "member"]),
});

type FormValues = z.infer<typeof FORM_SCHEMA>;

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
  onSubmit: onInvite,
}: InviteUsersDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FORM_SCHEMA),
    defaultValues: { emailsText: "", role: "member" },
  });

  useEffect(() => {
    if (open) return;
    reset({ emailsText: "", role: "member" });
  }, [open, reset]);

  const onValid = ({ emailsText, role }: FormValues) => {
    const { valid } = parseEmails(emailsText);
    if (valid.length === 0) return;
    onInvite({ emails: valid, role });
  };

  const onSubmitForm = handleSubmit(onValid);

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onSubmitForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <form onSubmit={onSubmitForm}>
          <DialogHeader>
            <DialogTitle>Invite members</DialogTitle>
            <DialogDescription>
              Each invitee gets an email link to join this workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <FormField
              id="invite-emails"
              label="Emails"
              helper="Separate with commas, spaces, or newlines."
              error={errors.emailsText?.message}
              required
            >
              <Controller
                control={control}
                name="emailsText"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="invite-emails"
                    placeholder="name@company.com, another@company.com"
                    rows={4}
                    onKeyDown={handleTextareaKeyDown}
                  />
                )}
              />
            </FormField>
            <InvalidEmailsHint control={control} />
            <FormField id="invite-role" label="Role">
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as Role)}
                  >
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
                )}
              />
            </FormField>
            <p className="typography-caption text-muted-foreground">
              Press <kbd className="font-mono">{"⌘"}</kbd> +{" "}
              <kbd className="font-mono">Enter</kbd> to send.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <ValidCountSubmit control={control} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ValidCountSubmit({ control }: { control: Control<FormValues> }) {
  const emailsText = useWatch({ control, name: "emailsText" });
  const validCount = parseEmails(emailsText ?? "").valid.length;
  return (
    <Button type="submit" variant="primary" disabled={validCount === 0}>
      Invite {validCount > 0 ? `(${validCount})` : ""}
    </Button>
  );
}

function InvalidEmailsHint({ control }: { control: Control<FormValues> }) {
  const emailsText = useWatch({ control, name: "emailsText" });
  const { invalid } = parseEmails(emailsText ?? "");
  if (invalid.length === 0) return null;
  return (
    <p className="typography-caption text-state-errored">
      {invalid.length === 1
        ? `Skipped 1 invalid entry: ${invalid[0]}`
        : `Skipped ${invalid.length} invalid entries: ${invalid.join(", ")}`}
    </p>
  );
}
