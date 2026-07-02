"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { sandboxQueries } from "@/lib/query/sandboxes";
import { fetchSandboxSettings } from "@/lib/mock/sandbox-settings-fixtures";
import SandboxSettingsAudit from "./sandbox-settings-audit";
import SandboxSettingsDeploymentConfig from "./sandbox-settings-deployment-config";
import SandboxSettingsIdentity from "./sandbox-settings-identity";
import SandboxSettingsLifecycle from "./sandbox-settings-lifecycle";
import SandboxSettingsResources from "./sandbox-settings-resources";

/** Settings tab body — reads the sandbox from the hydrated query cache
 *  populated in `layout.tsx`, fetches the Settings-only overlay from the
 *  Settings fixture, and composes the four sub-sections (Audit · Deployment
 *  config · Lifecycle · Resources) below the inline-editable identity rows
 *  (Display name + Description). Loading / error / not-found shells live in
 *  the layout — if this component is rendered, the sandbox is guaranteed
 *  populated. */
export default function SandboxSettingsView() {
  const { name } = useParams<{ name: string }>();
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: sandbox } = useQuery(
    sandboxQueries.detail(accountId, workspaceId, name),
  );
  const { data: settings } = useQuery({
    queryKey: ["sandbox-settings", accountId, workspaceId, name],
    queryFn: () => fetchSandboxSettings(accountId, workspaceId, name),
    enabled: sandbox != null,
  });

  if (sandbox == null || settings == null) return null;

  return (
    <div className="flex flex-col gap-6">
      <SandboxSettingsIdentity
        sandboxName={sandbox.metadata.name}
        initialDisplayName={sandbox.metadata.displayName}
        initialDescription={settings.description}
      />
      <SandboxSettingsAudit audit={settings.audit} />
      <SandboxSettingsDeploymentConfig
        sandbox={sandbox}
        deploymentId={settings.deploymentId}
      />
      <SandboxSettingsLifecycle
        sandbox={sandbox}
        lifecyclePolicies={settings.lifecyclePolicies}
        terminationAt={settings.terminationAt}
      />
      <SandboxSettingsResources settings={settings} />
    </div>
  );
}
