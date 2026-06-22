"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import MembersTable from "./members-table";
import { memberQueries } from "@/lib/query/members";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";

export function MembersUserView() {
  const { accountId } = useCurrentTenancy();
  const { data: members } = useSuspenseQuery(memberQueries.listForUserTier(accountId));
  return (
    <>
      <MembersTable members={members} />
      <p className="mt-4 typography-caption text-meta-foreground">
        You can see the roster, but only owners and admins can invite or remove members.
      </p>
    </>
  );
}
