"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@repo/ui/components/badge";
import type { CustomDomain, CustomDomainStatus } from "@/lib/mock/custom-domains";
import { customDomainQueries } from "@/lib/query/custom-domains";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ResourceTable } from "@/app/(app)/_components/resource-table";

const STATUS_LABEL: Record<CustomDomainStatus, string> = {
  active: "Active",
  "pending-dns": "Pending DNS",
  error: "Error",
};

const STATUS_VARIANT: Record<CustomDomainStatus, "success" | "warning" | "destructive"> = {
  active: "success",
  "pending-dns": "warning",
  error: "destructive",
};

const columnHelper = createColumnHelper<CustomDomain>();

const columns = [
  columnHelper.accessor("domain", {
    header: "Domain",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono text-label" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <Badge variant={STATUS_VARIANT[info.getValue()]} showDot>
        {STATUS_LABEL[info.getValue()]}
      </Badge>
    ),
  }),
  columnHelper.accessor("target", {
    header: "Target",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono text-label text-muted-foreground" },
  }),
];

export function CustomDomainsList() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: rows } = useSuspenseQuery(customDomainQueries.list(accountId, workspaceId));
  const table = useReactTable({
    data: rows as CustomDomain[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ResourceTable table={table} />;
}
