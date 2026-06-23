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
import { Breadcrumb } from "@/components/shell/breadcrumb";
import { DetailPageHeader } from "@/components/shell/detail-page-header";
import type { CustomDomain } from "@/lib/mock/custom-domains";
import DeleteDomainDialog from "./delete-domain-dialog";

interface DetailHeaderProps {
  domain: CustomDomain;
  workspaceSlug: string;
}

const STATUS_LABEL = {
  pending: "Pending",
  verified: "Verified",
  failed: "Failed",
} as const;

// Each status is colored semantically — pairs with the per-record check
// outcomes in DnsRecordsBand and the inline indicator in VerificationBand so
// every "Failed / Pending / Verified" string on the page reads in the same
// hue. Half-coloring (only failed) was the prior bug.
const STATUS_DESCRIPTION_CLASS = {
  pending: "font-medium text-state-warning-text",
  verified: "font-medium text-state-scored-text",
  failed: "font-medium text-state-errored-text",
} as const;

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
        heading={metadata.name}
        description={
          <CustomDomainDescription
            status={spec.status}
            region={spec.region}
          />
        }
        action={
          <>
            {showRetry && (
              <Button
                variant="secondary"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? "Retrying…" : "Retry verification"}
              </Button>
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
                    navigator.clipboard.writeText(
                      `bl customdomain get ${metadata.name}`,
                    )
                  }
                >
                  Copy bl command
                </DropdownMenuItem>
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
  status: CustomDomain["spec"]["status"];
  region: string;
}

function CustomDomainDescription({ status, region }: CustomDomainDescriptionProps) {
  return (
    <>
      <span>Custom domain</span>
      <span aria-hidden="true"> · </span>
      <span className={STATUS_DESCRIPTION_CLASS[status]}>
        {STATUS_LABEL[status]}
      </span>
      <span aria-hidden="true"> · </span>
      <span className="font-mono">{region}</span>
    </>
  );
}
