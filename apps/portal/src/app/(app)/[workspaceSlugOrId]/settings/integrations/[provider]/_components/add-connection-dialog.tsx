"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import type { Integration } from "@/lib/mock/types";

const FORM_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(48, "Max 48 characters.")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only."),
  apiKey: z.string().min(1, "API key is required."),
});

type FormValues = z.infer<typeof FORM_SCHEMA>;

interface AddConnectionDialogProps {
  provider: Integration;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export default function AddConnectionDialog({
  provider,
  open,
  onOpenChange,
  onCreated,
}: AddConnectionDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(FORM_SCHEMA),
    mode: "onChange",
    defaultValues: {
      name: `${provider.id}-${randomSuffix()}`,
      apiKey: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset({ name: `${provider.id}-${randomSuffix()}`, apiKey: "" });
    }
  }, [open, provider.id, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((r) => setTimeout(r, 150));
    toast.success(`${values.name} connected to ${provider.name}.`);
    onCreated?.();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Create {provider.name} integration</DialogTitle>
            <DialogDescription>{provider.description}</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <FormField
                  id={`${provider.id}-create-name`}
                  label="Name"
                  helper="Identifier. Cannot be changed after creation."
                  error={errors.name?.message}
                >
                  <Input {...field} className="font-mono" autoComplete="off" />
                </FormField>
              )}
            />
            <Controller
              control={control}
              name="apiKey"
              render={({ field }) => (
                <FormField
                  id={`${provider.id}-create-key`}
                  label="API key"
                  required
                  error={errors.apiKey?.message}
                >
                  <Input
                    {...field}
                    type="password"
                    placeholder="sk_…"
                    autoComplete="off"
                    className="font-mono"
                  />
                </FormField>
              )}
            />
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
              {isSubmitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}
