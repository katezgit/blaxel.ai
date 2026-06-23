"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
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
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { queryKeys } from "@/lib/query/keys";
import { createPolicy } from "@/lib/mock/policies";
import type {
  Policy,
  PolicyLocation,
  PolicyMaxTokens,
} from "@/lib/mock/policies";
import {
  FieldGroup,
  FlavorUnavailableNotice,
  IdentityEditableFields,
  LocationBody,
  PolicyTypeSelectField,
  ResourceTypesField,
  TokenUsageBody,
} from "@/app/(app)/[workspaceSlugOrId]/(resources)/policies/_components/policy-form/form-pieces";
import {
  policyFormSchema,
  type LocationItem,
  type PolicyFormValues,
  type TokenLimits,
} from "@/app/(app)/[workspaceSlugOrId]/(resources)/policies/_components/policy-form/form-schema";

interface DuplicatePolicyDrawerProps {
  source: Policy | null;
  workspaceSlug: string;
  onClose: () => void;
}

export function DuplicatePolicyDrawer({
  source,
  workspaceSlug,
  onClose,
}: DuplicatePolicyDrawerProps) {
  return (
    <Drawer
      direction="right"
      open={source !== null}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DrawerContent size="lg" aria-describedby={undefined}>
        {source !== null && (
          <DuplicatePolicyForm
            key={source.metadata.name}
            source={source}
            workspaceSlug={workspaceSlug}
            onClose={onClose}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

interface DuplicatePolicyFormProps {
  source: Policy;
  workspaceSlug: string;
  onClose: () => void;
}

function DuplicatePolicyForm({
  source,
  workspaceSlug,
  onClose,
}: DuplicatePolicyFormProps) {
  const router = useRouter();
  const { accountId, workspaceId } = useCurrentTenancy();
  const queryClient = useQueryClient();

  const initialName = `${source.metadata.name}-copy`;
  const initialDisplay = source.metadata.displayName
    ? `${source.metadata.displayName} (copy)`
    : initialName;

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    mode: "onChange",
    defaultValues: {
      displayName: initialDisplay,
      name: initialName,
      resourceTypes: [...source.spec.resourceTypes],
      policyType: source.spec.type,
    },
  });

  const [locations, setLocations] = useState<ReadonlyArray<LocationItem>>(
    () => [...(source.spec.locations ?? [])],
  );
  const [tokenLimits, setTokenLimits] = useState<TokenLimits>(() => {
    const m = source.spec.maxTokens;
    return {
      input: m?.input ?? 0,
      output: m?.output ?? 0,
      total: m?.total ?? 0,
      step: m?.step ?? 1,
      granularity: m?.granularity ?? "month",
    };
  });

  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Duplicate is always "dirty" by definition — the form opens with a new
  // name suffix and the user has actively initiated a create. Always gate
  // the cancel path through the discard confirm.
  function requestClose() {
    setConfirmDiscard(true);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const policyLocations: ReadonlyArray<PolicyLocation> | undefined =
      values.policyType === "location" ? locations : undefined;
    const policyMaxTokens: PolicyMaxTokens | undefined =
      values.policyType === "maxToken"
        ? {
            granularity: tokenLimits.granularity,
            step: tokenLimits.step,
            input: tokenLimits.input,
            output: tokenLimits.output,
            total: tokenLimits.total,
            ratioInputOverOutput:
              source.spec.maxTokens?.ratioInputOverOutput ?? 0,
          }
        : undefined;

    await createPolicy(accountId, workspaceId, {
      displayName: values.displayName,
      name: values.name,
      type: values.policyType,
      resourceTypes: values.resourceTypes,
      ...(policyLocations !== undefined ? { locations: policyLocations } : {}),
      ...(policyMaxTokens !== undefined ? { maxTokens: policyMaxTokens } : {}),
      labels: { ...source.metadata.labels },
      createdBy: "alex@cubic.dev",
      workspace: source.metadata.workspace,
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.resources(accountId, workspaceId),
      predicate: (query) => query.queryKey.includes("policies"),
    });
    onClose();
    router.push(`/${workspaceSlug}/policies/${values.name}`);
    toast.success(`Policy '${values.displayName}' created.`);
  });

  const policyType = form.watch("policyType");

  return (
    <>
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex h-full min-h-0 flex-col"
      >
        <DrawerHeader className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <DrawerTitle>Duplicate policy</DrawerTitle>
            <DrawerDescription>
              Start from{" "}
              <code className="inline-flex items-center rounded-sm border border-border bg-muted-surface px-1.5 py-0.5 font-mono font-medium text-foreground typography-code">
                {source.metadata.name}
              </code>
              {" "}and adjust before saving — values copy across, name is
              yours to set.
            </DrawerDescription>
          </div>
          <DrawerCloseButton
            onClick={(event) => {
              event.preventDefault();
              setConfirmDiscard(true);
            }}
          />
        </DrawerHeader>

        <DrawerBody className="flex flex-col gap-6">
          <PolicyTypeSelectField form={form} />

          {policyType === "location" ? (
            <FieldGroup label="Allowed locations">
              <LocationBody value={locations} onChange={setLocations} />
            </FieldGroup>
          ) : null}
          {policyType === "maxToken" ? (
            <FieldGroup label="Token limits">
              <TokenUsageBody value={tokenLimits} onChange={setTokenLimits} />
            </FieldGroup>
          ) : null}
          {policyType === "flavor" ? <FlavorUnavailableNotice /> : null}

          <FieldGroup
            label="Workload types"
            hint="Attaches only to the workload types selected here."
          >
            <ResourceTypesField form={form} />
          </FieldGroup>

          <IdentityEditableFields form={form} />
        </DrawerBody>

        <DrawerFooter className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={requestClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating…" : "Create policy"}
          </Button>
        </DrawerFooter>
      </form>

      <DiscardChangesDialog
        open={confirmDiscard}
        onCancel={() => setConfirmDiscard(false)}
        onDiscard={() => {
          setConfirmDiscard(false);
          onClose();
        }}
      />
    </>
  );
}

interface DiscardChangesDialogProps {
  open: boolean;
  onCancel: () => void;
  onDiscard: () => void;
}

function DiscardChangesDialog({
  open,
  onCancel,
  onDiscard,
}: DiscardChangesDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Discard duplicate?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="typography-body text-foreground">
            Close the drawer without creating the duplicate?
          </p>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Keep editing
          </Button>
          <Button type="button" variant="destructive" onClick={onDiscard}>
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
