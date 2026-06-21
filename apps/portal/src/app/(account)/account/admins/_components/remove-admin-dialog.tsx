"use client";

import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import type { AccountAdmin } from "@/lib/mock/account";

interface RemoveAdminDialogProps {
  // null = closed, AccountAdmin = open with this row's data. Doubles as
  // open-state + payload so callsites don't fan out parallel props.
  admin: AccountAdmin | null;
  onClose: () => void;
  onConfirm: () => void;
}

function getInitials(name: string): string {
  if (name === "Invited user") return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function RemoveAdminDialog({
  admin,
  onClose,
  onConfirm,
}: RemoveAdminDialogProps) {
  return (
    <Dialog
      open={admin !== null}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Remove admin?</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted-surface px-3 py-2.5">
            <Avatar size="sm">
              <AvatarFallback>{getInitials(admin?.name ?? "")}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {admin?.name}
              </span>
              <span className="text-caption text-muted-foreground">
                <span className="font-mono">{admin?.email}</span>
                {admin?.role ? ` · ${admin.role}` : ""}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-body text-foreground">This will remove:</p>
            <ul className="ml-4 list-disc space-y-1 text-body text-foreground marker:text-muted-foreground">
              <li>Billing account access</li>
              <li>Access to all workspaces</li>
            </ul>
          </div>
          <p className="text-body text-muted-foreground">
            You can invite them again later.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Remove Admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
