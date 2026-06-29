"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import ResourceNotFound from "@/components/shell/resource-not-found";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { policyQueries } from "@/lib/query/policies";
import { queryKeys } from "@/lib/query/keys";
import { deletePolicy } from "@/lib/mock/policies";
import type { Policy, PolicyUsages } from "@/lib/mock/policies";
import PolicyDetailHeader from "./policy-detail-header";
import LocationClauseBand from "./location-clause-band";
import MaxTokenClauseBand from "./max-token-clause-band";
import FlavorClauseBand from "./flavor-clause-band";
import PolicyUsageBand from "./policy-usage-band";
import PolicyProvenanceBand from "./policy-provenance-band";
import PolicyDetailSkeleton from "./policy-detail-skeleton";
import DeletePolicyDialog from "./delete-policy-dialog";
import {
  EditPolicyDrawer,
  type EditPolicyDrawerState,
} from "./edit-policy-drawer";
import DuplicatePolicyDrawer from "./duplicate-policy-drawer";

interface PolicyDetailViewProps {
  workspaceSlug: string;
  policyName: string;
}

type StateSim = "loading" | "error" | null;
function readStateSim(value: string | null): StateSim {
  return value === "loading" || value === "error" ? value : null;
}

export function PolicyDetailView({
  workspaceSlug,
  policyName,
}: PolicyDetailViewProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const searchParams = useSearchParams();
  const stateSim = readStateSim(searchParams.get("state"));
  const listHref = `/${workspaceSlug}/policies`;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [editState, setEditState] = useState<EditPolicyDrawerState>(null);
  const [duplicateSource, setDuplicateSource] = useState<Policy | null>(null);

  const policyQuery = useQuery({
    ...policyQueries.detail(accountId, workspaceId, policyName),
    enabled: stateSim === null,
  });
  const usagesQuery = useQuery({
    ...policyQueries.usages(accountId, workspaceId, policyName),
    enabled: stateSim === null,
  });

  async function handleConfirmDelete(target: Policy) {
    deletePolicy(accountId, workspaceId, target.metadata.name);
    setPolicyToDelete(null);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.resources(accountId, workspaceId),
      predicate: (query) => query.queryKey.includes("policies"),
    });
    const tierParam = searchParams.get("tier");
    const successHref = tierParam ? `${listHref}?tier=${tierParam}` : listHref;
    router.push(successHref);
    toast.success(
      `Policy '${target.metadata.displayName || target.metadata.name}' deleted.`,
    );
  }

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
      <div className="page-shell min-h-full">
        <Breadcrumb
          parent={{ href: listHref, label: "Policies" }}
          current={policyName}
        />
        <ResourceNotFound
          resourceLabel="Policy"
          resourceTypeSlug="policy"
          id={policyName}
          supportingLine="This policy isn't available in this workspace."
          listHref={listHref}
          listLabel="Go to Policies"
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PolicyDetailHeader
        policy={policy}
        workspaceSlug={workspaceSlug}
        onRequestEdit={() => setEditState(policy)}
        onRequestDuplicate={() => setDuplicateSource(policy)}
        onRequestDelete={() => setPolicyToDelete(policy)}
      />
      <ClauseBand
        policy={policy}
        onRequestEdit={() => setEditState(policy)}
      />
      <PolicyUsageBand
        policy={policy}
        usages={usagesQuery.data ?? null}
        workspaceSlug={workspaceSlug}
      />
      <PolicyProvenanceBand
        metadata={policy.metadata}
        policyType={policy.spec.type}
      />
      <DeletePolicyDialog
        policy={policyToDelete}
        onClose={() => setPolicyToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
      <EditPolicyDrawer
        state={editState}
        onClose={() => setEditState(null)}
      />
      <DuplicatePolicyDrawer
        source={duplicateSource}
        workspaceSlug={workspaceSlug}
        onClose={() => setDuplicateSource(null)}
      />
    </div>
  );
}

// Clause band switches on spec.type into ONE of three sibling components —
// composition, not configuration. Each clause owns its own copy and layout.
// `className="border-t-0 pt-0"` suppresses the band's default top divider
// because the Clause band is the first sibling under the page heading — the
// divider would otherwise read as an underline of the heading. Subsequent
// bands (Usage, Provenance) keep their dividers to separate each other.
function ClauseBand({
  policy,
  onRequestEdit,
}: {
  policy: Policy;
  onRequestEdit: () => void;
}) {
  const firstBandClassName = "border-t-0 pt-0";
  if (policy.spec.type === "location") {
    return (
      <LocationClauseBand
        locations={policy.spec.locations ?? []}
        onRequestEdit={onRequestEdit}
        className={firstBandClassName}
      />
    );
  }
  if (policy.spec.type === "maxToken") {
    return (
      <MaxTokenClauseBand
        maxTokens={policy.spec.maxTokens ?? null}
        onRequestEdit={onRequestEdit}
        className={firstBandClassName}
      />
    );
  }
  return (
    <FlavorClauseBand
      flavors={policy.spec.flavors ?? []}
      onRequestEdit={onRequestEdit}
      className={firstBandClassName}
    />
  );
}

export type { Policy, PolicyUsages };
