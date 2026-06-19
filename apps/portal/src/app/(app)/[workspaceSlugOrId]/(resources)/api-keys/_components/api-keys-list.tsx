"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ApiKey } from "@/lib/mock/types";
import { workspaceApiKeyQueries } from "@/lib/query/workspace-api-keys";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { dateStyle: "short" });

const columnHelper = createColumnHelper<ApiKey>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono text-label" },
  }),
  columnHelper.accessor("masked", {
    header: "Key",
    cell: (info) => (
      <code className="inline-flex items-center rounded-sm border border-border bg-muted-surface px-2 py-1 font-mono text-caption text-muted-foreground">
        {info.getValue()}
      </code>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    cell: (info) => DATE_FMT.format(new Date(info.getValue())),
    meta: { cellClassName: "font-mono text-label text-muted-foreground" },
  }),
  columnHelper.accessor("expiresAt", {
    header: "Expires",
    cell: (info) => {
      const value = info.getValue();
      return value ? DATE_FMT.format(new Date(value)) : "Never";
    },
    meta: { cellClassName: "font-mono text-label text-muted-foreground" },
  }),
];

export function ApiKeysList() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: rows } = useSuspenseQuery(workspaceApiKeyQueries.list(accountId, workspaceId));
  const table = useReactTable({
    data: rows as ApiKey[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ResourceTable table={table} />;
}
