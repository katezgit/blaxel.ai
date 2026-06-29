"use client";

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
import type { Integration, IntegrationConnection } from "@/lib/mock/types";

const FORM_SCHEMA = z.object({
  apiKey: z.string().min(1, "API key is required."),
});

type FormValues = z.infer<typeof FORM_SCHEMA>;

interface RotateConnectionKeyDialogProps {
  provider: Integration;
  connection: IntegrationConnection | null;
  onClose: () => void;
}

export default function RotateConnectionKeyDialog({
  provider,
  connection,
  onClose,
}: RotateConnectionKeyDialogProps) {
  return (
    <Dialog
      open={connection !== null}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent size="sm">
        {connection !== null && (
          <RotateForm
            key={connection.id}
            provider={provider}
            connection={connection}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface RotateFormProps {
  provider: Integration;
  connection: IntegrationConnection;
  onClose: () => void;
}

function RotateForm({ provider, connection, onClose }: RotateFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(FORM_SCHEMA),
    mode: "onChange",
    defaultValues: { apiKey: "" },
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 150));
    toast.success(`${connection.id} API key rotated.`);
    onClose();
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogHeader>
        <DialogTitle>
          Rotate API key for{" "}
          <span className="font-mono">{connection.id}</span>
        </DialogTitle>
        <DialogDescription>
          Replace the {provider.name} credential for this connection. Agents
          using the previous key will start receiving 401 responses immediately.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="flex flex-col gap-4">
        <Controller
          control={control}
          name="apiKey"
          render={({ field }) => (
            <FormField
              id={`${provider.id}-rotate-key`}
              label="New API key"
              required
              error={errors.apiKey?.message}
            >
              <Input
                {...field}
                type="password"
                placeholder="sk_…"
                autoComplete="off"
                className="font-mono"
                autoFocus
              />
            </FormField>
          )}
        />
      </DialogBody>
      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? "Rotating…" : "Rotate key"}
        </Button>
      </DialogFooter>
    </form>
  );
}
