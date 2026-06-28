"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@repo/ui/components/button";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import type { ServiceAccount } from "@/lib/mock/types";

// Drawer state mirrors the EditPolicyDrawer + delete-dialog shape:
// null = closed, ServiceAccount = open with that record prefilled.
export type EditServiceAccountDrawerState = ServiceAccount | null;

// Mirrors create-service-account-dialog.tsx so the validation feels identical
// on both create and edit surfaces.
const FORM_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(48, "Name must be 48 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(256, "Description must be 256 characters or fewer."),
});

type FormValues = z.infer<typeof FORM_SCHEMA>;

interface EditServiceAccountDrawerProps {
  state: EditServiceAccountDrawerState;
  onSave: (next: { name: string; description: string }) => void;
  onClose: () => void;
}

export default function EditServiceAccountDrawer({
  state,
  onSave,
  onClose,
}: EditServiceAccountDrawerProps) {
  return (
    <Drawer
      direction="right"
      open={state !== null}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DrawerContent size="md" aria-describedby={undefined}>
        {state !== null && (
          <EditForm
            key={state.id}
            serviceAccount={state}
            onSave={onSave}
            onClose={onClose}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

interface EditFormProps {
  serviceAccount: ServiceAccount;
  onSave: (next: { name: string; description: string }) => void;
  onClose: () => void;
}

function EditForm({ serviceAccount, onSave, onClose }: EditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(FORM_SCHEMA),
    mode: "onChange",
    defaultValues: {
      name: serviceAccount.name,
      description: serviceAccount.description,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    await new Promise((r) => setTimeout(r, 200));
    onSave({ name: values.name, description: values.description });
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex h-full min-h-0 flex-col"
    >
      <DrawerHeader className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <DrawerTitle>Edit service account</DrawerTitle>
          <DrawerDescription>
            Update the display name and description.
          </DrawerDescription>
        </div>
        <DrawerCloseButton />
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-4">
        <FormField
          id="edit-svc-name"
          label="Name"
          helper="1–48 characters."
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
          id="edit-svc-description"
          label="Description"
          helper="What this service account is used for."
          error={errors.description?.message}
          required
        >
          <Input
            {...register("description")}
            placeholder="e.g. Deploy pipeline for the main branch"
            autoComplete="off"
          />
        </FormField>
      </DrawerBody>

      <DrawerFooter className="flex justify-end gap-2">
        {isDirty && (
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !isDirty || !isValid}
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </DrawerFooter>
    </form>
  );
}
