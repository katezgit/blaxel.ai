import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import AdminGate from "@/app/(manage)/_components/admin-gate";
import { getQueryClient } from "@/lib/query/get-query-client";
import { limitQueries } from "@/lib/query/limits";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { LimitsTable } from "./_components";

export const metadata: Metadata = {
  title: "Limits",
};

export default async function LimitsPage() {
  const { accountId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(limitQueries.list(accountId));
  return (
    <AdminGate>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <LimitsTable />
      </HydrationBoundary>
    </AdminGate>
  );
}
