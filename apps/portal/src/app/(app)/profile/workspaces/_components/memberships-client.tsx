"use client";

import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { EmptyState } from "@repo/ui/components/empty-state";
import MembershipRow from "./membership-row";
import type { WorkspaceMembership } from "@/lib/mock/profile";

interface MembershipsClientProps {
  initialMemberships: ReadonlyArray<WorkspaceMembership>;
}

export default function MembershipsClient({
  initialMemberships,
}: MembershipsClientProps) {
  const [memberships, setMemberships] =
    useState<ReadonlyArray<WorkspaceMembership>>(initialMemberships);

  const leave = (id: string) =>
    setMemberships((current) => current.filter((m) => m.id !== id));

  if (memberships.length === 0) {
    return (
      <Card className="px-6 py-6">
        <EmptyState
          variant="zero-state"
          icon={LayoutGrid}
          title="No workspaces"
          subtitle="Workspaces you belong to will show up here."
        />
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {memberships.map((membership) => (
        <MembershipRow
          key={membership.id}
          membership={membership}
          onLeave={() => leave(membership.id)}
        />
      ))}
    </ul>
  );
}
