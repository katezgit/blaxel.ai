"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import ApiKeysSection from "./api-keys-section";
import CreateServiceAccountApiKeyDialog from "./create-service-account-api-key-dialog";
import DetailsSection from "./details-section";
import EditServiceAccountDrawer, {
  type EditServiceAccountDrawerState,
} from "./edit-service-account-drawer";
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
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [editState, setEditState] =
    useState<EditServiceAccountDrawerState>(null);
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
        <h2 className="typography-subtitle text-foreground">
          Couldn&rsquo;t load service account
        </h2>
        <p className="mt-1 text-muted-foreground">
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

  // Mock-only: writes directly to the query cache.
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

  const handleEditSave = (next: { name: string; description: string }) => {
    updateSa({
      ...sa,
      name: next.name,
      description: next.description,
      updatedAt: new Date().toISOString(),
    });
    toast.success(`Service account '${next.name}' saved.`);
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
    toast.success(`Deleted service account ${sa.name}.`);
    queryClient.invalidateQueries({
      queryKey: queryKeys.resourceList(accountId, workspaceId, "service-accounts"),
    });
    router.push(listHref);
  };

  return (
    <>
      <DetailPageHeader
        breadcrumb={
          <Breadcrumb
            parent={{ href: listHref, label: "Service accounts" }}
            current={sa.name}
          />
        }
        heading={sa.name}
        description={sa.description}
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
                <DropdownMenuItem onSelect={() => setEditState(sa)}>
                  Edit service account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(event) => {
                    event.preventDefault();
                    setPendingRemove(true);
                  }}
                >
                  Delete service account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <ApiKeysSection
        serviceAccount={sa}
        onCreateKey={() => setCreateKeyOpen(true)}
        onKeyDeleted={handleKeyDeleted}
      />

      <DetailsSection serviceAccount={sa} />

      <CreateServiceAccountApiKeyDialog
        open={createKeyOpen}
        onOpenChange={setCreateKeyOpen}
        serviceAccount={sa}
        onCreated={handleKeyCreated}
      />

      <EditServiceAccountDrawer
        state={editState}
        onSave={handleEditSave}
        onClose={() => setEditState(null)}
      />

      <AlertDialog
        open={pendingRemove}
        onOpenChange={(open: boolean) => {
          if (!open) setPendingRemove(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{sa.name}&quot;</AlertDialogTitle>
            <AlertDialogDescription>
              Every API key issued to{" "}
              <span className="font-mono text-foreground">{sa.name}</span>{" "}
              will be revoked. CI jobs and integrations using those keys will
              start receiving 401 responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveConfirm}>
              Delete service account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
