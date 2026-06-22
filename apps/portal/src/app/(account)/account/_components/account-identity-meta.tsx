"use client";

import { CopyButton } from "@repo/ui/components/copy-button";
import { useAccountState } from "@/lib/mock/account-context";

function abbreviateAccountId(id: string): string {
  if (id.length <= 13) return id;
  return `${id.slice(0, 8)}-...${id.slice(-4)}`;
}

export default function AccountIdentityMeta() {
  const { state } = useAccountState();
  const accountId = state.identity.accountId;

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 typography-caption text-muted-foreground">
      <span>Owner</span>
      <span aria-hidden="true">·</span>
      <span className="font-mono text-foreground">
        {state.identity.ownerEmail}
      </span>
      <span aria-hidden="true">·</span>
      <span>Account ID</span>
      <span className="inline-flex items-center gap-1 font-mono text-foreground">
        {abbreviateAccountId(accountId)}
        <CopyButton
          value={accountId}
          ariaLabel={`Copy account ID ${accountId}`}
          tooltipLabel="Copy account ID"
        />
      </span>
    </p>
  );
}
