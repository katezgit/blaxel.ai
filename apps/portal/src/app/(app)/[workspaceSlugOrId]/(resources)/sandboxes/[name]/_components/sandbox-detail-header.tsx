"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, RotateCw, ScrollText, Terminal, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { CopyButton } from "@repo/ui/components/copy-button";
import { IconButton } from "@repo/ui/components/icon-button";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { sandboxQueries } from "@/lib/query/sandboxes";
import type { Sandbox } from "@/lib/mock/sandboxes";
import { StatePill } from "../../_components/state-pill";
import { SandboxExtendAction } from "./sandbox-extend-action";

interface SandboxDetailHeaderProps {
  sandbox: Sandbox;
  workspaceSlug: string;
}

/** Sandbox detail page header. Meta row is trimmed to at-a-glance essentials
 *  — `slug+copy · region`. Alloc / Peak / Created / Last used live in the
 *  Overview body where they compose with the RAM card and stat context.
 *  Top-right action cluster carries the identity-band actions:
 *  `[Extend · countdown] [···]` — Extend is visible only when a TTL is set.
 *
 * Outer `<header>` rhythm: `gap-3 pt-2` (breadcrumb → title-block). The
 * header→tabs gap is owned by `page-shell`'s `gap-6` — no local `pb-*` here,
 * otherwise the two stack and produce a doubled empty band. */
export default function SandboxDetailHeader({
  sandbox,
  workspaceSlug,
}: SandboxDetailHeaderProps) {
  const heading = sandbox.metadata.displayName || sandbox.metadata.name;
  const listHref = `/${workspaceSlug}/sandboxes`;
  const name = sandbox.metadata.name;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accountId, workspaceId } = useCurrentTenancy();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleOpenInCli = useCallback(() => {
    const cmd = `bl connect sandbox ${name}`;
    void navigator.clipboard?.writeText(cmd);
    toast.success(`Copied — ${cmd}`);
  }, [name]);

  const handleViewLogs = useCallback(() => {
    router.push(`/${workspaceSlug}/sandboxes/${name}/logs`);
  }, [router, workspaceSlug, name]);

  const handleRestart = useCallback(() => {
    // Mock mutation — flip status to DEPLOYING in both detail + list caches
    // so the pill immediately reflects the requested restart.
    const detailKey = sandboxQueries.detail(accountId, workspaceId, name).queryKey;
    const listKey = sandboxQueries.list(accountId, workspaceId).queryKey;
    queryClient.setQueryData<Sandbox>(detailKey, (prev) =>
      prev ? { ...prev, status: "DEPLOYING" } : prev,
    );
    queryClient.setQueryData<ReadonlyArray<Sandbox>>(listKey, (prev) =>
      prev
        ? prev.map((s) =>
            s.metadata.name === name ? { ...s, status: "DEPLOYING" } : s,
          )
        : prev,
    );
    toast.success(`Restarting ${name}`);
  }, [queryClient, accountId, workspaceId, name]);

  const handleConfirmDelete = useCallback(() => {
    const listKey = sandboxQueries.list(accountId, workspaceId).queryKey;
    queryClient.setQueryData<ReadonlyArray<Sandbox>>(listKey, (prev) =>
      prev ? prev.filter((s) => s.metadata.name !== name) : prev,
    );
    setDeleteOpen(false);
    router.push(listHref);
    toast.success(`${name} deleted`);
  }, [queryClient, accountId, workspaceId, name, router, listHref]);

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
                <DropdownMenuItem onSelect={handleOpenInCli}>
                  <Terminal aria-hidden="true" />
                  Open in CLI
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleViewLogs}>
                  <ScrollText aria-hidden="true" />
                  View logs
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleRestart}>
                  <RotateCw aria-hidden="true" />
                  Restart
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeleteOpen(true)}
                >
                  <Trash2 aria-hidden="true" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <MetaRow sandbox={sandbox} />
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The Sandbox and its runtime state will be
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}

/** Trimmed meta row: slug+copy · region. Resource details (Alloc / Peak) live
 *  in the Overview RAM card; provenance (Created / Last used) lives at the
 *  top of the Overview body. */
function MetaRow({ sandbox }: { sandbox: Sandbox }) {
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
      <span aria-hidden="true" className="text-meta-foreground">
        ·
      </span>
      <span className="font-mono">{sandbox.spec.region}</span>
    </div>
  );
}
