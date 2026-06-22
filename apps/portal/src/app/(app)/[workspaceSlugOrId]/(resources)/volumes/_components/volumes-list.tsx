"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@repo/ui/components/badge";
import type { Volume, VolumeStatus } from "@/lib/mock/volumes";
import { volumeQueries } from "@/lib/query/volumes";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";

const STATUS_VARIANT: Record<VolumeStatus, "success" | "neutral" | "warning"> = {
  attached: "success",
  available: "neutral",
  detached: "warning",
};

const columnHelper = createColumnHelper<Volume>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono typography-label" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <Badge variant={STATUS_VARIANT[info.getValue()]} showDot>
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("sizeGb", {
    header: "Size",
    cell: (info) => `${info.getValue()} GB`,
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono typography-label text-muted-foreground tabular-nums",
    },
  }),
  columnHelper.accessor("attachedTo", {
    header: "Attached to",
    cell: (info) => info.getValue() ?? "—",
    meta: { cellClassName: "font-mono typography-label text-muted-foreground" },
  }),
];

export function VolumesList() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: rows } = useSuspenseQuery(volumeQueries.list(accountId, workspaceId));
  const table = useReactTable({
    data: rows as Volume[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ResourceTable table={table} />;
}
