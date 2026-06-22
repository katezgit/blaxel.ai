"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MoreHorizontal, Plug, Plus } from "lucide-react";
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
import { IconButton } from "@repo/ui/components/icon-button";
import type { Integration, IntegrationConnection } from "@/lib/mock/types";
import { workspaceIntegrationQueries } from "@/lib/query/workspace-integrations";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";
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
}

export default function ConnectionsView({
  integration,
}: ConnectionsViewProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const params = useParams<{ workspaceSlugOrId: string }>();
  const workspaceSlug = params.workspaceSlugOrId;

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

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "Name",
        cell: (info) => (
          <span className="font-mono typography-label text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("apiKeyPreview", {
        header: "API key",
        cell: (info) => (
          <code className="inline-flex items-center rounded-sm border border-border bg-muted-surface px-2 py-1 font-mono typography-caption text-muted-foreground">
            {info.getValue()}
          </code>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => (
          <span className="font-mono typography-label text-muted-foreground">
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
            <Avatar size="md" shape="square" className="hidden sm:flex">
              {integration.logoUrl && (
                <AvatarImage src={integration.logoUrl} alt={integration.name} />
              )}
              <AvatarFallback>{integration.logoInitial}</AvatarFallback>
            </Avatar>
            <div className="page-header">
              <h1 className="typography-display font-semibold text-foreground">
                {integration.name}
              </h1>
              <p className="text-muted-foreground">
                <span className="text-meta-foreground">
                  {integration.category === "model" ? "Model" : "MCP server"}
                </span>
                {" · "}
                {integration.description}
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
        <div className="rounded-md border border-border bg-secondary-surface overflow-hidden">
          {/* Inline empty-state composition — uses tighter on-canon spacing
              (py-8 / size-10 icon tile / size-6 inner) than the DS EmptyState
              primitive ships with. See blaxel.ai/blaxel.ai#50 for DS refinement. */}
          <div
            role="status"
            className="flex flex-col items-center justify-center gap-4 px-6 py-8 text-center"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-card">
              <Plug aria-hidden="true" className="size-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="typography-body font-medium text-foreground">
                No {integration.name} connections yet
              </p>
              <p className="typography-body text-muted-foreground">
                Connect this workspace with an API key to start using it from
                agents and the CLI.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setDrawer({ mode: "create" })}
            >
              <Plus aria-hidden="true" />
              <span>Create integration</span>
            </Button>
          </div>
        </div>
      ) : (
        <ResourceTable table={table} />
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
            <p className="typography-body text-muted-foreground">
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
