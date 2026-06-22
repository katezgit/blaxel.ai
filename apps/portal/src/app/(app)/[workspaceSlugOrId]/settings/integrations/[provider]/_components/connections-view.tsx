"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { EmptyState } from "@repo/ui/components/empty-state";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
import type { Integration, IntegrationConnection } from "@/lib/mock/types";
import { workspaceIntegrationQueries } from "@/lib/query/workspace-integrations";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import ConnectionDrawer, {
  type DrawerState,
} from "./connection-drawer";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const columnHelper = createColumnHelper<IntegrationConnection>();

interface ConnectionsViewProps {
  integration: Integration;
  autoOpenCreate: boolean;
}

export default function ConnectionsView({
  integration,
  autoOpenCreate,
}: ConnectionsViewProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const params = useParams<{ workspaceSlugOrId: string }>();
  const workspaceSlug = params.workspaceSlugOrId;
  const router = useRouter();

  const { data: allConnections } = useSuspenseQuery(
    workspaceIntegrationQueries.connections(accountId, workspaceId),
  );

  const connections = useMemo(
    () => allConnections.filter((c) => c.providerId === integration.id),
    [allConnections, integration.id],
  );

  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [pendingRemove, setPendingRemove] =
    useState<IntegrationConnection | null>(null);

  // Auto-open create on `?action=create` and strip the query so back/forward
  // doesn't re-trigger the drawer. Runs once on mount because `autoOpenCreate`
  // is bound to the server-rendered URL — by the time the user reopens, the
  // searchParam is already gone.
  useEffect(() => {
    if (!autoOpenCreate) return;
    setDrawer({ mode: "create" });
    router.replace(
      `/${workspaceSlug}/settings/integrations/${integration.id}`,
      { scroll: false },
    );
  }, [autoOpenCreate, integration.id, router, workspaceSlug]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "Name",
        cell: (info) => (
          <span className="font-mono text-label text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("apiKeyPreview", {
        header: "API key",
        cell: (info) => (
          <code className="inline-flex items-center rounded-sm border border-border bg-muted-surface px-2 py-1 font-mono text-caption text-muted-foreground">
            {info.getValue()}
          </code>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => (
          <span className="font-mono text-label text-muted-foreground">
            {DATE_FMT.format(new Date(info.getValue()))}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        meta: { headerClassName: "w-10", cellClassName: "w-10 text-right" },
        cell: ({ row }) => (
          <RowMenu
            connection={row.original}
            onEdit={() =>
              setDrawer({ mode: "edit", connection: row.original })
            }
            onRemove={() => setPendingRemove(row.original)}
          />
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: connections as IntegrationConnection[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Breadcrumb
          parent={{
            href: `/${workspaceSlug}/settings/integrations`,
            label: "Integrations",
          }}
          current={integration.name}
        />
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex items-start gap-3">
            <Avatar size="lg" shape="square">
              {integration.logoUrl && (
                <AvatarImage src={integration.logoUrl} alt={integration.name} />
              )}
              <AvatarFallback>{integration.logoInitial}</AvatarFallback>
            </Avatar>
            <div className="page-header">
              <h1 className="text-display font-semibold text-foreground">
                {integration.name}
              </h1>
              <p className="text-muted-foreground">{integration.description}</p>
              <p className="mt-1 text-meta text-meta-foreground">
                {integration.category === "model" ? "Model" : "MCP server"}
              </p>
            </div>
          </div>
          {connections.length > 0 && (
            <Button
              variant="primary"
              onClick={() => setDrawer({ mode: "create" })}
            >
              <Plus aria-hidden="true" />
              <span>Create integration</span>
            </Button>
          )}
        </div>
      </header>

      {connections.length === 0 ? (
        <EmptyState
          variant="zero-state"
          title={`No ${integration.name} connections yet`}
          subtitle="Connect this workspace with an API key to start using it from agents and the CLI."
          cta={
            <Button
              variant="primary"
              onClick={() => setDrawer({ mode: "create" })}
            >
              <Plus aria-hidden="true" />
              <span>Create integration</span>
            </Button>
          }
        />
      ) : (
        <ConnectionsTable table={table} />
      )}

      <ConnectionDrawer
        provider={integration}
        state={drawer}
        onClose={() => setDrawer(null)}
      />

      <Dialog
        open={pendingRemove !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemove(null);
        }}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Remove {pendingRemove?.id}?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-body text-muted-foreground">
              Agents and CLI sessions using this connection will start receiving
              401 responses immediately. This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setPendingRemove(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!pendingRemove) return;
                toast.success(`Removed ${pendingRemove.id}.`);
                setPendingRemove(null);
              }}
            >
              Remove connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

interface ConnectionsTableProps {
  table: ReturnType<typeof useReactTable<IntegrationConnection>>;
}

function ConnectionsTable({ table }: ConnectionsTableProps) {
  return (
    <div className="relative w-full overflow-hidden overflow-x-auto rounded-md border border-border bg-card">
      <table className={tableClass}>
        <thead className={tableHeaderClass}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as
                  | { headerClassName?: string }
                  | undefined;
                return (
                  <th
                    key={header.id}
                    className={cn(tableHeadVariants(), meta?.headerClassName)}
                  >
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className={tableBodyClass}>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={tableRowVariants()}>
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as
                  | { cellClassName?: string }
                  | undefined;
                return (
                  <td
                    key={cell.id}
                    className={cn(tableCellVariants(), meta?.cellClassName)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface RowMenuProps {
  connection: IntegrationConnection;
  onEdit: () => void;
  onRemove: () => void;
}

function RowMenu({ connection, onEdit, onRemove }: RowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={`Actions for ${connection.id}`}
        >
          <MoreHorizontal />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem
          onSelect={onRemove}
          className="text-destructive focus:text-destructive"
        >
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
