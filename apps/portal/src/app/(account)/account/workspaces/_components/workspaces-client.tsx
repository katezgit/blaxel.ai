"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { EmptyState } from "@repo/ui/components/empty-state";
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/cn";
import ManageTable from "@/app/(manage)/_components/manage-table";
import InlineGate from "@/app/(account)/account/_components/inline-gate";
import { TIER_LIMITS } from "@/lib/mock/account";
import { useAccountState } from "@/lib/mock/account-context";
import type { Org } from "@/lib/mock/types";

const columnHelper = createColumnHelper<Org>();

export default function WorkspacesClient() {
  const router = useRouter();
  const { state } = useAccountState();
  const limits = TIER_LIMITS[state.tier];
  const workspaceLimit = limits.workspaces;
  const count = state.workspaces.length;
  const atLimit = count >= workspaceLimit;
  const isTierZero = state.tier === 0;
  const showInlineGate = isTierZero && atLimit;

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "workspace", desc: false },
  ]);

  const filteredWorkspaces = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return state.workspaces;
    return state.workspaces.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.workspaceId.toLowerCase().includes(q),
    );
  }, [state.workspaces, search]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "workspace",
        header: ({ column }) => (
          <SortHeader column={column} label="Workspace" />
        ),
        sortingFn: (a, b) => a.original.name.localeCompare(b.original.name),
        cell: ({ row }) => <WorkspaceCell workspace={row.original} />,
      }),
      columnHelper.accessor("accountOwner", {
        id: "createdBy",
        header: () => (
          <span className="text-meta-foreground">Created by</span>
        ),
        enableSorting: false,
        cell: (info) => (
          <span className="text-body text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        id: "createdAt",
        header: ({ column }) => <SortHeader column={column} label="Created" />,
        sortingFn: (a, b) =>
          a.original.createdAt.localeCompare(b.original.createdAt),
        cell: (info) => (
          <span className="font-mono text-body text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        meta: {
          headerClassName: "w-10",
          cellClassName: "text-right",
        },
        cell: ({ row }) => <RowMenu workspace={row.original} />,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredWorkspaces as Org[],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const createDisabled = atLimit;
  const createLabel = atLimit
    ? `Workspace limit reached (${count}/${workspaceLimit}).`
    : `Create workspace. ${count} of ${workspaceLimit} used.`;

  return (
    <>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <header className="page-header">
          <h1 className="text-display font-semibold text-foreground">
            Workspaces
          </h1>
          <p className="text-muted-foreground">
            Manage the workspaces associated with this billing account.
          </p>
        </header>
        <Button
          variant="primary"
          disabled={createDisabled}
          aria-label={createLabel}
          onClick={() => toast.success("Create workspace (mock).")}
        >
          <Plus aria-hidden="true" />
          <span>Create workspace</span>
        </Button>
      </div>

      <p className="text-caption text-muted-foreground">
        Billing account:{" "}
        <span className="font-mono text-foreground">
          {state.identity.ownerEmail}
        </span>
        {" · "}
        <span className="text-foreground">Tier {state.tier}</span>
        {" · "}
        <span className="text-foreground">
          {count} {count === 1 ? "workspace" : "workspaces"}
        </span>
      </p>

      {showInlineGate ? (
        <InlineGate tier={1} verb="create up to 5 workspaces" />
      ) : null}

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search workspaces…"
        leading={<Search aria-hidden="true" className="size-3.5" />}
        className="max-w-sm"
        aria-label="Search workspaces"
      />

      {filteredWorkspaces.length === 0 ? (
        <EmptyState
          variant="no-results"
          title="No workspaces match your search"
          subtitle="Try a shorter term or clear the search."
          cta={
            <Button variant="secondary" onClick={() => setSearch("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <ManageTable
          table={table}
          bordered
          caption="Workspaces"
          onRowClick={(row) => router.push(`/${row.original.slug}`)}
        />
      )}
    </>
  );
}

function WorkspaceCell({ workspace }: { workspace: Org }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Link
        href={`/${workspace.slug}`}
        className="truncate font-mono text-body text-primary hover:underline focus-visible:shadow-focus-ring rounded-sm outline-hidden"
      >
        {workspace.name}
      </Link>
      <div
        className="flex min-w-0 items-center gap-1"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="truncate font-mono text-caption text-meta-foreground">
          {workspace.workspaceId}
        </span>
        <CopyButton
          value={workspace.workspaceId}
          ariaLabel={`Copy workspace ID ${workspace.workspaceId}`}
          tooltipLabel="Copy workspace ID"
        />
      </div>
    </div>
  );
}

interface SortHeaderProps {
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

const SORT_ARIA_LABEL: Record<"asc" | "desc" | "none", (label: string) => string> = {
  asc: (label) => `Sorted by ${label} ascending. Click to sort descending.`,
  desc: (label) => `Sorted by ${label} descending. Click to clear sort.`,
  none: (label) => `Sort by ${label}.`,
};

function SortHeader({ column, label }: SortHeaderProps) {
  const sorted = column.getIsSorted();
  const sortKey = sorted === false ? "none" : sorted;
  const Icon = SORT_ICON[sortKey];
  const ariaLabel = SORT_ARIA_LABEL[sortKey](label);
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={cn(
        "group inline-flex items-center gap-1.5 text-left text-label font-medium",
        "outline-hidden focus-visible:shadow-focus-ring rounded-sm",
        sorted
          ? "text-foreground"
          : "text-meta-foreground hover:text-foreground",
      )}
      aria-label={ariaLabel}
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

function RowMenu({ workspace }: { workspace: Org }) {
  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={`Actions for ${workspace.name}`}
          >
            <MoreHorizontal />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/${workspace.slug}/settings/name`}>
              <Settings aria-hidden="true" className="size-3.5" />
              Workspace settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
