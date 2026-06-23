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
  FlavorUnavailableNotice,
  IdentityEditableNameOnlyFields,
  LocationBody,
  PolicyTypeReadOnlyField,
  ResourceTypesField,
  StepHeading,
  TokenUsageBody,
} from "../../_components/policy-form/form-pieces";
import {
  POLICY_TYPE_BY_VALUE,
  policyFormSchema,
  type LocationItem,
  type PolicyFormValues,
  type TokenLimits,
} from "../../_components/policy-form/form-schema";

// Drawer state mirrors the delete-dialog shape: `policy: null` = closed,
// `policy: Policy` = open with that policy's data. `focusTarget` decides which
// field to land focus on after mount — header click lands on display-name,
// clause-band hover Edit lands on the clause body (the section the user was
// reading).
export type EditPolicyDrawerState =
  | { policy: Policy; focusTarget: "displayName" | "clause" }
  | null;

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
            key={state.policy.metadata.name}
            policy={state.policy}
            focusTarget={state.focusTarget}
            onClose={onClose}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

interface EditPolicyFormProps {
  policy: Policy;
  focusTarget: "displayName" | "clause";
  onClose: () => void;
}

function EditPolicyForm({ policy, focusTarget, onClose }: EditPolicyFormProps) {
  void focusTarget;
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
  const initialSpec = policy.spec;
  const bodyDirty = computeBodyDirty(
    policy.spec.type,
    locations,
    tokenLimits,
    initialSpec.locations ?? [],
    initialSpec.maxTokens ?? null,
  );
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

        <DrawerBody className="flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <StepHeading index={1} title="Policy type" />
            <PolicyTypeReadOnlyField policyType={policyType} />
          </section>

          <section className="flex flex-col gap-4">
            <StepHeading
              index={2}
              title="Configure the rule"
              description={POLICY_TYPE_BY_VALUE[policyType].hint}
            />
            {policyType === "location" ? (
              <LocationBody value={locations} onChange={setLocations} />
            ) : null}
            {policyType === "maxToken" ? (
              <TokenUsageBody
                value={tokenLimits}
                onChange={setTokenLimits}
              />
            ) : null}
            {policyType === "flavor" ? <FlavorUnavailableNotice /> : null}
          </section>

          <section className="flex flex-col gap-4">
            <StepHeading
              index={3}
              title="Target workloads"
              description="Attaches only to the workload types selected here."
            />
            <ResourceTypesField form={form} />
          </section>

          <section className="flex flex-col gap-4">
            <StepHeading index={4} title="Identity" />
            <IdentityEditableNameOnlyFields
              form={form}
              fixedName={policy.metadata.name}
            />
          </section>
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

function computeBodyDirty(
  type: Policy["spec"]["type"],
  currentLocations: ReadonlyArray<LocationItem>,
  currentTokenLimits: TokenLimits,
  initialLocations: ReadonlyArray<LocationItem>,
  initialMaxTokens: TokenLimits | { input: number; output: number; total: number; step: number; granularity: TokenLimits["granularity"] } | null,
): boolean {
  if (type === "location") {
    if (currentLocations.length !== initialLocations.length) return true;
    return currentLocations.some(
      (loc, idx) =>
        loc.type !== initialLocations[idx]?.type ||
        loc.name !== initialLocations[idx]?.name,
    );
  }
  if (type === "maxToken") {
    if (initialMaxTokens === null) return true;
    return (
      currentTokenLimits.input !== initialMaxTokens.input ||
      currentTokenLimits.output !== initialMaxTokens.output ||
      currentTokenLimits.total !== initialMaxTokens.total ||
      currentTokenLimits.step !== initialMaxTokens.step ||
      currentTokenLimits.granularity !== initialMaxTokens.granularity
    );
  }
  return false;
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
