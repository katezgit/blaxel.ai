"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnFiltersState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  CircleSlash,
  Clock,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Combobox,
  type ComboboxOption,
} from "@repo/ui/components/combobox";
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { toast } from "sonner";
import { EmptyState } from "@repo/ui/components/empty-state";
import { cn } from "@repo/ui/lib/cn";
import type {
  MemberSource,
  MemberStatus,
  Org,
  Role,
  TeamMember,
} from "@/lib/mock/types";
import { workspaceTeamQueries } from "@/lib/query/workspace-team";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import ConfirmByNameDialog from "@/app/(app)/[workspaceSlugOrId]/settings/_components/confirm-by-name-dialog";
import { InviteUsersDialog, type InviteResult } from "./invite-users-dialog";
import { ResourceTable } from "@/app/(app)/_components/resource-table";
import {
  ROLE_META,
  SOURCE_META,
  STATUS_META,
  STATUS_VALUES,
} from "./team-mock-helpers";

// Logical role hierarchy: Owner is most privileged, Member is least. Used as
// the sort key so admins-first audit ("who has Admin?") doesn't need users to
// re-sort alphabetically each time. Owner = 0 sorts before Admin = 1 ascending.
const ROLE_RANK: Record<Role, number> = { owner: 0, admin: 1, member: 2 };
// Urgency-first for invite hygiene: Pending invites are the actionable state,
// Expired the lapsed one, Accepted the resolved one. Ascending = "what needs me".
const STATUS_RANK: Record<MemberStatus, number> = {
  pending: 0,
  expired: 1,
  accepted: 2,
};

interface TeamClientProps {
  workspace: Org;
}

const columnHelper = createColumnHelper<TeamMember>();

