"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { REGION_SLUGS, formatRegion } from "../_lib/region";

const DEFAULT_REGION = REGION_SLUGS[0];

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
  region: z.string().min(1, "Region is required"),
});

type Values = z.infer<typeof schema>;

interface AddDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddDomainDialog({ open, onOpenChange }: AddDomainDialogProps) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", region: DEFAULT_REGION },
    mode: "onChange",
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = form;

  useEffect(() => {
    if (!open) reset({ name: "", region: DEFAULT_REGION });
  }, [open, reset]);

  const onSubmit = handleSubmit(async ({ name, region }) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    // Mocked: real path would POST to /domains and redirect to the new resource
    // in pending state. Keep the user-visible affordance honest.
    const { label, slug } = formatRegion(region);
    toast.success(
      `Registration started for ${name} in ${label} (${slug}) — publish DNS records and verify to activate.`,
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
              Register a domain name and pin it to a region. Once submitted,
              publish the DNS records Blaxel returns to your provider, then
              verify.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <FormField
              id="add-domain-name"
              label="Domain name"
              error={errors.name?.message}
              required
            >
              <Input
                type="text"
                autoComplete="off"
                placeholder="preview.acme.com"
                aria-required="true"
                {...register("name")}
              />
            </FormField>
            <FormField
              id="add-domain-region"
              label="Region"
              error={errors.region?.message}
              required
            >
              <Controller
                control={control}
                name="region"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="add-domain-region"
                      aria-label="Region"
                      aria-required="true"
                      aria-invalid={errors.region ? true : undefined}
                    >
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGION_SLUGS.map((slug) => {
                        const { flag, label } = formatRegion(slug);
                        return (
                          <SelectItem key={slug} value={slug}>
                            <span aria-hidden="true">{flag}</span>{" "}
                            <span>{label}</span>{" "}
                            <span className="font-mono text-muted-foreground">
                              ({slug})
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <p className="typography-caption text-muted-foreground">
              Registering covers every subdomain (e.g.{" "}
              <span className="font-mono">*.preview.acme.com</span>). Region is
              permanent — to move a domain to another region, delete and
              re-register.
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
