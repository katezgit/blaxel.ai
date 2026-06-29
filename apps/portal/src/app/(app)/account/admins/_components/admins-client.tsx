"use client";

import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/empty-state";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
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
  const [search, setSearch] = useState("");
  const nowMs = Date.now();
  const ownerEmail = state.identity.ownerEmail;

  // Owner row is always pinned visible — search only filters non-Owner rows.
  const visibleAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return state.admins;
    return state.admins.filter((admin) => {
      if (admin.role === "Owner") return true;
      return (
        admin.name.toLowerCase().includes(q) ||
        admin.email.toLowerCase().includes(q)
      );
    });
  }, [state.admins, search]);

  const revokeInvite = (admin: AccountAdmin) => {
    const index = state.admins.findIndex((a) => a.id === admin.id);
    removeAdmin(admin.id);
    toast.success(`Invitation to ${admin.email} revoked.`, {
      action: {
        label: "Undo",
        onClick: () => restoreAdmin(admin, index === -1 ? 0 : index),
      },
    });
  };

  const resendInvite = (admin: AccountAdmin) => {
    toast.success(`Invitation resent to ${admin.email}.`);
  };

  const hasResults = visibleAdmins.length > 0;

  return (
    <>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <header className="page-header">
          <h1 className="typography-display font-semibold text-foreground">Admins</h1>
          <p className="text-muted-foreground">
            Admins can manage this billing account and its workspaces.
          </p>
        </header>
        <Button variant="primary" onClick={() => setAddOpen(true)}>
          <Plus aria-hidden="true" />
          <span>Add admin</span>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search admins…"
          leading={<Search aria-hidden="true" className="size-3.5" />}
          className="max-w-sm"
          aria-label="Search admins"
        />

        {hasResults ? (
          <Table
            bordered
            totalCount={visibleAdmins.length}
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
              {visibleAdmins.map((admin) => {
                const isPending = admin.status === "pending";
                const isOwner = admin.role === "Owner";
                let actionsCell: React.ReactNode;
                if (isOwner) {
                  actionsCell = <OwnerNoActions />;
                } else if (isPending) {
                  actionsCell = (
                    <PendingRowActions
                      admin={admin}
                      onResend={() => resendInvite(admin)}
                      onRevoke={() => revokeInvite(admin)}
                    />
                  );
                } else {
                  actionsCell = (
                    <ActiveRowActions
                      admin={admin}
                      onRemove={() => setPendingRemove(admin)}
                    />
                  );
                }
                return (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" className={cn(isPending && "opacity-50")}>
                          <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "font-medium",
                                isPending && "text-muted-foreground",
                              )}
                            >
                              {admin.name}
                            </span>
                            {admin.email === ownerEmail && (
                              <span className="rounded-sm bg-muted-surface px-1.5 py-px typography-meta font-mono text-meta-foreground">
                                you
                              </span>
                            )}
                          </span>
                          <span className="font-mono typography-caption text-muted-foreground">
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
                            <span className="typography-caption text-muted-foreground">
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
                    <TableCell className="text-right">{actionsCell}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            variant="no-results"
            title="No admins match your search"
            subtitle="Try a shorter term or clear the search."
            cta={
              <Button variant="secondary" onClick={() => setSearch("")}>
                Clear search
              </Button>
            }
          />
        )}
      </div>

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

function OwnerNoActions() {
  return (
    <span
      className="text-muted-foreground"
      aria-label="No actions available for Owner"
    >
      &mdash;
    </span>
  );
}

interface PendingRowActionsProps {
  admin: AccountAdmin;
  onResend: () => void;
  onRevoke: () => void;
}

function PendingRowActions({
  admin,
  onResend,
  onRevoke,
}: PendingRowActionsProps) {
  return (
    <div className="inline-flex h-8 items-center">
      <Button
        variant="ghost"
        onClick={onResend}
        aria-label={`Resend invitation to ${admin.email}`}
      >
        Resend
      </Button>
      {/* h-3.5 / 14px aligns the divider to the cap-height of the adjacent
          text-link buttons; spacing tokens snap to text-line height, which
          would overshoot the glyph. Structural compensation, not a token
          off-ramp. */}
      <Separator
        orientation="vertical"
        decorative
        className="mx-1 data-[orientation=vertical]:h-3.5"
      />
      <Button
        variant="destructive-ghost"
        onClick={onRevoke}
        aria-label={`Revoke invitation to ${admin.email}`}
      >
        Revoke
      </Button>
    </div>
  );
}

interface ActiveRowActionsProps {
  admin: AccountAdmin;
  onRemove: () => void;
}

function ActiveRowActions({ admin, onRemove }: ActiveRowActionsProps) {
  return (
    <div className="inline-flex h-8 items-center">
      <Button
        variant="destructive-ghost"
        onClick={onRemove}
        aria-label={`Remove ${admin.name}`}
      >
        Remove
      </Button>
    </div>
  );
}
