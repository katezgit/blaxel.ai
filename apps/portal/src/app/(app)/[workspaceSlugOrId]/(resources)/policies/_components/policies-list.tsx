"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@repo/ui/components/badge";
import type { Policy, PolicyStatus } from "@/lib/mock/policies";
import { policyQueries } from "@/lib/query/policies";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";

const STATUS_VARIANT: Record<PolicyStatus, "success" | "warning" | "neutral"> = {
  enforced: "success",
  audit: "warning",
  draft: "neutral",
};

const columnHelper = createColumnHelper<Policy>();

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
  columnHelper.accessor("rule", {
    header: "Rule",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "text-muted-foreground" },
  }),
];

export function PoliciesList() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: rows } = useSuspenseQuery(policyQueries.list(accountId, workspaceId));
  const table = useReactTable({
    data: rows as Policy[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ResourceTable table={table} />;
}
