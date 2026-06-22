"use client";

import { Card } from "@repo/ui/components/card";
import { TIER_LIMITS } from "@/lib/mock/account";
import { useAccountState } from "@/lib/mock/account-context";

interface SummaryRow {
  label: string;
  value: string;
}

export default function AccountSummaryPanel() {
  const { state } = useAccountState();

  const admins = state.admins;
  const activeAdmins = admins.filter((a) => a.status === "active").length;
  const pendingInvites = admins.filter((a) => a.status === "pending").length;
  const adminsValue =
    pendingInvites > 0
      ? `${activeAdmins} active · ${pendingInvites} invite${pendingInvites === 1 ? "" : "s"} pending`
      : `${activeAdmins} active`;

  const workspaceLimit = TIER_LIMITS[state.tier].workspaces;
  const workspacesValue = `${state.workspaces.length} / ${workspaceLimit} used`;

  const ssoEnabled = state.saml.idpSsoUrl !== null;
  const policyValue = ssoEnabled
    ? "SSO enforced via SAML"
    : "SSO disabled · MFA optional";

  const rows: ReadonlyArray<SummaryRow> = [
    { label: "Admins", value: adminsValue },
    { label: "Workspaces", value: workspacesValue },
    { label: "Login policy", value: policyValue },
  ];

  return (
    <section className="flex flex-col gap-2">
      <h2 className="typography-subtitle font-semibold text-foreground">
        Account summary
      </h2>
      <Card className="p-4">
        <dl className="grid grid-cols-1 gap-y-2 typography-body sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-x-6 sm:gap-y-3">
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </section>
  );
}
