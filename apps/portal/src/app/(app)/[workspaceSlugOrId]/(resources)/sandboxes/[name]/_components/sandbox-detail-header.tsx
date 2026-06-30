"use client";

import { useCallback } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { CopyButton } from "@repo/ui/components/copy-button";
import { IconButton } from "@repo/ui/components/icon-button";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import type { Sandbox } from "@/lib/mock/sandboxes";
import { StatePill } from "../../_components/state-pill";
import {
  formatRelative,
  imageWithShaLabel,
  memoryLabel,
} from "./format-helpers";
import { SandboxTtlControl } from "./sandbox-ttl-control";

interface SandboxDetailHeaderProps {
  sandbox: Sandbox;
  workspaceSlug: string;
}

/** Sandbox detail page header per wireframe §1.1. Owns:
 *  - Three-tier identity (display name h1 / resource slug font-mono /
 *    Deployment ID UUID is Settings-only).
 *  - State pill inline with h1 at gap-2.
 *  - Right-edge overflow `[···]` (no gear — Audit Q3 closed).
 *  - Single `.page-header-meta` row carrying slug · image+SHA · region ·
 *    memory · `Created by … {ago}` · `Last used {ago}` · TTL+Extend.
 *
 * Outer `<header>` rhythm comes from `header-rhythm.md`: `gap-3 pt-2 pb-6`. */
export default function SandboxDetailHeader({
  sandbox,
  workspaceSlug,
}: SandboxDetailHeaderProps) {
  const heading = sandbox.metadata.displayName || sandbox.metadata.name;
  const listHref = `/${workspaceSlug}/sandboxes`;
  const image = imageWithShaLabel(sandbox.spec.image);
  const memory = memoryLabel(sandbox.spec.memoryMib);

  const handleOpenInCli = useCallback(() => {
    void navigator.clipboard?.writeText(
      `bl connect sandbox ${sandbox.metadata.name}`,
    );
  }, [sandbox.metadata.name]);

  return (
    <header className="flex flex-col gap-3 pt-2 pb-6">
      <Breadcrumb
        parent={{ href: listHref, label: "Sandboxes" }}
        current={heading}
      />
      <div className="flex min-w-0 flex-col page-header">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="typography-display font-semibold text-foreground">
              {heading}
            </h1>
            <StatePill sandbox={sandbox} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="ghost"
                aria-label={`Actions for ${heading}`}
              >
                <MoreHorizontal aria-hidden="true" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => undefined}>
                Restart
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleOpenInCli}>
                Open in CLI
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => undefined}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="page-header-meta">
          <span className="page-header-meta-group">
            <span className="font-mono text-foreground">
              {sandbox.metadata.name}
            </span>
            <CopyButton
              value={sandbox.metadata.name}
              ariaLabel={`Copy slug ${sandbox.metadata.name}`}
            />
          </span>
          <DotSeparator />
          <span className="page-header-meta-group">
            <span className="font-mono">{image}</span>
            <CopyButton value={image} ariaLabel={`Copy image ${image}`} />
          </span>
          <DotSeparator />
          <span className="font-mono">{sandbox.spec.region}</span>
          <DotSeparator />
          <span>{memory}</span>
          <DotSeparator />
          <CreatedByItem
            displayName={sandbox.metadata.createdBy.displayName}
            iso={sandbox.metadata.createdAt}
          />
          <DotSeparator />
          <LifecycleItem sandbox={sandbox} />
          <DotSeparator />
          <SandboxTtlControl sandbox={sandbox} />
        </div>
      </div>
    </header>
  );
}

function DotSeparator() {
  return (
    <span aria-hidden="true" className="text-meta-foreground">
      ·
    </span>
  );
}

function CreatedByItem({
  displayName,
  iso,
}: {
  displayName: string;
  iso: string;
}) {
  return (
    <span title={iso}>
      Created by{" "}
      <span className="text-foreground">{displayName}</span>{" "}
      {formatRelative(iso)}
    </span>
  );
}

/** Last-used vs deploy-failure variant. Errored sandboxes never reached a
 * usable state, so the wireframe replaces `Last used …` with `Deploy failed
 * at …` (§2.3). Branches on `sandbox.status`. */
function LifecycleItem({ sandbox }: { sandbox: Sandbox }) {
  if (sandbox.status === "FAILED") {
    return (
      <span title={sandbox.metadata.createdAt}>
        Deploy failed {formatRelative(sandbox.metadata.createdAt)}
      </span>
    );
  }
  if (sandbox.lastUsedAt === null) {
    return <span className="text-meta-foreground">Never used</span>;
  }
  return (
    <span title={sandbox.lastUsedAt}>
      Last used {formatRelative(sandbox.lastUsedAt)}
    </span>
  );
}
