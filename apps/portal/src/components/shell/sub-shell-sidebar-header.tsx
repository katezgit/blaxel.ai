"use client";

import { AccountSidebarIdentity } from "@/components/shell/account-sidebar-identity";
import { SettingsSidebarIdentity } from "@/components/shell/settings-sidebar-identity";
import { SubShellSidebarReturnHeader } from "@/components/shell/sub-shell-sidebar-return-header";
import type { subShellKindForPath } from "@/components/shell/sub-shell-path";
import type { Org } from "@/lib/mock/types";

interface SubShellSidebarHeaderProps {
  workspace: Org;
  onNavigate?: () => void;
}

// Zone A row 2 of every sub-shell sidebar: just the Back link. Back is chrome
// (peer to the top brand row) so it sits above the Zone A/B hairline; the
// entity identity chip lives at the top of Zone B via SubShellSidebarIdentity.
export function SubShellSidebarHeader({
  workspace,
  onNavigate,
}: SubShellSidebarHeaderProps) {
  return (
    <SubShellSidebarReturnHeader
      workspace={workspace}
      onNavigate={onNavigate}
    />
  );
}

interface SubShellSidebarIdentityProps {
  kind: ReturnType<typeof subShellKindForPath>;
  workspace: Org;
}

// Top of Zone B for sub-shell sidebars — names which entity's settings are
// being edited. Sits below the Zone A/B hairline so the chip reads as nav
// content, not chrome. Profile has no chip: the user chip in Zone D already
// names the logged-in user.
export function SubShellSidebarIdentity({
  kind,
  workspace,
}: SubShellSidebarIdentityProps) {
  if (kind === "settings") {
    return <SettingsSidebarIdentity workspace={workspace} />;
  }
  if (kind === "account") {
    return <AccountSidebarIdentity />;
  }
  return null;
}
