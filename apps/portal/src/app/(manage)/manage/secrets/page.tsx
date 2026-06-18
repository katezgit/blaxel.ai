import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import AdminGate from "@/app/(manage)/_components/admin-gate";
import { ManagePageAction } from "@/app/(manage)/_components/manage-page-action";
import { getQueryClient } from "@/lib/query/get-query-client";
import { secretQueries } from "@/lib/query/secrets";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { SecretsTable } from "./_components";

export const metadata: Metadata = {
  title: "Secrets",
};

export default async function SecretsPage() {
  const { accountId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(secretQueries.list(accountId));
  return (
    <AdminGate>
      <ManagePageAction>
        <Button variant="primary">
          <PlusIcon aria-hidden="true" className="size-3.5" />
          Add Secret
        </Button>
      </ManagePageAction>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SecretsTable />
      </HydrationBoundary>
    </AdminGate>
  );
}
