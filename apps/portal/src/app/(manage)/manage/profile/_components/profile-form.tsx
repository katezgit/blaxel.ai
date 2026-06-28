"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Input } from "@repo/ui/components/input";
import DirtyActionBar from "@/app/(manage)/_components/dirty-action-bar";
import { Field, FieldRow, Panel } from "@/app/(manage)/_components/page-primitives";
import { userQueries } from "@/lib/query/user";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(80, "Name must be 80 characters or fewer"),
  email: z.email("Enter a valid email"),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { data: currentUser } = useSuspenseQuery(userQueries.current());
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser.name,
      email: currentUser.email,
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    reset(values);
  });

  return (
    <Panel title="Account">
      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-4">
          <FieldRow cols={1}>
            <Field label="Name" error={errors.name?.message}>
              <Input
                aria-invalid={errors.name ? true : undefined}
                {...register("name")}
              />
            </Field>
          </FieldRow>

          <FieldRow cols={1}>
            <Field label="Email" error={errors.email?.message}>
              <Input
                type="email"
                aria-invalid={errors.email ? true : undefined}
                {...register("email")}
              />
            </Field>
          </FieldRow>
        </div>

        <DirtyActionBar
          isDirty={isDirty}
          onCancel={() => reset()}
          onSave={onSubmit}
          saving={isSubmitting}
          className="border-t-0 pt-0"
        />
      </form>
    </Panel>
  );
}
