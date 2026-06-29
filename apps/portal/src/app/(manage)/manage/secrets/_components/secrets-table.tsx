'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import ManageTable from "@/app/(manage)/_components/manage-table";
import type { Secret } from "@/lib/mock/types";
import { secretQueries } from "@/lib/query/secrets";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";

const columnHelper = createColumnHelper<Secret>();

// Write-only secrets: post-save, the value is never re-readable from the UI.
// To rotate, the user overwrites via Edit; to remove, Delete. This matches
// GitHub Actions / Vercel encrypted env / API-key dashboards (Stripe, OpenAI,
// Anthropic) — the issuer (W&B, HF) is the source of truth, not Blaxel.
const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono typography-label" },
  }),
  columnHelper.display({
    id: "value",
    header: "Value",
    cell: () => (
      <code className="inline-flex items-center rounded-sm border border-border bg-muted-surface px-2 py-1 font-mono typography-caption text-muted-foreground">
        ••••••••
      </code>
    ),
  }),
  columnHelper.accessor("scope", {
    header: "Scope",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "text-muted-foreground" },
  }),
];

export function SecretsTable() {
  const { accountId } = useCurrentTenancy();
  const { data: rows } = useSuspenseQuery(secretQueries.list(accountId));
  const table = useReactTable({
    data: rows as Secret[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ManageTable table={table} bordered />;
}
