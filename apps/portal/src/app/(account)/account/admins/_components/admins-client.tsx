"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
import { useAccountState } from "@/lib/mock/account-context";
import type { AccountAdmin } from "@/lib/mock/account";
import AddAdminDialog from "./add-admin-dialog";
import RemoveAdminDialog from "./remove-admin-dialog";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function formatSentAgo(invitedAtIso: string, nowMs: number): string {
  const sentMs = new Date(invitedAtIso).getTime();
  const diffMs = Math.max(0, nowMs - sentMs);
  if (diffMs < DAY_MS) {
    const hours = Math.max(1, Math.round(diffMs / HOUR_MS));
    return `Sent ${hours}h ago`;
  }
  const days = Math.max(1, Math.round(diffMs / DAY_MS));
  return `Sent ${days}d ago`;
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

export default function AdminsClient() {
  const { state, removeAdmin, restoreAdmin } = useAccountState();
  const [addOpen, setAddOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<AccountAdmin | null>(null);
  const nowMs = Date.now();

  const cancelInvite = (admin: AccountAdmin) => {
    const index = state.admins.findIndex((a) => a.id === admin.id);
    removeAdmin(admin.id);
    toast.success(`Invitation to ${admin.email} canceled.`, {
      action: {
        label: "Undo",
        onClick: () => restoreAdmin(admin, index === -1 ? 0 : index),
      },
    });
  };

  const resendInvite = (admin: AccountAdmin) => {
    toast.success(`Invitation resent to ${admin.email}.`);
  };

  return (
    <>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <header className="page-header">
          <h1 className="text-display font-semibold text-foreground">Admins</h1>
          <p className="text-muted-foreground">
            Admins can manage this billing account and its workspaces.
          </p>
        </header>
        <Button variant="primary" onClick={() => setAddOpen(true)}>
          <Plus aria-hidden="true" />
          <span>Add admin</span>
        </Button>
      </div>

      <Table
        bordered
        totalCount={state.admins.length}
        pageOffset={0}
        aria-label="Admins"
        className="[&_tbody_tr]:hover:bg-transparent"
      >
        <colgroup>
          <col style={{ width: "48%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "16%" }} />
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHeaderCell label="User" />
            <TableHeaderCell label="Role" />
            <TableHeaderCell label="Status" />
            <TableHeaderCell label="Actions" numeric />
          </TableRow>
        </TableHeader>
        <TableBody>
          {state.admins.map((admin) => {
            const isPending = admin.status === "pending";
            return (
              <TableRow key={admin.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback
                        className={cn(isPending && "bg-muted-foreground")}
                      >
                        {getInitials(admin.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "font-medium",
                          isPending && "text-muted-foreground",
                        )}
                      >
                        {admin.name}
                      </span>
                      <span className="font-mono text-caption text-muted-foreground">
                        {admin.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{admin.role}</TableCell>
                <TableCell>
                  {isPending ? (
                    <div className="flex flex-col gap-1">
                      <Badge variant="warning" showDot className="font-sans">
                        Pending invite
                      </Badge>
                      {admin.invitedAt ? (
                        <span className="text-caption text-muted-foreground">
                          {formatSentAgo(admin.invitedAt, nowMs)}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <Badge variant="success" showDot className="font-sans">
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <AdminRowActions
                    admin={admin}
                    onRemove={() => setPendingRemove(admin)}
                    onCancel={() => cancelInvite(admin)}
                    onResend={() => resendInvite(admin)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AddAdminDialog open={addOpen} onOpenChange={setAddOpen} />
      <RemoveAdminDialog
        admin={pendingRemove}
        onClose={() => setPendingRemove(null)}
        onConfirm={() => {
          if (!pendingRemove) return;
          removeAdmin(pendingRemove.id);
          toast.success(`Removed ${pendingRemove.name} from this account.`);
        }}
      />
    </>
  );
}

interface AdminRowActionsProps {
  admin: AccountAdmin;
  onRemove: () => void;
  onCancel: () => void;
  onResend: () => void;
}

function AdminRowActions({
  admin,
  onRemove,
  onCancel,
  onResend,
}: AdminRowActionsProps) {
  if (admin.role === "Owner") {
    return (
      <span className="text-muted-foreground" aria-label="No actions available for Owner">
        &mdash;
      </span>
    );
  }
  if (admin.status === "pending") {
    return (
      <div className="inline-flex items-center gap-2">
        <RowActionButton onClick={onResend} label={`Resend invitation to ${admin.email}`}>
          Resend
        </RowActionButton>
        <span aria-hidden="true" className="text-muted-foreground">
          &middot;
        </span>
        <RowActionButton
          onClick={onCancel}
          label={`Cancel invitation to ${admin.email}`}
          destructive
        >
          Cancel
        </RowActionButton>
      </div>
    );
  }
  return (
    <RowActionButton
      onClick={onRemove}
      label={`Remove ${admin.name}`}
      destructive
    >
      Remove
    </RowActionButton>
  );
}

interface RowActionButtonProps {
  onClick: () => void;
  label: string;
  destructive?: boolean;
  children: React.ReactNode;
}

function RowActionButton({
  onClick,
  label,
  destructive,
  children,
}: RowActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "rounded-sm text-body hover:underline focus-visible:shadow-focus-ring cursor-pointer",
        destructive
          ? "text-destructive hover:text-destructive-hover"
          : "text-foreground",
      )}
    >
      {children}
    </button>
  );
}
