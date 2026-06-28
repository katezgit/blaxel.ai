"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";

interface WorkspaceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceName: string;
  onConfirm: () => void;
  impact?: ReactNode;
}

// Typing the workspace name fails when the user is on the wrong workspace,
// which is what makes the "wrong env wipeout" incident structurally
// impossible. Reserved for catastrophic + irreversible workspace deletion;
// per-record destructive actions use AlertDialog instead.
export default function WorkspaceDeleteDialog({
  open,
  onOpenChange,
  workspaceName,
  impact,
  onConfirm,
}: WorkspaceDeleteDialogProps) {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  const matches = typed === workspaceName;
  const statusId = "workspace-delete-status";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="md"
        // Description prose lives in DialogBody (body weight), not
        // DialogDescription (muted caption styling). aria-describedby silences
        // Radix's missing-description warning.
        aria-describedby={undefined}
        // Deterministic focus on the typing input — Radix's default would land
        // on Cancel since it's the first focusable, but the typing input is
        // the primary affordance.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Delete &quot;{workspaceName}&quot;</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <p className="typography-body text-foreground">
            Deleting the workspace is permanent. Every workspace-scoped
            resource and credential below will be removed.
          </p>
          {impact}
          <FormField
            id="workspace-delete-input"
            label={
              <>
                Type{" "}
                <span className="font-mono text-foreground">
                  {workspaceName}
                </span>{" "}
                to confirm
              </>
            }
          >
            <Input
              ref={inputRef}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={workspaceName}
              autoComplete="off"
              spellCheck={false}
              aria-describedby={statusId}
            />
          </FormField>
          <p id={statusId} aria-live="polite" className="sr-only">
            {matches
              ? "Delete workspace is now enabled."
              : "Type the workspace name to enable Delete workspace."}
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!matches}
            aria-describedby={statusId}
            onClick={() => {
              if (!matches) return;
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
