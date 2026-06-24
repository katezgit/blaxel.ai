"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { KeyRound, MoreHorizontal, Plus, Search, Shield, User, UserCog } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
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
import { cn } from "@repo/ui/lib/cn";
import type { Org, ServiceAccount } from "@/lib/mock/types";
import { workspaceServiceAccountQueries } from "@/lib/query/workspace-service-accounts";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";
import ConfirmByNameDialog from "../../_components/confirm-by-name-dialog";
import CreateServiceAccountDialog from "./create-service-account-dialog";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Los_Angeles",
});

const ROLE_LABEL: Record<"owner" | "admin" | "member", string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

const ROLE_ICON = {
  owner: Shield,
  admin: Shield,
  member: User,
} as const;

const columnHelper = createColumnHelper<ServiceAccount>();

interface ServiceAccountsClientProps {
  workspace: Org;
}

export default function ServiceAccountsClient({ workspace }: ServiceAccountsClientProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: serverAccounts } = useSuspenseQuery(
    workspaceServiceAccountQueries.list(accountId, workspaceId),
  );

  const [accounts, setAccounts] = useState<ReadonlyArray<ServiceAccount>>(serverAccounts);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ServiceAccount | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.clientId.toLowerCase().includes(q),
    );
  }, [accounts, search]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <span className="font-medium text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("clientId", {
        header: "Client ID",
        cell: (info) => (
          <span className="inline-flex items-center gap-1.5">
            <code className="typography-code text-muted-foreground">
              {info.getValue()}
            </code>
            <CopyButton
              value={info.getValue()}
              ariaLabel="Copy client ID"
            />
          </span>
        ),
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => {
          const role = info.getValue();
          const Icon = ROLE_ICON[role];
          return (
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <Icon aria-hidden="true" className="size-3.5 shrink-0 text-meta-foreground" />
              <span>{ROLE_LABEL[role]}</span>
            </span>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Created at (UTC-7)",
        cell: (info) => (
          <span className="typography-code text-muted-foreground">
            {DATE_FMT.format(new Date(info.getValue()))}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <RowMenu
            account={row.original}
            onRotate={() =>
              toast.success(
                `Rotated secret for ${row.original.name} (mock).`,
              )
            }
            onDelete={() => setPendingDelete(row.original)}
          />
        ),
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
    <section className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <header className="page-header">
          <h1 className="typography-display font-semibold text-foreground">
            Service accounts
          </h1>
          <p className="text-muted-foreground">
            Non-human identities for integrations, CI/CD, and third-party services
            that act on this workspace.
          </p>
        </header>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden="true" />
          <span>Create service account</span>
        </Button>
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search service accounts"
        leading={<Search aria-hidden="true" className="size-3.5" />}
        className="max-w-xs"
        aria-label="Search service accounts"
      />

      {accounts.length === 0 ? (
        <EmptyState
          variant="zero-state"
          icon={UserCog}
          title="No service accounts yet"
          subtitle="Service accounts hold long-lived credentials so integrations, CI, and bots can act on this workspace."
          cta={
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              <span>Create your first service account</span>
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="no-results"
          title="No service accounts match"
          cta={
            <Button variant="secondary" onClick={() => setSearch("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <ResourceTable table={table} />
      )}

      <CreateServiceAccountDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(account) => {
          setAccounts((prev) => [account, ...prev]);
          toast.success(`Service account ${account.name} created.`);
        }}
      />

      <ConfirmByNameDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        actionLabel="Delete service account"
        targetLabel={pendingDelete?.name ?? ""}
        workspaceName={workspace.name}
        description={
          <>
            Every API key issued to{" "}
            <span className="font-mono text-foreground">
              {pendingDelete?.name}
            </span>{" "}
            will be revoked. CI jobs and integrations using those keys will
            start receiving 401 responses.
          </>
        }
        details={
          <div className="rounded-md border border-border bg-secondary-surface p-3">
            <p className="flex items-center gap-2 typography-caption text-muted-foreground">
              <KeyRound aria-hidden="true" className="size-3.5" />
              <span>Mock: this would also revoke linked workspace API keys.</span>
            </p>
          </div>
        }
        onConfirm={() => {
          if (!pendingDelete) return;
          setAccounts((prev) => prev.filter((a) => a.id !== pendingDelete.id));
          toast.success(`Deleted service account ${pendingDelete.name}.`);
          setPendingDelete(null);
        }}
      />
    </section>
  );
}

interface RowMenuProps {
  account: ServiceAccount;
  onRotate: () => void;
  onDelete: () => void;
}

function RowMenu({ account, onRotate, onDelete }: RowMenuProps) {
  return (
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
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={onRotate}>Rotate secret</DropdownMenuItem>
        <DropdownMenuItem
          onSelect={onDelete}
          className={cn("text-destructive focus:text-destructive")}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
