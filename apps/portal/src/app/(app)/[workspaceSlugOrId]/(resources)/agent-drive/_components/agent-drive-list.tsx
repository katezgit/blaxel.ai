"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { AgentDriveItem } from "@/lib/mock/agent-drive";
import { agentDriveQueries } from "@/lib/query/agent-drive";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const columnHelper = createColumnHelper<AgentDriveItem>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "typography-code text-foreground" },
  }),
  columnHelper.accessor("kind", {
    header: "Kind",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "text-muted-foreground" },
  }),
  columnHelper.accessor("size", {
    header: "Size",
    cell: (info) => formatSize(info.getValue()),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right typography-code text-muted-foreground tabular-nums",
    },
  }),
  columnHelper.accessor("updatedAt", {
    header: "Updated",
    cell: (info) => DATE_FMT.format(new Date(info.getValue())),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right typography-code text-muted-foreground tabular-nums",
    },
  }),
];

export function AgentDriveList() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: rows } = useSuspenseQuery(agentDriveQueries.list(accountId, workspaceId));
  const table = useReactTable({
    data: rows as AgentDriveItem[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ResourceTable table={table} />;
}
