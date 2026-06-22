"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
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
import type { Integration, IntegrationConnection } from "@/lib/mock/types";

// Drawer state: null = closed. Otherwise the mode + (for edit) the target
// connection. Combined "closed state + data" shape per the engineer rules —
// caller passes either `null` or the open payload, no parallel `open` flag.
export type DrawerState =
  | { mode: "create" }
  | { mode: "edit"; connection: IntegrationConnection }
  | null;

interface ConnectionDrawerProps {
  provider: Integration;
  state: DrawerState;
  onClose: () => void;
  /**
   * Fires after a successful create submit, just before the drawer closes.
   * Lets the caller route the user somewhere (e.g. catalog → detail page) once
   * the new connection exists. Edit-mode success has no equivalent hook — the
   * caller is already on the right surface.
   */
  onCreateSuccess?: () => void;
}

export default function ConnectionDrawer({
  provider,
  state,
  onClose,
  onCreateSuccess,
}: ConnectionDrawerProps) {
  const open = state !== null;

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DrawerContent size="md" aria-describedby={undefined}>
        {state?.mode === "create" && (
          <CreateConnectionForm
            provider={provider}
            onClose={onClose}
            onSuccess={onCreateSuccess}
          />
        )}
        {state?.mode === "edit" && (
          <EditConnectionForm
            key={state.connection.id}
            provider={provider}
            connection={state.connection}
            onClose={onClose}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

const CREATE_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(48, "Max 48 characters.")
    .regex(
      /^[a-z0-9-]+$/,
      "Lowercase letters, numbers, and hyphens only.",
    ),
  apiKey: z.string().min(1, "API key is required."),
});

type CreateValues = z.infer<typeof CREATE_SCHEMA>;

interface CreateConnectionFormProps {
  provider: Integration;
  onClose: () => void;
  onSuccess?: () => void;
}

function CreateConnectionForm({
  provider,
  onClose,
  onSuccess,
}: CreateConnectionFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateValues>({
    resolver: zodResolver(CREATE_SCHEMA),
    mode: "onChange",
    defaultValues: {
      name: `${provider.id}-${randomSuffix()}`,
      apiKey: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    toast.success(`${values.name} connected to ${provider.name}.`);
    onSuccess?.();
    onClose();
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <DrawerHeader className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar size="md" shape="square">
            {provider.logoUrl && (
              <AvatarImage src={provider.logoUrl} alt={provider.name} />
            )}
            <AvatarFallback>{provider.logoInitial}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <DrawerTitle className="text-subtitle">
              Create {provider.name} integration
            </DrawerTitle>
            <DrawerDescription>
              {provider.description}
            </DrawerDescription>
          </div>
        </div>
        <DrawerCloseButton />
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-4">
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
      </DrawerBody>

      <DrawerFooter className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!isValid}>
          Create
        </Button>
      </DrawerFooter>
    </form>
  );
}

interface EditConnectionFormProps {
  provider: Integration;
  connection: IntegrationConnection;
  onClose: () => void;
}

function EditConnectionForm({
  provider,
  connection,
  onClose,
}: EditConnectionFormProps) {
  // Field state machine: idle (showing masked preview) → focus → rotating
  // (cleared input, new key required) → cancel-rotate → idle. "Save changes"
  // is disabled outside `rotating` because there's nothing else to mutate —
  // name is immutable, key is the only knob.
  const [rotating, setRotating] = useState(false);
  const [newKey, setNewKey] = useState("");

  const canSave = rotating && newKey.trim().length > 0;

  const startRotate = () => {
    if (!rotating) setRotating(true);
  };

  const cancelRotate = () => {
    setRotating(false);
    setNewKey("");
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    toast.success(`${connection.id} API key rotated.`);
    onClose();
  };

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <DrawerHeader className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar size="md" shape="square">
            {provider.logoUrl && (
              <AvatarImage src={provider.logoUrl} alt={provider.name} />
            )}
            <AvatarFallback>{provider.logoInitial}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <DrawerTitle className="text-subtitle">
              Edit {connection.id}
            </DrawerTitle>
            <DrawerDescription>
              Rotate the {provider.name} API key for this connection.
            </DrawerDescription>
          </div>
        </div>
        <DrawerCloseButton />
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-4">
        <FormField
          id={`${provider.id}-edit-name`}
          label="Name"
          helper="Identifier. Cannot be changed after creation."
        >
          <Input
            value={connection.id}
            disabled
            readOnly
            className="font-mono"
          />
        </FormField>

        <FormField
          id={`${provider.id}-edit-key`}
          label="API key"
          helper={
            rotating
              ? "Enter a new key to replace the existing credential."
              : "Click the field to rotate this credential."
          }
        >
          <Input
            value={rotating ? newKey : connection.apiKeyPreview}
            onChange={(e) => setNewKey(e.target.value)}
            onFocus={startRotate}
            type={rotating ? "password" : "text"}
            placeholder={rotating ? "sk_…" : undefined}
            autoComplete="off"
            className="font-mono"
          />
        </FormField>
        {rotating && (
          <Button
            type="button"
            variant="link"
            onClick={cancelRotate}
            className="-mt-2 h-auto self-start py-1"
          >
            Cancel rotate
          </Button>
        )}
      </DrawerBody>

      <DrawerFooter className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!canSave}>
          Save changes
        </Button>
      </DrawerFooter>
    </form>
  );
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}
