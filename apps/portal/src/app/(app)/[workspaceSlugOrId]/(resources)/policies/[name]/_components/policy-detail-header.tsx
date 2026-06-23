"use client";

import { MoreHorizontal, Pencil } from "lucide-react";
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
import type { Policy } from "@/lib/mock/policies";
import { POLICY_TYPE_BY_VALUE } from "@/app/(app)/[workspaceSlugOrId]/(resources)/policies/_components/policy-form/form-schema";

interface PolicyDetailHeaderProps {
  policy: Policy;
  workspaceSlug: string;
  onRequestEdit: () => void;
  onRequestDuplicate: () => void;
  onRequestDelete: () => void;
}

export default function PolicyDetailHeader({
  policy,
  workspaceSlug,
  onRequestEdit,
  onRequestDuplicate,
  onRequestDelete,
}: PolicyDetailHeaderProps) {
  const heading = policy.metadata.displayName || policy.metadata.name;
  const listHref = `/${workspaceSlug}/policies`;
  const typeOption = POLICY_TYPE_BY_VALUE[policy.spec.type];

  return (
    <DetailPageHeader
      breadcrumb={
        <Breadcrumb
          parent={{ href: listHref, label: "Policies" }}
          current={heading}
        />
      }
      heading={heading}
      description={typeOption.narrative}
      action={
        <>
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
              <DropdownMenuItem onSelect={onRequestDuplicate}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => navigator.clipboard.writeText(window.location.href)}
              >
                Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
