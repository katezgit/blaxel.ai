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

/**
 * Lighter one-click confirmation (spec §8). Deleting a single key is scoped
 * and recoverable (create a replacement immediately), so a type-the-name
 * gate would be disproportionate. The type-the-name pattern is reserved for
 * the SA-level removal which destroys identity + every key.
 */
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
          <p className="typography-body text-foreground">
            Any consumer using this key will lose access immediately. This
            cannot be undone.
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
