"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@repo/ui/components/badge";
import type { Agent, AgentStatus } from "@/lib/mock/agents";
import { agentQueries } from "@/lib/query/agents";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { dateStyle: "short" });

const STATUS_VARIANT: Record<AgentStatus, "success" | "neutral" | "warning"> = {
  deployed: "success",
  draft: "neutral",
  paused: "warning",
};

const columnHelper = createColumnHelper<Agent>();

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
  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "text-muted-foreground" },
  }),
  columnHelper.accessor("lastDeployed", {
    header: "Last deployed",
    cell: (info) => {
      const value = info.getValue();
      return value ? DATE_FMT.format(new Date(value)) : "—";
    },
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono typography-label text-muted-foreground tabular-nums",
    },
  }),
];

export function AgentsList() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: rows } = useSuspenseQuery(agentQueries.list(accountId, workspaceId));
  const table = useReactTable({
    data: rows as Agent[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ResourceTable table={table} />;
}
