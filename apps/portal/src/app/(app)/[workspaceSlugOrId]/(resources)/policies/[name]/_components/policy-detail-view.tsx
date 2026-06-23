"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { policyQueries } from "@/lib/query/policies";
import type { Policy, PolicyUsages } from "@/lib/mock/policies";
import { PolicyDetailHeader } from "./policy-detail-header";
import { LocationClauseBand } from "./location-clause-band";
import { MaxTokenClauseBand } from "./max-token-clause-band";
import { FlavorClauseBand } from "./flavor-clause-band";
import { PolicyUsageBand } from "./policy-usage-band";
import { PolicyProvenanceBand } from "./policy-provenance-band";
import { PolicyCliBand } from "./policy-cli-band";
import { PolicyDetailSkeleton } from "./policy-detail-skeleton";

interface PolicyDetailViewProps {
  workspaceSlug: string;
  policyName: string;
}

type StateSim = "loading" | "error" | null;
function readStateSim(value: string | null): StateSim {
  return value === "loading" || value === "error" ? value : null;
}

export function PolicyDetailView({ workspaceSlug, policyName }: PolicyDetailViewProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const searchParams = useSearchParams();
  const stateSim = readStateSim(searchParams.get("state"));
  const listHref = `/${workspaceSlug}/policies`;

  const policyQuery = useQuery({
    ...policyQueries.detail(accountId, workspaceId, policyName),
    enabled: stateSim === null,
  });
  const usagesQuery = useQuery({
    ...policyQueries.usages(accountId, workspaceId, policyName),
    enabled: stateSim === null,
  });

  if (stateSim === "loading" || policyQuery.isPending) {
    return (
      <div className="page-shell">
        <PolicyDetailSkeleton workspaceSlug={workspaceSlug} />
      </div>
    );
  }

  if (stateSim === "error" || policyQuery.isError) {
    return (
      <div className="page-shell">
        <Breadcrumb
          parent={{ href: listHref, label: "Policies" }}
          current={policyName}
        />
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-border bg-card px-6 py-8"
        >
          <h2 className="typography-subtitle font-semibold text-foreground">
            Policy unavailable
          </h2>
          <p className="mt-1 typography-body text-muted-foreground">
            Could not load{" "}
            <code className="font-mono">{policyName}</code>. Retry below or
            return to the list.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="primary"
              type="button"
              onClick={() => policyQuery.refetch()}
            >
              Retry
            </Button>
            <Button asChild variant="ghost">
              <Link href={listHref}>
                <ArrowLeft aria-hidden="true" />
                Back to Policies
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const policy = policyQuery.data;
  if (policy == null) {
    return (
      <div className="page-shell">
        <Breadcrumb
          parent={{ href: listHref, label: "Policies" }}
          current={policyName}
        />
        <div className="rounded-lg border border-border bg-card px-6 py-10">
          <h2 className="typography-subtitle font-semibold text-foreground">
            Policy not found
          </h2>
          <p className="mt-1 typography-body text-muted-foreground">
            No Policy named <code className="font-mono">{policyName}</code>{" "}
            exists in this workspace. It may have been deleted, or the URL may
            be incorrect.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Button asChild variant="primary">
              <Link href={listHref}>
                Back to Policies
              </Link>
            </Button>
            <code className="font-mono typography-meta text-muted-foreground">
              bl policy list
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PolicyDetailHeader policy={policy} workspaceSlug={workspaceSlug} />
      <ClauseBand policy={policy} />
      <PolicyUsageBand
        policy={policy}
        usages={usagesQuery.data ?? null}
        workspaceSlug={workspaceSlug}
      />
      <PolicyProvenanceBand metadata={policy.metadata} />
      <PolicyCliBand policy={policy} />
    </div>
  );
}

// Clause band switches on spec.type into ONE of three sibling components —
// composition, not configuration. Each clause owns its own copy and layout.
function ClauseBand({ policy }: { policy: Policy }) {
  if (policy.spec.type === "location") {
    return <LocationClauseBand locations={policy.spec.locations ?? []} />;
  }
  if (policy.spec.type === "maxToken") {
    return <MaxTokenClauseBand maxTokens={policy.spec.maxTokens ?? null} />;
  }
  return <FlavorClauseBand flavors={policy.spec.flavors ?? []} />;
}

// Re-export Policy/PolicyUsages here for type narrowing in band components.
export type { Policy, PolicyUsages };
