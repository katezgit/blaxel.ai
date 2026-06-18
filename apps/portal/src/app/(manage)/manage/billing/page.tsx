import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import AdminGate from "@/app/(manage)/_components/admin-gate";
import { getQueryClient } from "@/lib/query/get-query-client";
import { billingQueries } from "@/lib/query/billing";
import { creditQueries } from "@/lib/query/credits";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { BillingHistoryPanel, BillingPlanPanel } from "./_components";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const { accountId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(creditQueries.state(accountId)),
    queryClient.prefetchQuery(billingQueries.history(accountId)),
  ]);
  return (
    <AdminGate>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BillingPlanPanel />
        <BillingHistoryPanel />
      </HydrationBoundary>
    </AdminGate>
  );
}
