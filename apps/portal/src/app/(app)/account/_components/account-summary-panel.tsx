"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { TIER_LIMITS } from "@/lib/mock/account";
import { useAccountState } from "@/lib/mock/account-context";

interface SummaryRow {
  label: string;
  value: string;
  href: string;
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
  const planTierValue = `Tier ${state.tier} · ${workspaceLimit} workspaces included`;
  const workspacesValue = `${state.workspaces.length} / ${workspaceLimit} used`;

  const ssoEnabled = state.saml.idpSsoUrl !== null;
  const policyValue = ssoEnabled
    ? "SSO enforced via SAML"
    : "SSO disabled · MFA optional";

  const rows: ReadonlyArray<SummaryRow> = [
    { label: "Admins", value: adminsValue, href: "/account/admins" },
    {
      label: "Plan tier",
      value: planTierValue,
      href: "/account/billing/tier-quotas",
    },
    {
      label: "Workspaces",
      value: workspacesValue,
      href: "/account/workspaces",
    },
    {
      label: "Login policy",
      value: policyValue,
      href: "/account/login-policy",
    },
  ];

  return (
    <section className="flex flex-col gap-2">
      <h2 className="typography-subtitle font-semibold text-foreground">
        Account summary
      </h2>
      <Card className="p-0 overflow-hidden">
        <ul className="flex flex-col divide-y divide-border">
          {rows.map((row) => (
            <li key={row.label}>
              <Link
                href={row.href}
                className="sidebar-row-hover flex items-center gap-4 px-4 py-3 typography-body focus-visible:shadow-focus-ring focus-visible:outline-hidden"
              >
                <span className="w-32 shrink-0 text-muted-foreground">
                  {row.label}
                </span>
                <span className="flex-1 text-foreground">{row.value}</span>
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
