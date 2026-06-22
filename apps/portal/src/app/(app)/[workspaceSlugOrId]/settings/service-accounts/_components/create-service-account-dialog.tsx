"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
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
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import type { ServiceAccount } from "@/lib/mock/types";

type InviteRole = "admin" | "member";
import {
  SecretReveal,
  SecretWarning,
} from "../../_components/secret-reveal";

const NAME_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(48, "Name must be 48 characters or fewer."),
  role: z.enum(["admin", "member"]),
});

type FormValues = z.infer<typeof NAME_SCHEMA>;

interface CreatedSecret {
  account: ServiceAccount;
  clientSecret: string;
}

interface CreateServiceAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (account: ServiceAccount) => void;
}

const ROLES: ReadonlyArray<InviteRole> = ["admin", "member"];

export default function CreateServiceAccountDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateServiceAccountDialogProps) {
  const [created, setCreated] = useState<CreatedSecret | null>(null);
  const [pendingClose, setPendingClose] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(NAME_SCHEMA),
    defaultValues: { name: "", role: "member" },
  });

  const handleClose = (open: boolean) => {
    if (!open && created) {
      setPendingClose(true);
      return;
    }
    if (!open) {
      reset();
      setCreated(null);
    }
    onOpenChange(open);
  };

  const onSubmit = async (values: FormValues) => {
    await new Promise((r) => setTimeout(r, 150));
    const account: ServiceAccount = {
      id: `svc_${Date.now()}`,
      name: values.name,
      clientId: `bxl_svc_${randomHex(12)}`,
      role: values.role,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const secret = `s4_${randomHex(32)}`;
    setCreated({ account, clientSecret: secret });
    onCreated(account);
  };

  const acknowledge = () => {
    setCreated(null);
    setPendingClose(false);
    reset();
    onOpenChange(false);
  };

  if (created) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check aria-hidden="true" className="size-4 text-state-scored" />
              Service account created
            </DialogTitle>
            <DialogDescription>
              Save the client secret now — Blaxel only shows it this once.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-3">
            <SecretReveal
              label="Client ID"
              value={created.account.clientId}
              sensitive={false}
            />
            <SecretReveal
              label="Client Secret"
              value={created.clientSecret}
              sensitive
            />
            {pendingClose && (
              <p className="typography-caption text-state-warning-text">
                Close without copying the secret? You will not see it again.
              </p>
            )}
            <SecretWarning
              title="One-time reveal"
              description="Once this dialog closes the secret is gone for good."
              onAcknowledge={acknowledge}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create service account</DialogTitle>
            <DialogDescription>
              Service accounts hold API keys that act on workspace resources.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <FormField
              id="svc-name"
              label="Name"
              helper="A short identifier — used in logs and the API."
              error={errors.name?.message}
              required
            >
              <Input {...register("name")} placeholder="ci-deploy" autoComplete="off" />
            </FormField>
            <FormField id="svc-role" label="Role">
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="svc-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r === "admin" ? "Admin" : "Member"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function randomHex(length: number) {
  let out = "";
  const chars = "0123456789abcdef";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
