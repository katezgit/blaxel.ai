"use client";

import { useState } from "react";
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
import { updatePolicy } from "@/lib/mock/policies";
import type { Policy } from "@/lib/mock/policies";
import {
  computeBodyDirty,
  FieldGroup,
  FlavorUnavailableNotice,
  IdentityEditableNameOnlyFields,
  LabelsEditor,
  LocationBody,
  PolicyTypeReadOnlyField,
  ResourceTypesField,
  TokenUsageBody,
} from "@/app/(app)/[workspaceSlugOrId]/(resources)/policies/_components/policy-form/form-pieces";
import {
  labelsEntriesToRecord,
  labelsRecordToEntries,
  POLICY_TYPE_BY_VALUE,
  policyFormSchema,
  type LocationItem,
  type PolicyFormValues,
  type TokenLimits,
} from "@/app/(app)/[workspaceSlugOrId]/(resources)/policies/_components/policy-form/form-schema";

// Drawer state mirrors the delete-dialog shape: null = closed, Policy = open.
export type EditPolicyDrawerState = Policy | null;

interface EditPolicyDrawerProps {
  state: EditPolicyDrawerState;
  onClose: () => void;
}

export function EditPolicyDrawer({ state, onClose }: EditPolicyDrawerProps) {
  return (
    <Drawer
      direction="right"
      open={state !== null}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DrawerContent size="lg" aria-describedby={undefined}>
        {state !== null && (
          <EditPolicyForm
            key={state.metadata.name}
            policy={state}
            onClose={onClose}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

interface EditPolicyFormProps {
  policy: Policy;
  onClose: () => void;
}

function EditPolicyForm({ policy, onClose }: EditPolicyFormProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const queryClient = useQueryClient();

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    mode: "onChange",
    defaultValues: {
      displayName: policy.metadata.displayName,
      name: policy.metadata.name,
      resourceTypes: [...policy.spec.resourceTypes],
      policyType: policy.spec.type,
      labels: [...labelsRecordToEntries(policy.metadata.labels)],
    },
  });

  const [locations, setLocations] = useState<ReadonlyArray<LocationItem>>(
    () => [...(policy.spec.locations ?? [])],
  );
  const [tokenLimits, setTokenLimits] = useState<TokenLimits>(() => {
    const m = policy.spec.maxTokens;
    return {
      input: m?.input ?? 0,
      output: m?.output ?? 0,
      total: m?.total ?? 0,
      step: m?.step ?? 1,
      granularity: m?.granularity ?? "month",
    };
  });

  // Locations + tokenLimits live outside RHF, so isDirty alone misses them.
  // Track them against the original snapshot for the cancel-confirm path.
  const bodyDirty = computeBodyDirty(policy.spec.type, locations, tokenLimits, {
    locations: policy.spec.locations ?? [],
    maxTokens: policy.spec.maxTokens
      ? {
          input: policy.spec.maxTokens.input,
          output: policy.spec.maxTokens.output,
          total: policy.spec.maxTokens.total,
          step: policy.spec.maxTokens.step,
          granularity: policy.spec.maxTokens.granularity,
        }
      : null,
  });
  const isDirty = form.formState.isDirty || bodyDirty;

  const [confirmDiscard, setConfirmDiscard] = useState(false);

  function requestClose() {
    if (isDirty) {
      setConfirmDiscard(true);
    } else {
      onClose();
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    await updatePolicy(accountId, workspaceId, policy.metadata.name, {
      displayName: values.displayName,
      resourceTypes: values.resourceTypes,
      labels: labelsEntriesToRecord(values.labels),
      locations: policy.spec.type === "location" ? locations : undefined,
      maxTokens:
        policy.spec.type === "maxToken"
          ? {
              granularity: tokenLimits.granularity,
              step: tokenLimits.step,
              input: tokenLimits.input,
              output: tokenLimits.output,
              total: tokenLimits.total,
              ratioInputOverOutput:
                policy.spec.maxTokens?.ratioInputOverOutput ?? 0,
            }
          : undefined,
      updatedBy: "alex@cubic.dev",
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.resources(accountId, workspaceId),
      predicate: (query) => query.queryKey.includes("policies"),
    });
    toast.success(
      `Policy '${values.displayName}' saved.`,
    );
    onClose();
  });

  const policyType = policy.spec.type;

  return (
    <>
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex h-full min-h-0 flex-col"
      >
        <DrawerHeader className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <DrawerTitle>Edit policy</DrawerTitle>
            <DrawerDescription>
              {POLICY_TYPE_BY_VALUE[policyType].narrative}
            </DrawerDescription>
          </div>
          <DrawerCloseButton
            onClick={(event) => {
              // Intercept the default Radix close so dirty forms get the
              // discard-confirm gate. The drawer's onOpenChange path also
              // funnels through requestClose, so Esc and overlay click hit
              // the same gate.
              if (isDirty) {
                event.preventDefault();
                setConfirmDiscard(true);
              }
            }}
          />
        </DrawerHeader>

        <DrawerBody className="flex flex-col gap-6">
          <PolicyTypeReadOnlyField policyType={policyType} />

          {policyType === "location" ? (
            <FieldGroup label="Allowed locations">
              <LocationBody value={locations} onChange={setLocations} />
            </FieldGroup>
          ) : null}
          {policyType === "maxToken" ? (
            <FieldGroup label="Token limits">
              <TokenUsageBody
                value={tokenLimits}
                onChange={setTokenLimits}
              />
            </FieldGroup>
          ) : null}
          {policyType === "flavor" ? <FlavorUnavailableNotice /> : null}

          <FieldGroup
            label="Workload types"
            hint="Attaches only to the workload types selected here."
          >
            <ResourceTypesField form={form} />
          </FieldGroup>

          <IdentityEditableNameOnlyFields
            form={form}
            fixedName={policy.metadata.name}
          />

          <FieldGroup
            label="Labels"
            hint="Key/value pairs for organizing and filtering."
          >
            <LabelsEditor form={form} />
          </FieldGroup>
        </DrawerBody>

        <DrawerFooter className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={requestClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              form.formState.isSubmitting || (!isDirty && !bodyDirty)
            }
          >
            {form.formState.isSubmitting ? "Saving…" : "Save changes"}
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
          <DialogTitle>Discard changes?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="typography-body text-foreground">
            You have unsaved edits to this policy. Close the drawer and lose
            them?
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
