"use client";

import { AccountSidebarIdentity } from "@/components/shell/account-sidebar-identity";
import { SettingsSidebarIdentity } from "@/components/shell/settings-sidebar-identity";
import { SubShellSidebarReturnHeader } from "@/components/shell/sub-shell-sidebar-return-header";
import type { subShellKindForPath } from "@/components/shell/sub-shell-path";
import type { Org } from "@/lib/mock/types";

interface SubShellSidebarHeaderProps {
  kind: ReturnType<typeof subShellKindForPath>;
  workspace: Org;
  onNavigate?: () => void;
}

// Header zone of every sub-shell sidebar: a Back link plus, for sub-shells
// that carry a persistent entity identity, an identity chip. Profile has no
// chip — the topbar avatar already names the logged-in user. Settings and
// account each render their own chip component (workspace vs account
// identity); the wrapper just groups Back + chip with a consistent gap.
export function SubShellSidebarHeader({
  kind,
  workspace,
  onNavigate,
}: SubShellSidebarHeaderProps) {
  if (kind === "settings") {
    return (
      <div className="flex flex-col gap-2">
        <SubShellSidebarReturnHeader
          workspace={workspace}
          onNavigate={onNavigate}
        />
        <SettingsSidebarIdentity workspace={workspace} />
      </div>
    );
  }
  if (kind === "account") {
    return (
      <div className="flex flex-col gap-2">
        <SubShellSidebarReturnHeader
          workspace={workspace}
          onNavigate={onNavigate}
        />
        <AccountSidebarIdentity />
      </div>
    );
  }
  return (
    <SubShellSidebarReturnHeader
      workspace={workspace}
      onNavigate={onNavigate}
    />
  );
}
