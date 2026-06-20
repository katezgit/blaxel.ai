"use client";

import { Badge } from "@repo/ui/components/badge";
import { CopyButton } from "@repo/ui/components/copy-button";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

// UUID rendered as first8 + "…" + last4 so the row stays scannable.
// CopyButton always writes the full value to clipboard.
function abbreviateAccountId(id: string): string {
  if (id.length <= 13) return id;
  return `${id.slice(0, 8)}-...${id.slice(-4)}`;
}

export function AccountIdentitySection() {
  const { state } = useAccountState();
  const accountId = state.identity.accountId;

  return (
    <Panel title="Account identity">
      <dl className="grid max-w-[720px] grid-cols-[180px_minmax(0,1fr)] gap-x-8 gap-y-4 text-body">
        <dt className="text-muted-foreground">Owner email</dt>
        <dd className="font-mono text-foreground">
          {state.identity.ownerEmail}
        </dd>

        <dt className="text-muted-foreground">Account ID</dt>
        <dd className="flex items-center gap-2">
          <span className="font-mono text-foreground">
            {abbreviateAccountId(accountId)}
          </span>
          <CopyButton
            value={accountId}
            ariaLabel={`Copy account ID ${accountId}`}
            tooltipLabel="Copy account ID"
          />
        </dd>

        <dt className="text-muted-foreground">Billing tier</dt>
        <dd>
          <Badge variant="neutral">Tier {state.tier}</Badge>
        </dd>
      </dl>
    </Panel>
  );
}
