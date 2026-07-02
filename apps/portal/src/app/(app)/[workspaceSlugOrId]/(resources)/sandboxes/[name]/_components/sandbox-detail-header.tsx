"use client";

import { useCallback, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { CopyButton } from "@repo/ui/components/copy-button";
import { IconButton } from "@repo/ui/components/icon-button";
import { cn } from "@repo/ui/lib/cn";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import type { Sandbox } from "@/lib/mock/sandboxes";
import {
  allocatedRamLabel,
  createdAtLabel,
  peakRamCell,
} from "../../_components/row-helpers";
import { StatePill } from "../../_components/state-pill";
import { formatRelative } from "./format-helpers";
import { SandboxExtendAction } from "./sandbox-extend-action";

interface SandboxDetailHeaderProps {
  sandbox: Sandbox;
  workspaceSlug: string;
  /** Tab-owned CTA (e.g. Schedules → Add schedule). Rendered at the right
   *  edge of the title row, immediately before the Extend + overflow
   *  cluster. Undefined on tabs without a page-level action. */
  actions?: ReactNode;
}

/** Sandbox detail page header. Meta row mirrors the list-page vocabulary so
 *  Alex drilling list → detail reads the same shape:
 *  `slug · region · Alloc · Peak (24h) · Created · Last used`.
 *  Top-right action cluster carries the identity-band actions:
 *  `[Extend · countdown] [···]` — Extend is visible only when a TTL is set.
 *
 * Outer `<header>` rhythm: `gap-3 pt-2` (breadcrumb → title-block). The
 * header→tabs gap is owned by `page-shell`'s `gap-6` — no local `pb-*` here,
 * otherwise the two stack and produce a doubled empty band. */
export default function SandboxDetailHeader({
  sandbox,
  workspaceSlug,
  actions,
}: SandboxDetailHeaderProps) {
  const heading = sandbox.metadata.displayName || sandbox.metadata.name;
  const listHref = `/${workspaceSlug}/sandboxes`;

  const handleOpenInCli = useCallback(() => {
    void navigator.clipboard?.writeText(
      `bl connect sandbox ${sandbox.metadata.name}`,
    );
  }, [sandbox.metadata.name]);

  return (
    <header className="flex flex-col gap-3 pt-2">
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
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <SandboxExtendAction sandbox={sandbox} />
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
        </div>

        <MetaRow sandbox={sandbox} />
      </div>
    </header>
  );
}

/** List-parity meta row: slug+copy · region · Alloc · Peak (24h) · Created ·
 *  Last used. FAILED sandboxes never reached a usable state, so the last
 *  segment renders "Deploy failed {relative}" instead of "Last used". */
function MetaRow({ sandbox }: { sandbox: Sandbox }) {
  const peak = peakRamCell(sandbox);
  return (
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
      <span className="font-mono">{sandbox.spec.region}</span>
      <DotSeparator />
      <span className="font-mono tabular-nums">
        Alloc: {allocatedRamLabel(sandbox.spec.memoryMib)}
      </span>
      <DotSeparator />
      <PeakSegment peak={peak} />
      <DotSeparator />
      <span title={createdAtLabel(sandbox.metadata.createdAt)}>
        Created {formatRelative(sandbox.metadata.createdAt)}
      </span>
      <DotSeparator />
      <LifecycleItem sandbox={sandbox} />
    </div>
  );
}

/** `Peak (24h): N MB (P%)` — percentage flips to `text-state-warning-text`
 *  at ≥ 80% (same threshold as the list column). Renders `—` when no strip
 *  data exists (Deploying / never active). */
function PeakSegment({
  peak,
}: {
  peak: { label: string; percent: number } | null;
}) {
  if (!peak) {
    return (
      <span className="font-mono tabular-nums">
        Peak (24h): <span className="text-meta-foreground">—</span>
      </span>
    );
  }
  const parenIdx = peak.label.lastIndexOf(" (");
  const bytes = peak.label.slice(0, parenIdx);
  const percentSuffix = peak.label.slice(parenIdx);
  return (
    <span className="font-mono tabular-nums">
      Peak (24h): {bytes}
      <span
        className={cn(peak.percent >= 80 && "text-state-warning-text")}
      >
        {percentSuffix}
      </span>
    </span>
  );
}

function DotSeparator() {
  return (
    <span aria-hidden="true" className="text-meta-foreground">
      ·
    </span>
  );
}

/** Last-used vs deploy-failure variant. Failed sandboxes never reached a
 * usable state, so the meta row replaces "Last used …" with "Deploy failed
 * at …" (wireframe §2.3). */
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
