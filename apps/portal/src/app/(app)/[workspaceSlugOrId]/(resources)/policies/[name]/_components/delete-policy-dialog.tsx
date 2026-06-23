"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import type { Policy } from "@/lib/mock/policies";
import { totalUsage } from "@/lib/mock/policies";

interface DeletePolicyDialogProps {
  // null = closed, Policy = open with this policy's data. The combined
  // signal removes the parallel `open` + `policy` props that would otherwise
  // drift out of sync between the two trigger surfaces (header + usage band).
  policy: Policy | null;
  onClose: () => void;
  onConfirm: (policy: Policy) => Promise<void> | void;
}

export default function DeletePolicyDialog({
  policy,
  onClose,
  onConfirm,
}: DeletePolicyDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = policy?.metadata.displayName ?? policy?.metadata.name ?? "";
  const usage = policy ? totalUsage(policy.usage) : 0;

  async function handleConfirm() {
    if (!policy) return;
    setIsDeleting(true);
    try {
      await onConfirm(policy);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog
      open={policy !== null}
      onOpenChange={(next) => {
        if (!next && !isDeleting) onClose();
      }}
    >
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Delete policy &ldquo;{displayName}&rdquo;?</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          {usage > 0 ? (
            <p className="typography-body text-foreground">
              This policy currently constrains{" "}
              <span className="font-mono font-medium">{usage}</span> workload
              {usage === 1 ? "" : "s"}. Removing it will release them —
              they&rsquo;ll redeploy without this constraint.
            </p>
          ) : (
            <p className="typography-body text-foreground">
              No workloads currently reference this policy.
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete policy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
