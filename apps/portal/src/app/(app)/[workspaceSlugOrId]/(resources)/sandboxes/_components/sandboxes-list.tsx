"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@repo/ui/components/badge";
import type { Sandbox, SandboxStatus } from "@/lib/mock/sandboxes";
import { sandboxQueries } from "@/lib/query/sandboxes";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
  timeStyle: "short",
});

const STATUS_VARIANT: Record<SandboxStatus, "success" | "neutral" | "warning"> = {
  running: "success",
  idle: "neutral",
  stopped: "warning",
};

const columnHelper = createColumnHelper<Sandbox>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono text-foreground" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <Badge variant={STATUS_VARIANT[info.getValue()]} showDot>
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("image", {
    header: "Image",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono text-muted-foreground" },
  }),
  columnHelper.accessor("lastActive", {
    header: "Last active",
    cell: (info) => DATE_FMT.format(new Date(info.getValue())),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono text-muted-foreground tabular-nums",
    },
  }),
];

export function SandboxesList() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: rows } = useSuspenseQuery(sandboxQueries.list(accountId, workspaceId));
  const table = useReactTable({
    data: rows as Sandbox[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ResourceTable table={table} />;
}
