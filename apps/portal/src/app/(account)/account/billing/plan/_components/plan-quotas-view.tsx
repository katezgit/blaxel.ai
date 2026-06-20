"use client";

import { Badge } from "@repo/ui/components/badge";
import { useAccountState } from "@/lib/mock/account-context";
import { TIER_LIMITS } from "@/lib/mock/account";
import { TierSummaryStrip } from "./tier-summary-strip";
import { TierComparison } from "./tier-comparison";
import {
  CeilingQuotaRow,
  GatedQuotaRow,
  QuotaGroup,
  UtilizedQuotaRow,
} from "./quota-row";

export function PlanQuotasView() {
  const { state } = useAccountState();
  const limits = TIER_LIMITS[state.tier];
  const usage = state.usage;

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-display font-semibold text-foreground">
            Plan &amp; Quotas
          </h1>
          <Badge variant="neutral">Tier {state.tier}</Badge>
        </div>
        <p className="text-muted-foreground">
          Current usage and limits for this account.
        </p>
      </header>

      <TierSummaryStrip
        sandboxesUsed={usage.sandboxesConcurrent}
        sandboxesLimit={limits.sandboxesConcurrent}
        resourcesUsed={usage.agentsMcpsJobs}
        resourcesLimit={limits.agentsMcpsJobs}
        ramUsedGb={usage.concurrentRamGb}
        ramLimitGb={limits.concurrentRamGb}
      />

      <div className="flex flex-col gap-4">
        <QuotaGroup label="Sandboxes">
          <UtilizedQuotaRow
            label="Sandboxes (concurrent)"
            used={usage.sandboxesConcurrent}
            limit={limits.sandboxesConcurrent}
          />
          <UtilizedQuotaRow
            label="Sandboxes (total)"
            used={usage.sandboxesTotal}
            limit={limits.sandboxesTotal}
          />
          <CeilingQuotaRow
            label="Sandbox max lifetime"
            value={`${limits.sandboxMaxLifetimeDays} days`}
          />
          <CeilingQuotaRow
            label="Memory per instance"
            value={`${limits.memoryPerInstanceMib.toLocaleString()} MiB`}
          />
        </QuotaGroup>

        <QuotaGroup label="Volumes">
          {limits.volumes === null ? (
            <GatedQuotaRow label="Volumes" tier={1} verb="unlock" />
          ) : (
            <UtilizedQuotaRow
              label="Volumes"
              used={usage.volumes}
              limit={limits.volumes}
            />
          )}
          {limits.volumeStorageGb === null ? (
            <GatedQuotaRow label="Volume storage" tier={1} verb="unlock" />
          ) : (
            <CeilingQuotaRow
              label="Volume storage"
              value={`${limits.volumeStorageGb} GB`}
            />
          )}
        </QuotaGroup>

        <QuotaGroup label="Agent Drive">
          {limits.agentDrives === null ? (
            <GatedQuotaRow label="Agent Drives" tier={1} verb="unlock" />
          ) : (
            <UtilizedQuotaRow
              label="Agent Drives"
              used={usage.agentDrives}
              limit={limits.agentDrives}
            />
          )}
        </QuotaGroup>

        <QuotaGroup label="Agents Hosting">
          <UtilizedQuotaRow
            label="Agents"
            used={usage.agents}
            limit={limits.agentsMcpsJobs}
          />
          {limits.privatePreviews === null ? (
            <GatedQuotaRow label="Private previews" tier={1} verb="unlock" />
          ) : (
            <UtilizedQuotaRow
              label="Private previews"
              used={0}
              limit={limits.privatePreviews}
            />
          )}
          {limits.revisionsPerDeployment === null ? (
            <GatedQuotaRow
              label="Revisions per deployment"
              tier={1}
              verb="unlock"
            />
          ) : (
            <CeilingQuotaRow
              label="Revisions per deployment"
              value={String(limits.revisionsPerDeployment)}
            />
          )}
        </QuotaGroup>

        <QuotaGroup label="MCP Servers Hosting">
          <UtilizedQuotaRow
            label="MCP Servers"
            used={usage.mcpServers}
            limit={limits.agentsMcpsJobs}
          />
        </QuotaGroup>

        <QuotaGroup label="Batch Jobs">
          <UtilizedQuotaRow
            label="Batch Jobs (concurrent)"
            used={usage.batchJobsConcurrent}
            limit={limits.agentsMcpsJobs}
          />
          <UtilizedQuotaRow
            label="Concurrent RAM (Batch Jobs)"
            used={usage.concurrentRamGb}
            limit={limits.concurrentRamGb}
            unit="GB"
          />
          <CeilingQuotaRow label="Job timeout (max)" value="1 hour" />
          {limits.cronTriggers === null ? (
            <GatedQuotaRow label="Cron triggers" tier={1} verb="unlock" />
          ) : (
            <UtilizedQuotaRow
              label="Cron triggers"
              used={0}
              limit={limits.cronTriggers}
            />
          )}
        </QuotaGroup>

        <QuotaGroup label="Model APIs">
          <CeilingQuotaRow
            label="Model API endpoints"
            value="Unlimited within concurrency"
          />
        </QuotaGroup>

        <QuotaGroup label="Networking">
          {limits.customDomains === null ? (
            <GatedQuotaRow
              label="Custom domains"
              tier={3}
              verb="unlock"
              contactSales
            />
          ) : (
            <UtilizedQuotaRow
              label="Custom domains"
              used={usage.customDomains}
              limit={limits.customDomains}
            />
          )}
          <CeilingQuotaRow
            label="Logs retention"
            value={`${limits.logsRetentionDays} days`}
          />
          {limits.unlimitedSandboxRuntime ? (
            <CeilingQuotaRow
              label="Sandbox runtime"
              value="Unlimited"
            />
          ) : (
            <GatedQuotaRow
              label="Unlimited sandbox runtime"
              tier={2}
              verb="unlock"
            />
          )}
        </QuotaGroup>

        <QuotaGroup label="Security">
          {limits.policies === null ? (
            <GatedQuotaRow label="Policies" tier={1} verb="unlock" />
          ) : (
            <UtilizedQuotaRow
              label="Policies"
              used={usage.policies}
              limit={limits.policies}
            />
          )}
        </QuotaGroup>

        <QuotaGroup label="Workload Admin">
          <UtilizedQuotaRow
            label="Workspaces"
            used={state.workspaces.length}
            limit={limits.workspaces}
          />
        </QuotaGroup>
      </div>

      <TierComparison currentTier={state.tier} />
    </div>
  );
}