export default function TeamClient({ workspace }: TeamClientProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: serverMembers } = useSuspenseQuery(
    workspaceTeamQueries.list(accountId, workspaceId),
  );

  const [members, setMembers] = useState<ReadonlyArray<TeamMember>>(serverMembers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "member", desc: false },
  ]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<TeamMember | null>(null);
  const [columnFilters] = useState<ColumnFiltersState>([]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (q && !m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter !== null && m.status !== statusFilter) return false;
      return true;
    });
  }, [members, search, statusFilter]);

  // Status filter options carry per-bucket counts so admins see "Pending (3)"
  // without clicking through — the count IS the actionable signal at small team sizes.
  const statusOptions = useMemo<ComboboxOption[]>(() => {
    const counts: Record<MemberStatus, number> = { accepted: 0, pending: 0, expired: 0 };
    for (const m of members) counts[m.status] += 1;
    return STATUS_VALUES.map((v) => ({
      value: v,
      label: `${STATUS_META[v].label} (${counts[v]})`,
    }));
  }, [members]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            size="sm"
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(value === true)
            }
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            size="sm"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(value === true)}
            aria-label={`Select ${row.original.name}`}
          />
        ),
      }),
      columnHelper.accessor("name", {
        id: "member",
        header: ({ column }) => <SortHeader column={column} label="Member" />,
        sortingFn: (a, b) => a.original.name.localeCompare(b.original.name),
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-2">
              <span className="truncate typography-label font-medium text-foreground">
                {row.original.name}
              </span>
              {row.original.isYou && (
                <span className="rounded-sm bg-muted-surface px-1.5 py-0.5 typography-meta font-mono text-meta-foreground">
                  you
                </span>
              )}
            </span>
            <span className="truncate font-mono typography-caption text-meta-foreground">
              {row.original.email}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("role", {
        header: ({ column }) => <SortHeader column={column} label="Role" />,
        sortingFn: (a, b) =>
          ROLE_RANK[a.original.role] - ROLE_RANK[b.original.role],
        cell: (info) => <RoleCell role={info.getValue()} />,
      }),
      columnHelper.accessor("status", {
        header: ({ column }) => <SortHeader column={column} label="Status" />,
        sortingFn: (a, b) =>
          STATUS_RANK[a.original.status] - STATUS_RANK[b.original.status],
        cell: (info) => <StatusCell status={info.getValue()} />,
      }),
      columnHelper.accessor("source", {
        header: ({ column }) => <SortHeader column={column} label="Source" />,
        sortingFn: (a, b) =>
          SOURCE_META[a.original.source].label.localeCompare(
            SOURCE_META[b.original.source].label,
          ),
        cell: (info) => <SourceCell source={info.getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <RowMenu
            member={row.original}
            onRemove={() => setPendingRemoval(row.original)}
            onResend={() =>
              toast.success(`Resent invitation to ${row.original.email}.`)
            }
            onRevoke={() => {
              setMembers((prev) => prev.filter((m) => m.id !== row.original.id));
              toast.success(`Revoked invitation to ${row.original.email}.`);
            }}
          />
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredMembers as TeamMember[],
    columns,
    state: { sorting, columnFilters, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
  const hasFilters = search.trim().length > 0 || statusFilter !== null;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(null);
  };

  const handleInvite = ({ emails, role }: InviteResult) => {
    let invited = 0;
    let duplicates = 0;
    const existingEmails = new Set(members.map((m) => m.email.toLowerCase()));
    const additions: TeamMember[] = [];
    for (const email of emails) {
      if (existingEmails.has(email.toLowerCase())) {
        duplicates += 1;
        continue;
      }
      existingEmails.add(email.toLowerCase());
      additions.push({
        id: `inv_${Date.now()}_${email}`,
        name: email.split("@")[0] ?? email,
        email,
        role,
        source: "invitation",
        status: "pending",
      });
      invited += 1;
    }
    if (additions.length > 0) {
      setMembers((prev) => [...additions, ...prev]);
    }
    setInviteOpen(false);
    const messageParts: string[] = [];
    if (invited > 0) messageParts.push(`${invited} invited`);
    if (duplicates > 0) messageParts.push(`${duplicates} already a member`);
    toast.success(messageParts.join(" · "));
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <header className="page-header">
          <h1 className="typography-display font-semibold text-foreground">
            Workspace team
          </h1>
          <p className="text-muted-foreground">
            Members invited to this workspace and the role they hold.
          </p>
        </header>
        <Button
          variant="primary"
          onClick={() => setInviteOpen(true)}
        >
          <Plus aria-hidden="true" />
          <span>Invite members</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search for a member"
          leading={<Search aria-hidden="true" className="size-3.5" />}
          className="max-w-xs"
          aria-label="Search workspace members"
        />
        <Combobox
          options={statusOptions}
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as MemberStatus | null)}
          label="Status"
          placeholder="All"
          className="ml-auto w-44"
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-md border border-border bg-muted-surface px-3 py-2">
          <div className="flex items-center gap-4">
            <span className="typography-label text-foreground">
              {selectedIds.length} selected
            </span>
            <span aria-hidden="true" className="h-4 w-px bg-border" />
            <Button
              variant="ghost"
              onClick={() => setRowSelection({})}
            >
              Clear selection
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => toast.success("Bulk role change (mock).")}
            >
              Change role
            </Button>
            <Button
              variant="destructive-ghost"
              onClick={() => {
                setMembers((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
                setRowSelection({});
                toast.success(`Removed ${selectedIds.length} members.`);
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {filteredMembers.length === 0 ? (
        <EmptyState
          variant="no-results"
          title="No members match these filters"
          subtitle="Try clearing one filter at a time."
          cta={
            hasFilters && (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <ResourceTable
          table={table}
          getRowClassName={(row) =>
            row.original.status === "expired"
              // eslint-disable-next-line no-restricted-syntax -- inset accent sits inside the bordered table container; no @theme utility expresses inset-shadow position+width for a color token
              ? "bg-state-warning-subtle shadow-[inset_2px_0_0_var(--color-state-warning)] hover:bg-state-warning-subtle"
              : undefined
          }
        />
      )}

      <InviteUsersDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={handleInvite}
      />

      <ConfirmByNameDialog
        dialog={{
          open: pendingRemoval !== null,
          onOpenChange: (open) => {
            if (!open) setPendingRemoval(null);
          },
        }}
        prompt={{
          actionLabel: "Remove member",
          targetLabel: pendingRemoval?.name ?? "",
          confirmName: workspace.name,
          onConfirm: () => {
            if (!pendingRemoval) return;
            setMembers((prev) => prev.filter((m) => m.id !== pendingRemoval.id));
            toast.success(`Removed ${pendingRemoval.name} from ${workspace.name}.`);
            setPendingRemoval(null);
          },
        }}
      >
        <p className="typography-body text-foreground">
          {pendingRemoval?.name ?? "This member"} will lose access to every
          resource in this workspace.
        </p>
      </ConfirmByNameDialog>
    </section>
  );
}

interface SortHeaderProps {
  // `Column` from TanStack carries the row type; cast at the call site since
  // this header is reused across columns that all share the same TeamMember row.
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
  label: string;
}

const SORT_ICON = {
  asc: ArrowUp,
  desc: ArrowDown,
  none: ArrowUpDown,
} as const;

function SortHeader({ column, label }: SortHeaderProps) {
  const sorted = column.getIsSorted();
  const Icon = SORT_ICON[sorted === false ? "none" : sorted];
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={cn(
        "group inline-flex items-center gap-1.5 text-left typography-label font-medium",
        "outline-hidden focus-visible:shadow-focus-ring rounded-sm",
        sorted ? "text-foreground" : "text-meta-foreground hover:text-foreground",
      )}
      aria-label={
        sorted === "asc"
          ? `Sorted by ${label} ascending. Click to sort descending.`
          : sorted === "desc"
            ? `Sorted by ${label} descending. Click to clear sort.`
            : `Sort by ${label}.`
      }
    >
      <span>{label}</span>
      <Icon
        aria-hidden="true"
        className={cn(
          "size-3 shrink-0 transition-opacity",
          sorted ? "opacity-100" : "opacity-0 group-hover:opacity-60",
        )}
      />
    </button>
  );
}

function RoleCell({ role }: { role: Role }) {
  const meta = ROLE_META[role];
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5 typography-label text-foreground">
      <Icon aria-hidden="true" className="size-3.5 shrink-0 text-meta-foreground" />
      <span>{meta.label}</span>
    </span>
  );
}

function SourceCell({ source }: { source: MemberSource }) {
  const meta = SOURCE_META[source];
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5 typography-label text-muted-foreground">
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      <span>{meta.label}</span>
    </span>
  );
}

function StatusCell({ status }: { status: MemberStatus }) {
  const meta = STATUS_META[status];
  // CircleSlash for expired — X is overloaded with "close / dismiss" elsewhere.
  const iconMap = {
    accepted: Check,
    pending: Clock,
    expired: CircleSlash,
  } as const;
  const toneClass = {
    success: "text-state-scored",
    warning: "text-state-warning",
    muted: "text-meta-foreground",
  } as const;
  const Icon = iconMap[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 typography-label text-foreground")}>
      <Icon aria-hidden="true" className={cn("size-3.5 shrink-0", toneClass[meta.tone])} />
      <span>{meta.label}</span>
    </span>
  );
}

interface RowMenuProps {
  member: TeamMember;
  onRemove: () => void;
  onResend: () => void;
  onRevoke: () => void;
}

function RowMenu({ member, onRemove, onResend, onRevoke }: RowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={`Actions for ${member.name}`}
        >
          <MoreHorizontal />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onSelect={() => toast.success(`Change role for ${member.name} (mock).`)}
        >
          Change role
        </DropdownMenuItem>
        {member.status === "pending" && (
          <DropdownMenuItem onSelect={onResend}>Resend invite</DropdownMenuItem>
        )}
        {member.status === "expired" && (
          <DropdownMenuItem onSelect={onResend}>Resend invite</DropdownMenuItem>
        )}
        {(member.status === "pending" || member.status === "expired") && (
          <DropdownMenuItem onSelect={onRevoke}>Revoke invite</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onRemove}
          className="text-destructive focus:text-destructive"
        >
          Remove from workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

