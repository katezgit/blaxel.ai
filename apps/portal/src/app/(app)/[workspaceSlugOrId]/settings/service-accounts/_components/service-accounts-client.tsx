"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { EmptyState } from "@repo/ui/components/empty-state";
import { toast } from "sonner";
import type { Org, ServiceAccount } from "@/lib/mock/types";
import { workspaceServiceAccountQueries } from "@/lib/query/workspace-service-accounts";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import CreateServiceAccountDialog from "./create-service-account-dialog";
import CliLine from "./cli-line";
import { formatRelativePast, oldestKeyAgeFor } from "./format";

const columnHelper = createColumnHelper<ServiceAccount>();

interface ServiceAccountsClientProps {
  workspace: Org;
}

export default function ServiceAccountsClient({ workspace }: ServiceAccountsClientProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const router = useRouter();
  const { data: serverAccounts } = useSuspenseQuery(
    workspaceServiceAccountQueries.list(accountId, workspaceId),
  );

  const detailHrefFor = (id: string) =>
    `/${workspace.slug}/settings/service-accounts/${id}`;

  const [accounts, setAccounts] = useState<ReadonlyArray<ServiceAccount>>(serverAccounts);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ServiceAccount | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
    );
  }, [accounts, search]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => {
          const sa = info.row.original;
          return (
            <div className="flex flex-col">
              <span className="text-foreground group-hover/row:underline">
                {sa.name}
              </span>
              <span className="typography-caption text-meta-foreground">
                {sa.description}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => row.apiKeys.length, {
        id: "apiKeyCount",
        header: "API keys",
        cell: (info) => info.getValue(),
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right typography-code text-muted-foreground tabular-nums",
        },
      }),
      columnHelper.accessor((row) => row.apiKeys.length, {
        id: "oldestKey",
        header: "Oldest key",
        cell: ({ row }) => oldestKeyAgeFor(row.original) ?? "—",
        sortingFn: (a, b) => {
          const oldestOf = (sa: ServiceAccount) =>
            sa.apiKeys.length === 0
              ? Number.POSITIVE_INFINITY
              : sa.apiKeys.reduce(
                  (min, k) => Math.min(min, Date.parse(k.createdAt)),
                  Number.POSITIVE_INFINITY,
                );
          return oldestOf(a.original) - oldestOf(b.original);
        },
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right typography-code text-muted-foreground tabular-nums",
        },
      }),
      columnHelper.accessor("lastUsedAt", {
        header: "Last used",
        cell: (info) => formatRelativePast(info.getValue()),
        enableSorting: false,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right typography-code text-muted-foreground tabular-nums",
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <RowMenu
            account={row.original}
            onDelete={() => setPendingDelete(row.original)}
          />
        ),
        meta: { cellClassName: "w-[48px]" },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filtered as ServiceAccount[],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <header className="page-header">
          <h1 className="typography-display text-foreground">
            Service accounts
          </h1>
          <p className="text-muted-foreground">
            Service accounts are identities representing an external system
            that needs to access this Blaxel workspace.
          </p>
        </header>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden="true" />
          <span>Create service account</span>
        </Button>
      </div>

      {accounts.length === 0 ? (
        <ListEmptyState
          onCreate={() => setCreateOpen(true)}
        />
      ) : (
        <section className="flex flex-col gap-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or description…"
            leading={<Search aria-hidden="true" className="size-3.5" />}
            className="max-w-xs"
            aria-label="Search service accounts"
          />
          {filtered.length === 0 ? (
            <EmptyState
              variant="no-results"
              title="No matches"
              cta={
                <Button variant="ghost" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <ResourceTable
              table={table}
              getRowClassName={() => "group/row"}
              onRowClick={(row) => router.push(detailHrefFor(row.original.id))}
              onRowMouseEnter={(row) =>
                router.prefetch(detailHrefFor(row.original.id))
              }
            />
          )}
        </section>
      )}

      <CreateServiceAccountDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(account) => {
          setAccounts((prev) => [account, ...prev]);
          toast.success(`Service account ${account.name} created.`);
        }}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &quot;{pendingDelete?.name ?? ""}&quot;
            </AlertDialogTitle>
            <AlertDialogDescription>
              Every API key issued to{" "}
              <span className="font-mono text-foreground">
                {pendingDelete?.name}
              </span>{" "}
              will be revoked. CI jobs and integrations using those keys will
              start receiving 401 responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingDelete) return;
                setAccounts((prev) =>
                  prev.filter((a) => a.id !== pendingDelete.id),
                );
                toast.success(
                  `Deleted service account ${pendingDelete.name}.`,
                );
              }}
            >
              Delete service account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ListEmptyStateProps {
  onCreate: () => void;
}

function ListEmptyState({ onCreate }: ListEmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-4 rounded-md border border-border bg-card px-6 py-12"
    >
      <p className="text-foreground">
        No service accounts in this workspace.
      </p>
      <CliLine
        className="w-full max-w-2xl"
        command="bl service-account create --name github-actions-deploy"
      />
      <Button variant="ghost" onClick={onCreate}>
        Create service account
      </Button>
    </div>
  );
}

interface RowMenuProps {
  account: ServiceAccount;
  onDelete: () => void;
}

function RowMenu({ account, onDelete }: RowMenuProps) {
  return (
    <div
      // Kebab visible on row hover only — reduces visual noise in dense
      // lists. stopPropagation keeps the menu trigger from doubling as a
      // row-navigation click handled by ResourceTable.onRowClick.
      className="flex justify-end opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100"
      onClick={(event) => event.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={`Actions for ${account.name}`}
          >
            <MoreHorizontal />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            onSelect={onDelete}
            className="text-destructive focus:text-destructive"
          >
            Delete service account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
