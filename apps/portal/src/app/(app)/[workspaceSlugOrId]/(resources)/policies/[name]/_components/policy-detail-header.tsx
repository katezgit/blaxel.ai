"use client";

import Link from "next/link";
import { Copy, MoreHorizontal, Pencil } from "lucide-react";
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
import { IconAvatar } from "@/components/shell/icon-avatar";
import type { Policy } from "@/lib/mock/policies";
import { POLICY_TYPE_BY_VALUE } from "../../_components/policy-form/form-schema";

interface PolicyDetailHeaderProps {
  policy: Policy;
  workspaceSlug: string;
  onRequestEdit: () => void;
  onRequestDelete: () => void;
}

export function PolicyDetailHeader({
  policy,
  workspaceSlug,
  onRequestEdit,
  onRequestDelete,
}: PolicyDetailHeaderProps) {
  const heading = policy.metadata.displayName || policy.metadata.name;
  const listHref = `/${workspaceSlug}/policies`;
  const duplicateHref = `/${workspaceSlug}/policies/new?duplicate=${encodeURIComponent(policy.metadata.name)}`;
  const typeOption = POLICY_TYPE_BY_VALUE[policy.spec.type];

  return (
    <DetailPageHeader
      breadcrumb={
        <Breadcrumb
          parent={{ href: listHref, label: "Policies" }}
          current={heading}
        />
      }
      avatar={<IconAvatar icon={typeOption.icon} label={`${typeOption.label} policy`} />}
      heading={heading}
      description={typeOption.narrative}
      action={
        <>
          <Button asChild variant="secondary">
            <Link href={duplicateHref}>
              <Copy aria-hidden="true" />
              Duplicate
            </Link>
          </Button>
          <Button variant="secondary" onClick={onRequestEdit}>
            <Pencil aria-hidden="true" />
            Edit policy
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton variant="ghost" aria-label="More policy actions">
                <MoreHorizontal aria-hidden="true" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => navigator.clipboard.writeText(window.location.href)}
              >
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(event) => {
                  event.preventDefault();
                  onRequestDelete();
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  );
}
