"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@repo/ui/components/badge";
import type { McpServer, McpServerStatus } from "@/lib/mock/mcp-servers";
import { mcpServerQueries } from "@/lib/query/mcp-servers";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";

const STATUS_VARIANT: Record<McpServerStatus, "success" | "warning" | "destructive"> = {
  connected: "success",
  disconnected: "warning",
  error: "destructive",
};

const columnHelper = createColumnHelper<McpServer>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono text-label" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <Badge variant={STATUS_VARIANT[info.getValue()]} showDot>
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("tools", {
    header: "Tools",
    cell: (info) => info.getValue(),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono text-label text-muted-foreground tabular-nums",
    },
  }),
  columnHelper.accessor("endpoint", {
    header: "Endpoint",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono text-label text-muted-foreground" },
  }),
];

export function McpServersList() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: rows } = useSuspenseQuery(mcpServerQueries.list(accountId, workspaceId));
  const table = useReactTable({
    data: rows as McpServer[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ResourceTable table={table} />;
}
