"use client";

import { useEffect, useId, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogCancelButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import type { Model } from "../_data/types";

const FORK_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(64, "Max 64 characters."),
});

type FormValues = z.infer<typeof FORK_SCHEMA>;

type ForkModelDialogProps = {
  model: Pick<
    Model,
    "id" | "displayName" | "apiName" | "activeCheckpointId" | "activeCheckpointStep"
  >;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ForkModelDialog({ model, open, onOpenChange }: ForkModelDialogProps) {
  const nameId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const defaultName = `${model.apiName}-fork`;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FORK_SCHEMA),
    defaultValues: { name: defaultName },
  });

  const { ref: nameRegisterRef, ...nameRegister } = register("name");

  // Radix keeps the panel mounted across open/close — without this the next open
  // would show the previous attempt's typed value.
  useEffect(() => {
    if (!open) reset({ name: defaultName });
  }, [open, defaultName, reset]);

  const subtitle =
    model.activeCheckpointStep !== null
      ? `Create a new model from ${model.displayName} · step ${model.activeCheckpointStep}.`
      : `Create a new model from ${model.displayName}'s current checkpoint.`;

  const onSubmit = async ({ name }: FormValues) => {
    await new Promise((r) => setTimeout(r, 250));
    toast.success(`Forked as "${name}"`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="sm"
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          nameInputRef.current?.focus();
          nameInputRef.current?.select();
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Fork {model.displayName}</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <p className="typography-body text-foreground">{subtitle}</p>

            <FormField
              id={nameId}
              label="Name"
              error={errors.name?.message}
              required
            >
              <Input
                {...nameRegister}
                ref={(node) => {
                  nameRegisterRef(node);
                  nameInputRef.current = node;
                }}
                autoComplete="off"
                spellCheck={false}
                disabled={isSubmitting}
                className="font-mono"
              />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <DialogCancelButton disabled={isSubmitting} />
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Forking…" : "Fork"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
