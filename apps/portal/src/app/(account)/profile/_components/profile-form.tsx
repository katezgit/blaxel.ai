"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@repo/ui/components/input";
import DirtyActionBar from "@/app/(manage)/_components/dirty-action-bar";
import { Field, FieldRow, Panel } from "@/app/(manage)/_components/page-primitives";
import type { ProfileIdentity } from "@/lib/mock/profile";

const profileSchema = z.object({
  givenName: z
    .string()
    .min(1, "Given name is required")
    .max(80, "Given name must be 80 characters or fewer"),
  familyName: z
    .string()
    .min(1, "Family name is required")
    .max(80, "Family name must be 80 characters or fewer"),
});

type ProfileValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  identity: ProfileIdentity;
}

export default function ProfileForm({ identity }: ProfileFormProps) {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      givenName: identity.givenName,
      familyName: identity.familyName,
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, errors, isValid },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    reset(values);
  });

  return (
    <Panel title="Identity">
      <form onSubmit={onSubmit} noValidate>
        <FieldRow cols={2}>
          <Field label="Given name" error={errors.givenName?.message}>
            <Input
              aria-invalid={errors.givenName ? true : undefined}
              autoComplete="given-name"
              {...register("givenName")}
            />
          </Field>
          <Field label="Family name" error={errors.familyName?.message}>
            <Input
              aria-invalid={errors.familyName ? true : undefined}
              autoComplete="family-name"
              {...register("familyName")}
            />
          </Field>
        </FieldRow>

        <FieldRow
          cols={1}
          className="mt-4"
        >
          <Field
            label="Email"
            hint={
              identity.emailFromOAuth
                ? "Linked to your Google sign-in. Manage it from the provider."
                : undefined
            }
          >
            <Input
              type="email"
              value={identity.email}
              readOnly
              autoComplete="email"
            />
          </Field>
        </FieldRow>

        <DirtyActionBar
          isDirty={isDirty}
          onCancel={() => reset()}
          onSave={onSubmit}
          saving={isSubmitting}
          disableSave={!isValid}
          className="border-t-0 pt-0"
        />
      </form>
    </Panel>
  );
}
