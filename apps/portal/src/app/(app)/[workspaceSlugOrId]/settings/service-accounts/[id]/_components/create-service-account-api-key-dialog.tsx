"use client";

import { useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
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
import type {
  ServiceAccount,
  ServiceAccountApiKey,
} from "@/lib/mock/types";
import { SecretReveal } from "../../../_components/secret-reveal";
import ExpiryNeverConfirm from "../../_components/expiry-never-confirm";
import {
  EXPIRY_OPTIONS,
  type ExpiryOption,
  expiresInToIsoDate,
  randomKeyValue,
} from "../../_components/create-shared";

const FORM_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Key name is required.")
    .max(48, "Max 48 characters."),
  expiresIn: z.enum(
    EXPIRY_OPTIONS.map((o) => o.value) as [ExpiryOption, ...ExpiryOption[]],
  ),
});

type FormValues = z.infer<typeof FORM_SCHEMA>;

interface RevealedKey {
  apiKey: ServiceAccountApiKey;
  value: string;
}

interface CreateServiceAccountApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceAccount: ServiceAccount;
  onCreated: (key: ServiceAccountApiKey) => void;
}

export default function CreateServiceAccountApiKeyDialog({
  open,
  onOpenChange,
  serviceAccount,
  onCreated,
}: CreateServiceAccountApiKeyDialogProps) {
  const [revealed, setRevealed] = useState<RevealedKey | null>(null);

  const handleDone = () => {
    setRevealed(null);
    onOpenChange(false);
  };

  if (revealed) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="md">
          <PostCreateKeyReveal
            serviceAccount={serviceAccount}
            revealed={revealed}
            onDone={handleDone}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <CreateKeyForm
          serviceAccount={serviceAccount}
          onCancel={() => onOpenChange(false)}
          onCreated={(rev) => {
            setRevealed(rev);
            onCreated(rev.apiKey);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

interface CreateKeyFormProps {
  serviceAccount: ServiceAccount;
  onCancel: () => void;
  onCreated: (revealed: RevealedKey) => void;
}

function CreateKeyForm({
  serviceAccount,
  onCancel,
  onCreated,
}: CreateKeyFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(FORM_SCHEMA),
    defaultValues: { name: "", expiresIn: "90d" },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    await new Promise((r) => setTimeout(r, 150));
    const fullKey = randomKeyValue();
    const apiKey: ServiceAccountApiKey = {
      id: `sak_${Date.now()}`,
      serviceAccountId: serviceAccount.id,
      name: values.name,
      keyPrefix: fullKey.slice(0, 12),
      expiresAt: expiresInToIsoDate(values.expiresIn),
      createdAt: new Date().toISOString(),
    };
    onCreated({ apiKey, value: fullKey });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Create API key</DialogTitle>
        <DialogDescription>
          Issued to:{" "}
          <span className="font-mono text-foreground">
            {serviceAccount.name}
          </span>
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="flex flex-col gap-4">
        <FormField
          id="sa-key-name"
          label="Key name"
          error={errors.name?.message}
          required
        >
          <Input
            {...register("name")}
            placeholder="e.g. prod-deploy-key"
            autoComplete="off"
          />
        </FormField>
        <FormField id="sa-key-expires" label="Expires in">
          <Controller
            control={control}
            name="expiresIn"
            render={({ field }) => (
              <ExpiryNeverConfirm
                value={field.value}
                onChange={field.onChange}
                selectId="sa-key-expires"
              />
            )}
          />
        </FormField>
      </DialogBody>
      <DialogFooter>
        {isDirty && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          Create API key
        </Button>
      </DialogFooter>
    </form>
  );
}

interface PostCreateKeyRevealProps {
  serviceAccount: ServiceAccount;
  revealed: RevealedKey;
  onDone: () => void;
}

function PostCreateKeyReveal({
  serviceAccount,
  revealed,
  onDone,
}: PostCreateKeyRevealProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Check aria-hidden="true" className="size-4 text-state-scored" />
          API key created
        </DialogTitle>
        <DialogDescription>
          &ldquo;{revealed.apiKey.name}&rdquo; created for {serviceAccount.name}.
          Save this key now &mdash; it will not be shown again.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="flex flex-col gap-3">
        <SecretReveal label="API key" value={revealed.value} sensitive />
        <p className="typography-caption text-state-warning-text">
          The API key will not be shown again.
        </p>
      </DialogBody>
      <DialogFooter>
        <Button variant="primary" onClick={onDone}>
          Done
        </Button>
      </DialogFooter>
    </>
  );
}
