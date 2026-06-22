"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Field, FieldRow } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";
import type { AccountAdmin } from "@/lib/mock/account";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type InviteValues = z.infer<typeof inviteSchema>;

interface AddAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddAdminDialog({ open, onOpenChange }: AddAdminDialogProps) {
  const { addAdmin } = useAccountState();
  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = form;

  // Reset form state every time the dialog closes so reopening starts clean.
  useEffect(() => {
    if (!open) reset({ email: "" });
  }, [open, reset]);

  const onSubmit = handleSubmit(async ({ email }) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const now = new Date();
    const admin: AccountAdmin = {
      id: `adm_${Date.now()}`,
      // Pending rows show "Invited user" until the invite is accepted; the real
      // name is unknown until the invitee completes signup.
      name: "Invited user",
      email,
      role: "Admin",
      status: "pending",
      joinedAt: now.toISOString().slice(0, 10),
      invitedAt: now.toISOString(),
    };
    addAdmin(admin);
    toast.success(`Invitation sent to ${email}`);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add account admin</DialogTitle>
            <DialogDescription>
              Invite a person to help manage this billing account. Admins can
              manage account settings, billing-related configuration, and
              workspaces.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <FieldRow cols={1}>
              <Field
                label="Email address"
                error={errors.email?.message}
              >
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="email@example.com"
                  aria-invalid={errors.email ? true : undefined}
                  {...register("email")}
                />
              </Field>
            </FieldRow>
            <div className="mt-4 flex flex-col gap-1">
              <span className="typography-caption text-muted-foreground">Role</span>
              <span className="typography-body text-foreground">Admin</span>
              <span className="typography-caption text-muted-foreground">
                Owner cannot be reassigned.
              </span>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? "Sending…" : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
