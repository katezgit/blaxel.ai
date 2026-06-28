"use client";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import type { ServiceAccountApiKey } from "@/lib/mock/types";

interface DeleteServiceAccountApiKeyDialogProps {
  /** Null = closed. Object = open with that key as the target. */
  apiKey: ServiceAccountApiKey | null;
  onClose: () => void;
  onConfirm: (apiKey: ServiceAccountApiKey) => void;
}

// Single-key deletion is scoped + immediately recoverable (create a
// replacement key in seconds), so the type-the-name gate would be
// disproportionate. That gate is reserved for SA-level removal which
// destroys identity + every key.
export default function DeleteServiceAccountApiKeyDialog({
  apiKey,
  onClose,
  onConfirm,
}: DeleteServiceAccountApiKeyDialogProps) {
  const open = apiKey !== null;
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>
            Delete &ldquo;{apiKey?.name ?? ""}&rdquo;?
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-foreground">
            Any external system using this key will lose access immediately.
            This cannot be undone.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (apiKey) onConfirm(apiKey);
            }}
          >
            Delete API key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
