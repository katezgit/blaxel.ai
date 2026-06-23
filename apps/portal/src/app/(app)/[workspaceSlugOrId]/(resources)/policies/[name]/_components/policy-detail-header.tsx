"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Check, Copy } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import type { Policy } from "@/lib/mock/policies";
import { joinResourceTypes, policyTypeLabel } from "@/lib/mock/policies";

interface PolicyDetailHeaderProps {
  policy: Policy;
}

export function PolicyDetailHeader({ policy }: PolicyDetailHeaderProps) {
  const [copied, setCopied] = useState(false);

  async function copyName() {
    await navigator.clipboard.writeText(policy.metadata.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <header className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="typography-display font-semibold text-foreground">
            {policy.metadata.displayName}
          </h1>
          <button
            type="button"
            onClick={copyName}
            className="inline-flex items-center gap-1.5 self-start rounded-sm font-mono typography-meta text-muted-foreground hover:text-foreground focus-visible:shadow-focus-ring"
            aria-label={`Copy policy id ${policy.metadata.name}`}
          >
            <span>{policy.metadata.name}</span>
            {copied ? (
              <Check aria-hidden="true" className="size-3 text-state-scored-text" />
            ) : (
              <Copy aria-hidden="true" className="size-3 opacity-60" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <Pencil aria-hidden="true" />
            Edit
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
        </div>
      </div>
      <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 typography-body">
        <div className="flex items-center gap-2">
          <dt className="text-muted-foreground">Type:</dt>
          <dd className="font-medium text-foreground">
            {policyTypeLabel(policy.spec.type)}
            {policy.spec.type === "flavor" && (
              <span className="ml-2 typography-meta text-muted-foreground">
                [coming soon]
              </span>
            )}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-muted-foreground">Targets:</dt>
          <dd className="text-foreground">
            {joinResourceTypes(policy.spec.resourceTypes)}
          </dd>
        </div>
      </dl>
    </header>
  );
}
