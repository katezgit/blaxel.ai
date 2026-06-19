"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IconButton } from "@repo/ui/components/icon-button";
import ManageTable from "@/app/(manage)/_components/manage-table";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import type { OAuthConnection } from "@/lib/mock/profile";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

interface OAuthConnectionsCardProps {
  connections: ReadonlyArray<OAuthConnection>;
  lastUsedProviderLabel?: string;
}

const columnHelper = createColumnHelper<OAuthConnection>();

export default function OAuthConnectionsCard({
  connections,
  lastUsedProviderLabel,
}: OAuthConnectionsCardProps) {
  // Disconnecting your only sign-in method would lock you out, so the action
  // is hidden entirely (rather than rendered-but-disabled — a dead trash icon
  // teases an option that isn't real).
  const canDisconnect = connections.length > 1;

  const columns = useMemo(
    () => [
      columnHelper.accessor("label", {
        header: "Provider",
        cell: (info) => (
          <span className="font-medium text-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Connected",
        cell: (info) => DATE_FMT.format(new Date(info.getValue())),
        meta: { cellClassName: "font-mono text-label text-muted-foreground" },
      }),
      ...(canDisconnect
        ? [
            columnHelper.display({
              id: "actions",
              header: () => null,
              cell: () => (
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label="Disconnect provider"
                >
                  <Trash2 aria-hidden="true" />
                </IconButton>
              ),
              meta: {
                headerClassName: "w-10",
                cellClassName: "text-right",
              },
            }),
          ]
        : []),
    ],
    [canDisconnect],
  );

  const table = useReactTable({
    data: connections as OAuthConnection[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Panel title="Sign-in providers">
      {lastUsedProviderLabel ? (
        <p className="mb-4 text-body text-muted-foreground">
          You most recently signed in with{" "}
          <span className="font-medium text-foreground">
            {lastUsedProviderLabel}
          </span>
          .
        </p>
      ) : null}
      <ManageTable table={table} bordered noRowHover={!canDisconnect} />
    </Panel>
  );
}
