"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const ORG_SCHEMA = z.object({
  name: z.string().trim().min(1, "Organization name is required."),
  slug: z
    .string()
    .trim()
    .min(2, "URL slug must be at least 2 characters.")
    .regex(SLUG_REGEX, "Use lowercase letters, numbers, and hyphens."),
});

type OrgFormValues = z.infer<typeof ORG_SCHEMA>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEFAULT_NAME = "Acme Robotics";

export default function CreateOrganizationForm() {
  const router = useRouter();
  const slugTouchedRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrgFormValues>({
    resolver: zodResolver(ORG_SCHEMA),
    mode: "onChange",
    defaultValues: {
      name: DEFAULT_NAME,
      slug: slugify(DEFAULT_NAME),
    },
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");

  useEffect(() => {
    if (slugTouchedRef.current) return;
    const derived = slugify(nameValue ?? "");
    if (derived !== slugValue) {
      setValue("slug", derived, { shouldValidate: true, shouldDirty: false });
    }
  }, [nameValue, slugValue, setValue]);

  const nameRegister = register("name");
  const slugRegister = register("slug");

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    router.push("/onboarding/invite");
  });

  const submitDisabled =
    isSubmitting ||
    !nameValue?.trim() ||
    !SLUG_REGEX.test((slugValue ?? "").trim()) ||
    (slugValue ?? "").trim().length < 2;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <FormField id="org-logo" label="Logo (optional)">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              // Demo only — upload not wired. Operator review the visual; data flow is out of scope.
            }}
          >
            Upload logo
          </Button>
          <span className="font-mono typography-meta text-muted-foreground">
            Optional — add later in Settings
          </span>
        </div>
      </FormField>

      <FormField
        id="org-name"
        label="Organization name"
        required
        error={errors.name?.message}
      >
        <Input
          {...nameRegister}
          autoComplete="organization"
          autoFocus
          placeholder="Acme Robotics"
        />
      </FormField>

      <FormField
        id="org-slug"
        label="URL slug"
        required
        error={errors.slug?.message}
      >
        <Input
          {...slugRegister}
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
          leading={
            <span
              aria-hidden="true"
              className="typography-body text-muted-foreground select-none"
            >
              blaxel.ai/
            </span>
          }
          onChange={(event) => {
            slugTouchedRef.current = true;
            slugRegister.onChange(event);
          }}
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        className="mt-1 w-full"
        disabled={submitDisabled}
        aria-busy={isSubmitting}
      >
        Create organization
      </Button>
    </form>
  );
}
