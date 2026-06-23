"use client";

import { MoreHorizontal, Pencil, ShieldCheck } from "lucide-react";
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
import { policyTypeLabel, totalUsage } from "@/lib/mock/policies";

interface PolicyDetailHeaderProps {
  policy: Policy;
  workspaceSlug: string;
}

export function PolicyDetailHeader({ policy, workspaceSlug }: PolicyDetailHeaderProps) {
  const heading = policy.metadata.displayName || policy.metadata.name;
  const total = totalUsage(policy.usage);
  const listHref = `/${workspaceSlug}/policies`;

  return (
    <DetailPageHeader
      breadcrumb={
        <Breadcrumb
          parent={{ href: listHref, label: "Policies" }}
          current={heading}
        />
      }
      avatar={<IconAvatar icon={ShieldCheck} label="Policy" />}
      heading={heading}
      description={
        <>
          <span>{policyTypeLabel(policy.spec.type)} policy</span>
          <span aria-hidden="true"> · </span>
          <span>
            {total} {total === 1 ? "workload" : "workloads"} attached
          </span>
        </>
      }
      action={
        <>
          <Button variant="secondary">
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
                onSelect={() =>
                  navigator.clipboard.writeText(
                    `bl policy get ${policy.metadata.name}`,
                  )
                }
              >
                Copy bl command
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => navigator.clipboard.writeText(window.location.href)}
              >
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  );
}
