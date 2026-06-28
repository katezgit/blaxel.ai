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
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
import { EmptyState } from "@repo/ui/components/empty-state";
import { Input } from "@repo/ui/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import ManageTable from "@/app/(manage)/_components/manage-table";
import { TIER_LIMITS } from "@/lib/mock/account";
import { useAccountState } from "@/lib/mock/account-context";
import type { Org } from "@/lib/mock/types";

const SEARCH_THRESHOLD = 8;
const PAYMENT_HREF = "/account/billing/credits#payment-method";
const UPGRADE_HREF = "/account/billing/tier-quotas";

interface QuotaCopy {
  helper: string;
  link: string;
  href: string;
  tooltip: string;
}

function getQuotaCopy(
  tier: number,
  workspaceLimit: number,
  atLimit: boolean,
): QuotaCopy | null {
  if (!atLimit) return null;
  if (tier === 0) {
    return {
      helper: `Tier ${tier} includes ${workspaceLimit} workspace${workspaceLimit === 1 ? "" : "s"}.`,
      link: "Add a payment method to create more workspaces",
      href: PAYMENT_HREF,
      tooltip: "Add a payment method to create more workspaces.",
    };
  }
  return {
    helper: "You have reached your workspace limit.",
    link: "Upgrade your plan to create more workspaces",
    href: UPGRADE_HREF,
    tooltip: "Upgrade your plan to create more workspaces.",
  };
}

const columnHelper = createColumnHelper<Org>();

export default function WorkspacesClient() {
  const router = useRouter();
  const { state } = useAccountState();
  const limits = TIER_LIMITS[state.tier];
  const workspaceLimit = limits.workspaces;
  const count = state.workspaces.length;
  const atLimit = count >= workspaceLimit;
  const quotaCopy = getQuotaCopy(state.tier, workspaceLimit, atLimit);
  const showSearch = count >= SEARCH_THRESHOLD;

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "workspace", desc: false },
  ]);

  const filteredWorkspaces = useMemo(() => {
    if (!showSearch) return state.workspaces;
    const q = search.trim().toLowerCase();
    if (!q) return state.workspaces;
    return state.workspaces.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.workspaceId.toLowerCase().includes(q),
    );
  }, [state.workspaces, search, showSearch]);

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
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="typography-body text-foreground">
              {row.original.accountOwnerName}
            </span>
            <span className="font-mono typography-caption text-muted-foreground">
              {row.original.accountOwner}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("createdAt", {
        id: "createdAt",
        header: ({ column }) => <SortHeader column={column} label="Created" />,
        sortingFn: (a, b) =>
          a.original.createdAt.localeCompare(b.original.createdAt),
        cell: (info) => (
          <span className="font-mono typography-body text-muted-foreground">
            {info.getValue()}
          </span>
        ),
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
  const createButton = (
    <Button
      variant="primary"
      disabled={createDisabled}
      onClick={() => toast.success("Create workspace (mock).")}
    >
      <Plus aria-hidden="true" />
      <span>Create workspace</span>
    </Button>
  );

  return (
    <>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <header className="page-header">
          <h1 className="typography-display font-semibold text-foreground">
            Workspaces
          </h1>
          <p className="text-muted-foreground">
            Manage workspaces associated with this billing account.
          </p>
        </header>
        {createDisabled ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Disabled button needs a focusable wrapper to receive tooltip events */}
              <span tabIndex={0} className="rounded-lg focus-visible:shadow-focus-ring">
                {createButton}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {quotaCopy?.tooltip ??
                "Add a payment method to create more workspaces."}
            </TooltipContent>
          </Tooltip>
        ) : (
          createButton
        )}
      </div>

      <section
        aria-label="Billing account context"
        className="flex flex-col gap-1 rounded-md border border-border bg-card p-4"
      >
        <p className="typography-body text-foreground">
          <span className="font-mono">{state.identity.ownerEmail}</span>
          <span className="text-muted-foreground">
            {" · "}
            <span className="font-medium text-foreground">
              Tier {state.tier}
            </span>
            {" · "}
            <span className="font-medium text-foreground">
              {count} / {workspaceLimit} workspace
              {workspaceLimit === 1 ? "" : "s"} used
            </span>
          </span>
        </p>
        {quotaCopy ? (
          <p className="typography-caption text-muted-foreground">
            {quotaCopy.helper}{" "}
            <Link
              href={quotaCopy.href}
              className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline focus-visible:shadow-focus-ring rounded-sm"
            >
              {quotaCopy.link}
              <ArrowRight aria-hidden="true" className="size-3" />
            </Link>
          </p>
        ) : null}
      </section>

      {showSearch ? (
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search workspaces…"
          leading={<Search aria-hidden="true" className="size-3.5" />}
          className="max-w-sm"
          aria-label="Search workspaces"
        />
      ) : null}

      {state.workspaces.length === 0 ? (
        <EmptyState
          variant="zero-state"
          title="No workspaces yet."
          subtitle={
            createDisabled
              ? "Add a payment method to create a workspace."
              : "Create a workspace to start organizing resources."
          }
          cta={
            createDisabled ? (
              <Button variant="primary" asChild>
                <Link href={quotaCopy?.href ?? PAYMENT_HREF}>
                  Add payment method
                </Link>
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => toast.success("Create workspace (mock).")}
              >
                <Plus aria-hidden="true" />
                <span>Create workspace</span>
              </Button>
            )
          }
        />
      ) : filteredWorkspaces.length === 0 ? (
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
          onRowClick={(row) =>
            router.push(`/${row.original.slug}/settings/general`)
          }
        />
      )}
    </>
  );
}

function WorkspaceCell({ workspace }: { workspace: Org }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Link
        href={`/${workspace.slug}/settings/general`}
        className="truncate font-mono typography-body text-foreground underline-offset-4 group-hover/row:underline focus-visible:shadow-focus-ring rounded-sm outline-hidden"
      >
        {workspace.name}
      </Link>
      <div
        className="flex min-w-0 items-center gap-1"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="truncate typography-code text-meta-foreground">
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
        "group inline-flex items-center gap-1.5 text-left typography-label font-medium",
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
