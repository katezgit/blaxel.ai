"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

interface DeleteDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domainName: string;
}

export function DeleteDomainDialog({
  open,
  onOpenChange,
  domainName,
}: DeleteDomainDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const params = useParams<{ workspaceSlugOrId: string }>();

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsDeleting(false);
    onOpenChange(false);
    toast.success(`Custom domain ${domainName} deleted`);
    router.push(`/${params.workspaceSlugOrId}/custom-domains`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Delete {domainName}?</DialogTitle>
          <DialogDescription>
            This removes the domain registration and TLS certificate. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="typography-caption text-muted-foreground">
            Any Sandbox preview routing through this domain will fall back to
            its <span className="font-mono text-foreground">*.preview.bl.run</span>{" "}
            address.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete domain"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
