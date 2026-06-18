"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@repo/ui/components/button";
import { ManagePageAction } from "@/app/(manage)/_components/manage-page-action";
import { InviteMemberPanel } from "./invite-member-panel";
import MembersTable from "./members-table";
import { RemoveMemberButton } from "./remove-member-button";
import type { Member } from "@/lib/mock/types";
import { memberQueries } from "@/lib/query/members";
import { queryKeys } from "@/lib/query/keys";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";

export function MembersAdminView() {
  const { accountId } = useCurrentTenancy();
  const queryClient = useQueryClient();
  const [inviting, setInviting] = useState(false);
  const { data: members } = useSuspenseQuery(memberQueries.list(accountId));

  const removeMutation = useMutation({
    mutationFn: async (id: string) => id,
    onSuccess: (id) => {
      queryClient.setQueryData<ReadonlyArray<Member>>(
        queryKeys.members(accountId),
        (prev) => (prev ?? []).filter((m) => m.id !== id),
      );
    },
  });

  const handleRemove = (id: string) => {
    removeMutation.mutate(id);
  };

  return (
    <>
      <ManagePageAction>
        <Button variant="primary" onClick={() => setInviting(true)}>
          <PlusIcon aria-hidden="true" className="size-3.5" />
          Invite Member
        </Button>
      </ManagePageAction>
      <InviteMemberPanel open={inviting} onOpenChange={setInviting} />
      <MembersTable
        members={members}
        renderRowActions={(member) => (
          <RemoveMemberButton
            name={member.name}
            onRemove={() => handleRemove(member.id)}
          />
        )}
      />
    </>
  );
}
