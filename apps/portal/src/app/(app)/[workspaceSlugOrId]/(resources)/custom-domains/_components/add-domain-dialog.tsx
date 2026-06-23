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

const schema = z.object({
  // Loose DNS label check; the API is the real validator. A name with a dot and
  // no leading/trailing dot covers the canonical happy path without claiming to
  // parse FQDNs locally.
  name: z
    .string()
    .min(1, "Domain name is required")
    .regex(
      /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+(?<!-)$/,
      "Enter a domain name (e.g. preview.acme.com)",
    ),
});

type Values = z.infer<typeof schema>;

interface AddDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDomainDialog({ open, onOpenChange }: AddDomainDialogProps) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = form;

  useEffect(() => {
    if (!open) reset({ name: "" });
  }, [open, reset]);

  const onSubmit = handleSubmit(async ({ name }) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    // Mocked: real path would POST to /domains and redirect to the new resource
    // in pending state. Keep the user-visible affordance honest.
    toast.success(
      `Registration started for ${name} — publish DNS records and verify to activate.`,
    );
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add custom domain</DialogTitle>
            <DialogDescription>
              Register a domain name. Once submitted, publish the DNS records
              Blaxel returns to your provider, then verify.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <FieldRow cols={1}>
              <Field label="Domain name" error={errors.name?.message}>
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder="preview.acme.com"
                  aria-invalid={errors.name ? true : undefined}
                  {...register("name")}
                />
              </Field>
            </FieldRow>
            <p className="mt-4 typography-caption text-muted-foreground">
              Region defaults to the workspace default. Set a display name on
              the domain detail page after registration.
            </p>
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
              {isSubmitting ? "Registering…" : "Register domain"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
