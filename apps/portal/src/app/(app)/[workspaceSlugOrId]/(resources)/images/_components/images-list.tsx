"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@repo/ui/components/badge";
import type { Image, ImageStatus } from "@/lib/mock/images";
import { imageQueries } from "@/lib/query/images";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";

const STATUS_VARIANT: Record<ImageStatus, "success" | "warning" | "destructive"> = {
  ready: "success",
  building: "warning",
  failed: "destructive",
};

function formatSize(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024 * 1024 * 1024) return `${Math.round(bytes / 1024 / 1024)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

const columnHelper = createColumnHelper<Image>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono typography-label" },
  }),
  columnHelper.accessor("tag", {
    header: "Tag",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono typography-label text-muted-foreground" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <Badge variant={STATUS_VARIANT[info.getValue()]} showDot>
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("size", {
    header: "Size",
    cell: (info) => formatSize(info.getValue()),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono typography-label text-muted-foreground tabular-nums",
    },
  }),
];

export function ImagesList() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: rows } = useSuspenseQuery(imageQueries.list(accountId, workspaceId));
  const table = useReactTable({
    data: rows as Image[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ResourceTable table={table} />;
}
