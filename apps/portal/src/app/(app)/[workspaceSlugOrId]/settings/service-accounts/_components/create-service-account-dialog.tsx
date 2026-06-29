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
import { Switch } from "@repo/ui/components/switch";
import type {
  ServiceAccount,
  ServiceAccountApiKey,
} from "@/lib/mock/types";
import { SecretReveal } from "@/app/(app)/[workspaceSlugOrId]/settings/_components/secret-reveal";
import ExpiryNeverConfirm from "./expiry-never-confirm";
import {
  EXPIRY_OPTIONS,
  type ExpiryOption,
  expiresInToIsoDate,
  randomKeyValue,
  randomSecret,
} from "./create-shared";

const NAME_SCHEMA = z
  .string()
  .trim()
  .min(1, "Name is required.")
  .max(48, "Name must be 48 characters or fewer.");

const DESCRIPTION_SCHEMA = z
  .string()
  .trim()
  .min(1, "Description is required.")
  .max(256, "Description must be 256 characters or fewer.");

const FORM_SCHEMA = z
  .object({
    name: NAME_SCHEMA,
    description: DESCRIPTION_SCHEMA,
    alsoIssueKey: z.boolean(),
    keyName: z.string().trim().max(48, "Max 48 characters.").optional(),
    expiresIn: z.enum(EXPIRY_OPTIONS.map((o) => o.value) as [ExpiryOption, ...ExpiryOption[]]),
  })
  .refine(
    (values) =>
      !values.alsoIssueKey ||
      (values.keyName !== undefined && values.keyName.length > 0),
    {
      path: ["keyName"],
      message: "Key name is required.",
    },
  );

type FormValues = z.infer<typeof FORM_SCHEMA>;

interface RevealedCredentials {
  account: ServiceAccount;
  clientSecret: string;
  apiKeyValue: string | null;
  apiKeyName: string | null;
}

interface CreateServiceAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (account: ServiceAccount) => void;
}

export default function CreateServiceAccountDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateServiceAccountDialogProps) {
  const [created, setCreated] = useState<RevealedCredentials | null>(null);

  // Dialog close from any source (Done, X, Esc, overlay click) clears the
  // reveal — otherwise the next open would replay the previous credentials.
  const handleOpenChange = (next: boolean) => {
    if (!next) setCreated(null);
    onOpenChange(next);
  };

  if (created) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          size="md"
          // DialogDescription intentionally omitted — consequence prose lives in
          // DialogBody so it gets body typography. aria-describedby={undefined}
          // silences Radix's missing-description warning.
          aria-describedby={undefined}
        >
          <PostCreateReveal
            credentials={created}
            onDone={() => handleOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <CreateForm
          onCancel={() => handleOpenChange(false)}
          onCreated={(creds) => {
            setCreated(creds);
            onCreated(creds.account);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

interface CreateFormProps {
  onCancel: () => void;
  onCreated: (credentials: RevealedCredentials) => void;
}

function CreateForm({ onCancel, onCreated }: CreateFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(FORM_SCHEMA),
    defaultValues: {
      name: "",
      description: "",
      alsoIssueKey: false,
      keyName: "",
      expiresIn: "90d",
    },
    mode: "onSubmit",
  });

  const alsoIssueKey = watch("alsoIssueKey");

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    await new Promise((r) => setTimeout(r, 200));
    const accountId = `svc_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const apiKeyValue = values.alsoIssueKey ? randomKeyValue() : null;
    const apiKey: ServiceAccountApiKey | null = apiKeyValue
      ? {
          id: `sak_${Date.now()}`,
          serviceAccountId: accountId,
          name: values.keyName ?? "",
          keyPrefix: apiKeyValue.slice(0, 12),
          expiresAt: expiresInToIsoDate(values.expiresIn),
          createdAt: nowIso,
        }
      : null;

    const account: ServiceAccount = {
      id: accountId,
      name: values.name,
      description: values.description,
      clientId: `bxl_sa_${randomSecret(12)}`,
      createdAt: nowIso,
      updatedAt: nowIso,
      apiKeys: apiKey ? [apiKey] : [],
      lastUsedAt: null,
    };
    onCreated({
      account,
      clientSecret: randomSecret(32),
      apiKeyValue,
      apiKeyName: apiKey?.name ?? null,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Create service account</DialogTitle>
        <DialogDescription>
          Service accounts hold credentials that act on this workspace.
          Permissions are assigned on the Team page after creation.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="flex flex-col gap-4">
        <FormField
          id="svc-name"
          label="Name"
          helper="1–48 characters. Use a descriptive name — you can't change it."
          error={errors.name?.message}
          required
        >
          <Input
            {...register("name")}
            placeholder="e.g. github-actions-deploy"
            autoComplete="off"
          />
        </FormField>
        <FormField
          id="svc-description"
          label="Description"
          error={errors.description?.message}
          required
        >
          <Input
            {...register("description")}
            placeholder="e.g. Deploy pipeline for the main branch"
            autoComplete="off"
          />
        </FormField>
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="svc-also-issue-key"
              className="typography-body text-foreground"
            >
              Also issue an API key now
            </label>
            <Controller
              control={control}
              name="alsoIssueKey"
              render={({ field }) => (
                <Switch
                  id="svc-also-issue-key"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          {alsoIssueKey && (
            <>
              <FormField
                id="svc-key-name"
                label="Key name"
                error={errors.keyName?.message}
                required
              >
                <Input
                  {...register("keyName")}
                  placeholder="e.g. prod-deploy-key"
                  autoComplete="off"
                />
              </FormField>
              <FormField id="svc-expires-in" label="Expires in">
                <Controller
                  control={control}
                  name="expiresIn"
                  render={({ field }) => (
                    <ExpiryNeverConfirm
                      value={field.value}
                      onChange={field.onChange}
                      selectId="svc-expires-in"
                    />
                  )}
                />
              </FormField>
            </>
          )}
        </div>
      </DialogBody>
      <DialogFooter>
        {isDirty && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          Create
        </Button>
      </DialogFooter>
    </form>
  );
}

interface PostCreateRevealProps {
  credentials: RevealedCredentials;
  onDone: () => void;
}

function PostCreateReveal({ credentials, onDone }: PostCreateRevealProps) {
  const { account, clientSecret, apiKeyValue, apiKeyName } = credentials;
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Check aria-hidden="true" className="size-4 text-state-scored" />
          Service account created
        </DialogTitle>
      </DialogHeader>
      <DialogBody className="flex flex-col gap-3">
        <p className="text-foreground">
          {apiKeyValue !== null ? (
            <>
              Service account &ldquo;{account.name}&rdquo; created with API key
              &ldquo;{apiKeyName}&rdquo;. Save these credentials now &mdash;
              they will not be shown again.
            </>
          ) : (
            <>
              Service account &ldquo;{account.name}&rdquo; created. Save these
              credentials now &mdash; the client secret will not be shown again.
            </>
          )}
        </p>
        <SecretReveal
          label="Client ID"
          value={account.clientId}
          sensitive={false}
        />
        <SecretReveal
          label="Client secret"
          value={clientSecret}
          sensitive
        />
        {apiKeyValue !== null && (
          <SecretReveal label="API key" value={apiKeyValue} sensitive />
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="primary" onClick={onDone}>
          Done
        </Button>
      </DialogFooter>
    </>
  );
}
