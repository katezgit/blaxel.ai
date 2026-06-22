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
import { KeyRound, MoreHorizontal, Plus, Search, User, UserCog } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/empty-state";
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@repo/ui/lib/cn";
import type { ApiKey, Org } from "@/lib/mock/types";
import { workspaceApiKeyQueries } from "@/lib/query/workspace-api-keys";
import { workspaceServiceAccountQueries } from "@/lib/query/workspace-service-accounts";
import { workspaceTeamQueries } from "@/lib/query/workspace-team";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import ConfirmByNameDialog from "../../_components/confirm-by-name-dialog";
import ApiKeysTable from "./api-keys-table";
import CreateApiKeyDialog from "./create-api-key-dialog";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Los_Angeles",
});

const columnHelper = createColumnHelper<ApiKey>();

interface ApiKeysClientProps {
  workspace: Org;
}

export default function ApiKeysClient({ workspace }: ApiKeysClientProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: serverKeys } = useSuspenseQuery(
    workspaceApiKeyQueries.list(accountId, workspaceId),
  );
  const { data: members } = useSuspenseQuery(
    workspaceTeamQueries.list(accountId, workspaceId),
  );
  const { data: serviceAccounts } = useSuspenseQuery(
    workspaceServiceAccountQueries.list(accountId, workspaceId),
  );

  const [keys, setKeys] = useState<ReadonlyArray<ApiKey>>(serverKeys);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<ApiKey | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return keys;
    return keys.filter((k) =>
      [k.name, k.masked, k.issuedTo?.name ?? ""]
        .some((field) => field.toLowerCase().includes(q)),
    );
  }, [keys, search]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <span className="typography-label font-medium text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.issuedTo?.name ?? "—", {
        id: "issuedTo",
        header: "Issued to",
        cell: ({ row }) => <IssuedToCell apiKey={row.original} />,
      }),
      columnHelper.accessor("masked", {
        header: "Key prefix",
        cell: (info) => (
          <code className="inline-flex items-center rounded-sm border border-border bg-muted-surface px-2 py-1 font-mono typography-caption text-muted-foreground">
            {info.getValue()}
          </code>
        ),
      }),
      columnHelper.accessor("expiresAt", {
        header: "Expires",
        cell: (info) => <ExpiresCell expiresAt={info.getValue()} />,
      }),
      columnHelper.accessor("createdAt", {
        header: "Created at (UTC-7)",
        cell: (info) => (
          <span className="font-mono typography-label text-muted-foreground">
            {DATE_FMT.format(new Date(info.getValue()))}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <RowMenu
            apiKey={row.original}
            onRotate={() =>
              toast.success(`Rotated key ${row.original.name} (mock).`)
            }
            onRevoke={() => setPendingRevoke(row.original)}
          />
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filtered as ApiKey[],
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
          <h1 className="typography-display font-semibold text-foreground">API keys</h1>
          <p className="text-muted-foreground">
            Workspace-scoped credentials for the API and CLI. Issued to a member
            or a service account; the holder&apos;s role decides what the key can
            do.
          </p>
        </header>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden="true" />
          <span>Create API key</span>
        </Button>
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search API keys"
        leading={<Search aria-hidden="true" className="size-3.5" />}
        className="max-w-xs"
        aria-label="Search API keys"
      />

      {keys.length === 0 ? (
        <EmptyState
          variant="zero-state"
          icon={KeyRound}
          title="No API keys yet"
          subtitle="Workspace keys authenticate the CLI, SDKs, and integrations against this workspace."
          cta={
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              <span>Create your first key</span>
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="no-results"
          title="No keys match"
          cta={
            <Button variant="secondary" onClick={() => setSearch("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <ApiKeysTable
          table={table}
          getRowClassName={(row) =>
            classifyExpiry(row.original.expiresAt) === "near"
              ? "bg-state-warning-subtle border-l-2 border-l-state-warning hover:bg-state-warning-subtle"
              : undefined
          }
        />
      )}

      <CreateApiKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        members={members}
        serviceAccounts={serviceAccounts}
        onCreated={(apiKey) => {
          setKeys((prev) => [apiKey, ...prev]);
          toast.success(`API key ${apiKey.name} created.`);
        }}
      />

      <ConfirmByNameDialog
        open={pendingRevoke !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRevoke(null);
        }}
        actionLabel="Revoke key"
        targetLabel={pendingRevoke?.name ?? ""}
        workspaceName={workspace.name}
        description={
          <>
            This will permanently revoke the key. Any CLI, SDK, or integration
            using it will start receiving 401 responses.
          </>
        }
        onConfirm={() => {
          if (!pendingRevoke) return;
          setKeys((prev) => prev.filter((k) => k.id !== pendingRevoke.id));
          toast.success(`Revoked ${pendingRevoke.name}.`);
          setPendingRevoke(null);
        }}
      />
    </section>
  );
}

// Near-expiry window — Alex's rotation lookahead. Rows within this window get
// the warning row treatment so the "which keys do I need to rotate?" question
// is answerable in one glance. Mirrors the Open-invoice and expired-invite
// rows shipping on the same branch.
const NEAR_EXPIRY_DAYS = 7;

type ExpiryClass = "never" | "expired" | "near" | "future";

function classifyExpiry(expiresAt: string | null): ExpiryClass {
  if (!expiresAt) return "never";
  const days = daysUntil(expiresAt);
  if (days <= 0) return "expired";
  if (days <= NEAR_EXPIRY_DAYS) return "near";
  return "future";
}

// Ceil so "1.2 days from now" shows "in 2d" rather than rounding down to 1d
// while the key is still valid for more than a calendar day.
function daysUntil(isoDate: string): number {
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86400000);
}

function ExpiresCell({ expiresAt }: { expiresAt: string | null }) {
  const kind = classifyExpiry(expiresAt);
  if (kind === "never") {
    return <span className="typography-label text-muted-foreground">Never</span>;
  }
  if (kind === "expired") {
    return (
      <span className="font-mono typography-label text-destructive">Expired</span>
    );
  }
  const days = daysUntil(expiresAt as string);
  return (
    <span
      className={cn(
        "font-mono typography-label",
        kind === "near" ? "text-state-warning" : "text-muted-foreground",
      )}
    >
      in {days}d
    </span>
  );
}

function IssuedToCell({ apiKey }: { apiKey: ApiKey }) {
  if (!apiKey.issuedTo) {
    return <span className="typography-label text-meta-foreground">—</span>;
  }
  const Icon = apiKey.issuedTo.kind === "member" ? User : UserCog;
  return (
    <span className="inline-flex items-center gap-1.5 typography-label text-foreground">
      <Icon aria-hidden="true" className="size-3.5 shrink-0 text-meta-foreground" />
      <span>{apiKey.issuedTo.name}</span>
      <span className="font-mono typography-meta text-meta-foreground">
        {apiKey.issuedTo.kind === "member" ? "member" : "service"}
      </span>
    </span>
  );
}

interface RowMenuProps {
  apiKey: ApiKey;
  onRotate: () => void;
  onRevoke: () => void;
}

function RowMenu({ apiKey, onRotate, onRevoke }: RowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={`Actions for ${apiKey.name}`}
        >
          <MoreHorizontal />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={onRotate}>Rotate</DropdownMenuItem>
        <DropdownMenuItem
          onSelect={onRevoke}
          className="text-destructive focus:text-destructive"
        >
          Revoke
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
