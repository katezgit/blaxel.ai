"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import DetailPageHeader from "@/components/shell/detail-page-header";
import type { CustomDomain } from "@/lib/mock/custom-domains";
import { formatRegion } from "@/lib/regions";
import DomainStatusBadge from "../../_components/status-badge";
import DeleteDomainDialog from "./delete-domain-dialog";

interface DetailHeaderProps {
  domain: CustomDomain;
  workspaceSlug: string;
}

export default function DetailHeader({ domain, workspaceSlug }: DetailHeaderProps) {
  const { metadata, spec } = domain;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const showRetry = spec.status === "pending" || spec.status === "failed";
  const listHref = `/${workspaceSlug}/custom-domains`;

  const handleRetry = async () => {
    setIsRetrying(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsRetrying(false);
    toast.success(`Verification retry triggered for ${metadata.name}`);
  };

  return (
    <>
      <DetailPageHeader
        breadcrumb={
          <Breadcrumb
            parent={{ href: listHref, label: "Custom domains" }}
            current={metadata.name}
          />
        }
        heading={
          <span className="inline-flex items-center gap-3">
            <span>{metadata.name}</span>
            <DomainStatusBadge status={spec.status} />
          </span>
        }
        description={
          <CustomDomainDescription
            displayName={metadata.displayName}
            region={spec.region}
          />
        }
        action={
          <>
            {showRetry && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={handleRetry}
                    disabled={isRetrying}
                  >
                    {isRetrying ? "Retrying…" : "Retry verification"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Re-check DNS records now</TooltipContent>
              </Tooltip>
            )}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton variant="ghost" aria-label="More domain actions">
                <MoreHorizontal aria-hidden="true" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
              >
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </>
        }
      />

      <DeleteDomainDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        domainName={metadata.name}
      />
    </>
  );
}

interface CustomDomainDescriptionProps {
  displayName: string | null;
  region: string;
}

function CustomDomainDescription({
  displayName,
  region,
}: CustomDomainDescriptionProps) {
  const formatted = formatRegion(region);
  return (
    <>
      {displayName && (
        <>
          <span className="text-muted-foreground">Display name: </span>
          <span className="text-foreground">{displayName}</span>
          <span aria-hidden="true"> · </span>
        </>
      )}
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="text-base leading-none">
          {formatted.flag}
        </span>
        <span className="text-foreground">{formatted.label}</span>
        {formatted.label !== formatted.slug && (
          <span className="font-mono text-muted-foreground">
            ({formatted.slug})
          </span>
        )}
      </span>
    </>
  );
}
