"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@repo/ui/components/button";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import ResourceNotFound from "@/components/shell/resource-not-found";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { sandboxQueries } from "@/lib/query/sandboxes";
import {
  SandboxActivityChartHeader,
  SandboxCardWrapper,
} from "./sandbox-activity-card";
import SandboxDetailHeader from "./sandbox-detail-header";
import SandboxDetailSkeleton from "./sandbox-detail-skeleton";
import SandboxDetailStickyTabs from "./sandbox-detail-sticky-tabs";
import { sandboxDetailTabFromPath } from "./sandbox-detail-tab-from-path";
import {
  sandboxViewModeStorageKey,
  tabSupportsCardMode,
  type SandboxViewMode,
} from "./sandbox-view-mode";

interface SandboxDetailLayoutClientProps {
  workspaceSlug: string;
  sandboxName: string;
  children: ReactNode;
}

type StateSim = "loading" | "error" | null;
function readStateSim(value: string | null): StateSim {
  return value === "loading" || value === "error" ? value : null;
}

/** Shared chrome for the sandbox detail surface (Overview + 4 mode tabs).
 * Renders breadcrumb + §1.1 page header + tab strip and a `children` slot
 * for the active tab's body. Owns the `?state=loading|error` demo
 * simulation and the not-found shell — the children can assume a populated
 * sandbox is in the query cache. */
export default function SandboxDetailLayoutClient({
  workspaceSlug,
  sandboxName,
  children,
}: SandboxDetailLayoutClientProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const stateSim = readStateSim(searchParams.get("state"));
  const basePath = `/${workspaceSlug}/sandboxes/${sandboxName}`;
  const listHref = `/${workspaceSlug}/sandboxes`;
  const activeTab = sandboxDetailTabFromPath(pathname, basePath);
  const sandboxQuery = useQuery({
    ...sandboxQueries.detail(accountId, workspaceId, sandboxName),
    enabled: stateSim === null,
  });

  const [viewMode, setViewMode] = useState<SandboxViewMode>("flat");
  const viewModeKey = sandboxViewModeStorageKey(sandboxName, activeTab);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(viewModeKey);
      setViewMode(stored === "card" ? "card" : "flat");
    } catch {
      setViewMode("flat");
    }
  }, [viewModeKey]);
  const handleViewModeChange = useCallback(
    (next: SandboxViewMode) => {
      setViewMode(next);
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(viewModeKey, next);
      } catch {
        // storage may be blocked (private mode, quota) — UI state still updates.
      }
    },
    [viewModeKey],
  );

  if (stateSim === "loading" || sandboxQuery.isPending) {
    return (
      <div className="page-shell">
        <SandboxDetailSkeleton workspaceSlug={workspaceSlug} />
      </div>
    );
  }

  if (stateSim === "error" || sandboxQuery.isError) {
    return (
      <div className="page-shell">
        <SandboxDetailErrorHeader
          sandboxName={sandboxName}
          listHref={listHref}
          onRetry={() => sandboxQuery.refetch()}
        />
      </div>
    );
  }

  const sandbox = sandboxQuery.data;
  if (sandbox == null) {
    return (
      <div className="page-shell min-h-full">
        <Breadcrumb
          parent={{ href: listHref, label: "Sandboxes" }}
          current={sandboxName}
        />
        <ResourceNotFound
          resourceLabel="Sandbox"
          resourceTypeSlug="sandboxes"
          id={sandboxName}
          supportingLine="This sandbox isn't available in this workspace."
          listHref={listHref}
          listLabel="Go to Sandboxes"
        />
      </div>
    );
  }

  const isCardMode = viewMode === "card" && tabSupportsCardMode(activeTab);

  return (
    <div className="page-shell">
      <SandboxDetailHeader sandbox={sandbox} workspaceSlug={workspaceSlug} />
      <SandboxDetailStickyTabs
        workspaceSlug={workspaceSlug}
        sandboxName={sandboxName}
        activeTab={activeTab}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      {isCardMode ? (
        <SandboxCardWrapper
          header={
            activeTab === "overview" ? (
              <SandboxActivityChartHeader sandbox={sandbox} />
            ) : undefined
          }
        >
          {children}
        </SandboxCardWrapper>
      ) : (
        children
      )}
    </div>
  );
}

interface SandboxDetailErrorHeaderProps {
  sandboxName: string;
  listHref: string;
  onRetry: () => void;
}

/** API-error shape per wireframe §2.8 — heading reverts to index-page form:
 * h1 + right-edge Retry, description below at gap-1. No meta row. Outer
 * header keeps `gap-3 pt-2 pb-6` for parity with the populated header.
 * Breadcrumb carries the escape; no peer back-link to dilute Retry. */
function SandboxDetailErrorHeader({
  sandboxName,
  listHref,
  onRetry,
}: SandboxDetailErrorHeaderProps) {
  return (
    <header className="flex flex-col gap-3 pt-2 pb-6">
      <Breadcrumb
        parent={{ href: listHref, label: "Sandboxes" }}
        current={sandboxName}
      />
      <div className="flex min-w-0 flex-col page-header">
        <div className="flex items-center justify-between gap-2">
          <h1 className="typography-display font-semibold text-foreground">
            Failed to load Sandbox
          </h1>
          <Button type="button" variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        </div>
        <p className="typography-body text-muted-foreground">
          The Sandbox{" "}
          <code className="font-mono text-foreground">{sandboxName}</code> could
          not be loaded. Network or API error.
        </p>
      </div>
    </header>
  );
}
