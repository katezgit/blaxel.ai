"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import DetailPageHeader from "@/components/shell/detail-page-header";
import ResourceNotFound from "@/components/shell/resource-not-found";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { workspaceServiceAccountQueries } from "@/lib/query/workspace-service-accounts";
import { queryKeys } from "@/lib/query/keys";
import type {
  Org,
  ServiceAccount,
  ServiceAccountApiKey,
} from "@/lib/mock/types";
import ConfirmByNameDialog from "../../../_components/confirm-by-name-dialog";
import { formatShortDate } from "../../_components/format";
import ApiKeysSection from "./api-keys-section";
import CreateServiceAccountApiKeyDialog from "./create-service-account-api-key-dialog";
import InlineEditable from "./inline-editable";
import OauthCredentialsSection from "./oauth-credentials-section";
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
  const teamHref = `/${workspace.slug}/settings/team`;

  const { data, isPending, isError, refetch } = useQuery(
    workspaceServiceAccountQueries.detail(
      accountId,
      workspaceId,
      serviceAccountId,
    ),
  );

  const [pendingRemove, setPendingRemove] = useState(false);
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
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

  // Workspace-scope roles are admin | member. Any leaked `owner` from the
  // shared mock type collapses to admin for display — workspace tenants
  // don't carry an owner tier (verified docs.blaxel.ai 2026-06-28).
  const roleLabel = sa.role === "member" ? "Member" : "Admin";

  return (
    <>
      <DetailPageHeader
        breadcrumb={
          <Breadcrumb
            parent={{ href: listHref, label: "Service accounts" }}
            current={sa.name}
          />
        }
        heading={
          <InlineEditable
            value={sa.name}
            onSave={handleNameSave}
            ariaLabel="Edit service account name"
            renderDisplay={(value, startEdit) => (
              <button
                type="button"
                onClick={startEdit}
                className="cursor-text rounded-sm text-left hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {value}
              </button>
            )}
          />
        }
        description={
          <InlineEditable
            value={sa.description}
            onSave={handleDescriptionSave}
            ariaLabel="Edit description"
            renderDisplay={(value, startEdit) => (
              <button
                type="button"
                onClick={startEdit}
                className="cursor-text rounded-sm text-left hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {value}
              </button>
            )}
          />
        }
        action={
          <>
            <Button variant="primary" onClick={() => setCreateKeyOpen(true)}>
              <Plus aria-hidden="true" />
              <span>Create API key</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton variant="ghost" aria-label="More actions">
                  <MoreHorizontal />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onSelect={() => setPendingRemove(true)}
                  className="text-destructive focus:text-destructive"
                >
                  Remove service account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <p className="typography-caption text-meta-foreground">
        <span>
          Role: <span className="text-foreground">{roleLabel}</span>
        </span>
        <span aria-hidden="true"> · </span>
        <span>Created {formatShortDate(sa.createdAt)}</span>
        <span aria-hidden="true"> · </span>
        <Link
          href={teamHref}
          className="inline-flex items-center gap-0.5 text-foreground underline-offset-2 hover:underline"
        >
          Manage role in Team
          <ArrowRight aria-hidden="true" className="size-3" />
        </Link>
      </p>

      <ApiKeysSection
        serviceAccount={sa}
        onCreateKey={() => setCreateKeyOpen(true)}
        onKeyDeleted={handleKeyDeleted}
      />

      <OauthCredentialsSection serviceAccount={sa} />

      <RecentActivitySection />

      <CreateServiceAccountApiKeyDialog
        open={createKeyOpen}
        onOpenChange={setCreateKeyOpen}
        serviceAccount={sa}
        onCreated={handleKeyCreated}
      />

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
