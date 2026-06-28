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

interface ConfirmByNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionLabel: string;
  targetLabel: string;
  workspaceName: string;
  // Consequence prose rendered inside DialogBody above the typing prompt.
  // Lives here (not DialogDescription) so it inherits body typography —
  // consequence statements are not subtitles.
  children: ReactNode;
  onConfirm: () => void;
}

// Name-confirm pattern for destructive workspace actions — typing the
// workspace name fails when the user is on the wrong workspace, which is
// what makes the "wrong env wipeout" incident structurally impossible.
export default function ConfirmByNameDialog({
  open,
  onOpenChange,
  actionLabel,
  targetLabel,
  workspaceName,
  children,
  onConfirm,
}: ConfirmByNameDialogProps) {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  const matches = typed === workspaceName;
  const statusId = "confirm-by-name-status";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="md"
        // DialogDescription intentionally omitted — consequence prose lives in
        // DialogBody so it gets body typography. aria-describedby={undefined}
        // silences Radix's missing-description warning.
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
          <DialogTitle>
            {actionLabel} &quot;{targetLabel}&quot;
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          {children}
          <FormField
            id="confirm-by-name-input"
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
              ? `${actionLabel} is now enabled.`
              : `Type the workspace name to enable ${actionLabel}.`}
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
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
