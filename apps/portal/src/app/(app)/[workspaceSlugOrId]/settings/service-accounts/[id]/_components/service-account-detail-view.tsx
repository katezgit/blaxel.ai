"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import ResourceNotFound from "@/components/shell/resource-not-found";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { workspaceServiceAccountQueries } from "@/lib/query/workspace-service-accounts";
import { queryKeys } from "@/lib/query/keys";
import type {
  Org,
  Role,
  ServiceAccount,
  ServiceAccountApiKey,
} from "@/lib/mock/types";
import ConfirmByNameDialog from "../../../_components/confirm-by-name-dialog";
import IdentitySection from "./identity-section";
import OauthCredentialsSection from "./oauth-credentials-section";
import ApiKeysSection from "./api-keys-section";
import RecentActivitySection from "./recent-activity-section";
import ServiceAccountDetailSkeleton from "./service-account-detail-skeleton";

interface ServiceAccountDetailViewProps {
  workspace: Org;
  serviceAccountId: string;
}

export default function ServiceAccountDetailView({
  workspace,
  serviceAccountId,
}: ServiceAccountDetailViewProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const router = useRouter();
  const queryClient = useQueryClient();
  const listHref = `/${workspace.slug}/settings/service-accounts`;

  const { data, isPending, isError, refetch } = useQuery(
    workspaceServiceAccountQueries.detail(
      accountId,
      workspaceId,
      serviceAccountId,
    ),
  );

  const [pendingRemove, setPendingRemove] = useState(false);
  const sa = data ?? null;

  if (isPending) {
    return <ServiceAccountDetailSkeleton listHref={listHref} />;
  }

  if (isError) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-lg border border-border bg-card px-6 py-8"
      >
        <h2 className="typography-subtitle font-semibold text-foreground">
          Couldn&rsquo;t load service account
        </h2>
        <p className="mt-1 typography-body text-muted-foreground">
          Something went wrong. Try refreshing the page.
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="primary" onClick={() => refetch()}>
            Try again
          </Button>
          <Button asChild variant="ghost">
            <Link href={listHref}>
              <ArrowLeft aria-hidden="true" />
              Back to Service accounts
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (sa == null) {
    return (
      <ResourceNotFound
        resourceLabel="Service account"
        resourceTypeSlug="service-account"
        id={serviceAccountId}
        supportingLine="This service account isn't available in this workspace."
        listHref={listHref}
        listLabel="Go to Service accounts"
      />
    );
  }

  // Mock-only mutation path: write straight to the query cache so the detail
  // view re-renders. A future backend hookup swaps this for a mutation +
  // invalidate; the consumer call sites stay identical.
  const updateSa = (next: ServiceAccount) => {
    queryClient.setQueryData(
      queryKeys.resourceDetail(
        accountId,
        workspaceId,
        "service-accounts",
        sa.id,
      ),
      next,
    );
  };

  const handleNameSave = (name: string) => {
    updateSa({ ...sa, name });
    toast.success("Service account name updated.");
  };

  const handleDescriptionSave = (description: string) => {
    updateSa({ ...sa, description });
    toast.success("Description updated.");
  };

  const handleRoleChange = (role: Role) => {
    updateSa({ ...sa, role });
    toast.success(`Role updated to ${role === "admin" ? "Admin" : "Member"}.`);
  };

  const handleKeyCreated = (key: ServiceAccountApiKey) => {
    updateSa({ ...sa, apiKeys: [key, ...sa.apiKeys] });
    toast.success(`API key ${key.name} created.`);
  };

  const handleKeyDeleted = (keyId: string) => {
    updateSa({
      ...sa,
      apiKeys: sa.apiKeys.filter((k) => k.id !== keyId),
    });
    toast.success("API key deleted.");
  };

  const handleRemoveConfirm = () => {
    setPendingRemove(false);
    toast.success(`Removed service account ${sa.name}.`);
    queryClient.invalidateQueries({
      queryKey: queryKeys.resourceList(accountId, workspaceId, "service-accounts"),
    });
    router.push(listHref);
  };

  return (
    <>
      <nav>
        <Link
          href={listHref}
          className="inline-flex items-center gap-1 typography-body font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Service accounts
        </Link>
      </nav>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <header className="page-header">
          <h1 className="typography-display font-semibold text-foreground">
            {sa.name}
          </h1>
          <p className="text-muted-foreground">{sa.description}</p>
        </header>
        <Button
          variant="destructive-ghost"
          onClick={() => setPendingRemove(true)}
        >
          Remove service account
        </Button>
      </div>

      <IdentitySection
        serviceAccount={sa}
        onNameSave={handleNameSave}
        onDescriptionSave={handleDescriptionSave}
        onRoleChange={handleRoleChange}
      />

      <OauthCredentialsSection serviceAccount={sa} />

      <ApiKeysSection
        serviceAccount={sa}
        onKeyCreated={handleKeyCreated}
        onKeyDeleted={handleKeyDeleted}
      />

      <RecentActivitySection />

      <ConfirmByNameDialog
        open={pendingRemove}
        onOpenChange={(open) => {
          if (!open) setPendingRemove(false);
        }}
        actionLabel="Remove service account"
        targetLabel={sa.name}
        workspaceName={sa.name}
        description={
          <>
            This will permanently remove{" "}
            <span className="font-mono text-foreground">{sa.name}</span>
            {" "}and revoke all of its API keys. Any consumer using this
            service account&rsquo;s credentials will lose access immediately.
          </>
        }
        details={
          <p className="typography-caption text-muted-foreground">
            OAuth client credentials cannot be restored. If you need access
            again, create a new service account.
          </p>
        }
        onConfirm={handleRemoveConfirm}
      />
    </>
  );
}
