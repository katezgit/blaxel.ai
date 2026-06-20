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
import {
  SegmentedControl,
} from "@repo/ui/components/segmented-control";
import type {
  ApiKey,
  ApiKeyHolder,
  ServiceAccount,
  TeamMember,
} from "@/lib/mock/types";
import {
  SecretReveal,
  SecretWarning,
} from "../../_components/secret-reveal";

const FORM_SCHEMA = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(48, "Max 48 characters."),
    holderKind: z.enum(["member", "service-account"]),
    holderId: z.string().min(1, "Select a holder."),
    expiresIn: z.enum(["never", "30", "90", "365"]),
  });

type FormValues = z.infer<typeof FORM_SCHEMA>;

const EXPIRY_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "365 days" },
] as const;

interface CreatedKey {
  key: ApiKey;
  secret: string;
}

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: ReadonlyArray<TeamMember>;
  serviceAccounts: ReadonlyArray<ServiceAccount>;
  onCreated: (key: ApiKey) => void;
}

export default function CreateApiKeyDialog({
  open,
  onOpenChange,
  members,
  serviceAccounts,
  onCreated,
}: CreateApiKeyDialogProps) {
  const [created, setCreated] = useState<CreatedKey | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FORM_SCHEMA),
    defaultValues: {
      name: "",
      holderKind: "service-account",
      holderId: "",
      expiresIn: "90",
    },
  });

  const holderKind = watch("holderKind");

  const holderOptions =
    holderKind === "member"
      ? members.map((m) => ({ value: m.id, label: `${m.name} (${m.email})` }))
      : serviceAccounts.map((s) => ({ value: s.id, label: s.name }));

  const handleClose = (next: boolean) => {
    if (!next) {
      reset();
      setCreated(null);
    }
    onOpenChange(next);
  };

  const onSubmit = async (values: FormValues) => {
    await new Promise((r) => setTimeout(r, 150));
    const holder: ApiKeyHolder = (() => {
      if (values.holderKind === "member") {
        const m = members.find((m) => m.id === values.holderId);
        return {
          kind: "member" as const,
          id: values.holderId,
          name: m?.name ?? "Unknown",
        };
      }
      const svc = serviceAccounts.find((s) => s.id === values.holderId);
      return {
        kind: "service-account" as const,
        id: values.holderId,
        name: svc?.name ?? "Unknown",
      };
    })();
    const fullKey = `bxl_live_${randomHex(40)}`;
    const masked = `bxl_xxxx…${fullKey.slice(-4)}`;
    const now = new Date();
    const expiresAt =
      values.expiresIn === "never"
        ? null
        : new Date(now.getTime() + Number(values.expiresIn) * 86400000)
            .toISOString()
            .slice(0, 10);
    const apiKey: ApiKey = {
      id: `wsk_${Date.now()}`,
      name: values.name,
      masked,
      createdAt: now.toISOString().slice(0, 10),
      expiresAt,
      issuedTo: holder,
    };
    setCreated({ key: apiKey, secret: fullKey });
    onCreated(apiKey);
  };

  const acknowledge = () => {
    reset();
    setCreated(null);
    onOpenChange(false);
  };

  if (created) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check aria-hidden="true" className="size-4 text-state-scored" />
              API key created
            </DialogTitle>
            <DialogDescription>
              Save the key now — Blaxel will only show it this once.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-3">
            <SecretReveal
              label="Name"
              value={created.key.name}
              sensitive={false}
            />
            <SecretReveal
              label="API key"
              value={created.secret}
              sensitive
            />
            <SecretWarning
              title="One-time reveal"
              description="Closing this dialog discards the secret permanently."
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
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              Issue a workspace-scoped key. The holder&apos;s role decides what
              the key can do.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <FormField
              id="api-key-name"
              label="Name"
              helper="A short identifier — shown in logs and the dashboard."
              error={errors.name?.message}
              required
            >
              <Input
                {...register("name")}
                placeholder="runtime-default"
                autoComplete="off"
              />
            </FormField>
            <FormField id="api-key-holder-kind" label="Holder">
              <Controller
                control={control}
                name="holderKind"
                render={({ field }) => (
                  <SegmentedControl
                    className="self-start"
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      resetField("holderId", { defaultValue: "" });
                    }}
                    aria-label="Holder type"
                  >
                    <SegmentedControl.Item value="service-account">
                      Service account
                    </SegmentedControl.Item>
                    <SegmentedControl.Item value="member">
                      Member
                    </SegmentedControl.Item>
                  </SegmentedControl>
                )}
              />
            </FormField>
            <FormField
              id="api-key-holder"
              label={holderKind === "member" ? "Member" : "Service account"}
              error={errors.holderId?.message}
              required
            >
              <Controller
                control={control}
                name="holderId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="api-key-holder" aria-invalid={!!errors.holderId}>
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {holderOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField id="api-key-expires" label="Expires in">
              <Controller
                control={control}
                name="expiresIn"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="api-key-expires">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
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
              Create key
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
