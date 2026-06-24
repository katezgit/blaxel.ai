"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@repo/ui/components/badge";
import type { Job, JobStatus } from "@/lib/mock/jobs";
import { jobQueries } from "@/lib/query/jobs";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
  timeStyle: "short",
});

const STATUS_VARIANT: Record<JobStatus, "success" | "neutral" | "warning" | "destructive"> = {
  running: "warning",
  queued: "neutral",
  succeeded: "success",
  failed: "destructive",
};

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

const columnHelper = createColumnHelper<Job>();

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
  columnHelper.accessor("startedAt", {
    header: "Started",
    cell: (info) => {
      const value = info.getValue();
      return value ? DATE_FMT.format(new Date(value)) : "—";
    },
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono text-muted-foreground tabular-nums",
    },
  }),
  columnHelper.accessor("durationSec", {
    header: "Duration",
    cell: (info) => formatDuration(info.getValue()),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono text-muted-foreground tabular-nums",
    },
  }),
];

export function JobsList() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: rows } = useSuspenseQuery(jobQueries.list(accountId, workspaceId));
  const table = useReactTable({
    data: rows as Job[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ResourceTable table={table} />;
}
