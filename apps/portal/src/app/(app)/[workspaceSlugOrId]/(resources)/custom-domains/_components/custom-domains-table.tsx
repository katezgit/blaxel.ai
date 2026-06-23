"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
import type { CustomDomain, CustomDomainStatus } from "@/lib/mock/custom-domains";
import { formatRelative } from "../_lib/relative-time";
import { DomainStatusBadge } from "./status-badge";

interface CustomDomainsTableProps {
  domains: ReadonlyArray<CustomDomain>;
}

const STATUS_ORDER: Record<CustomDomainStatus, number> = {
  failed: 0,
  pending: 1,
  verified: 2,
};

function statusOrder(s: CustomDomainStatus): number {
  return STATUS_ORDER[s];
}

// personality.md §7 — failure outranks success: failed rows sort to the top,
// then pending, then verified. Within a group, newest-first by createdAt.
function sortDomains(domains: ReadonlyArray<CustomDomain>): ReadonlyArray<CustomDomain> {
  return [...domains].sort((a, b) => {
    const orderDiff = statusOrder(a.spec.status) - statusOrder(b.spec.status);
    if (orderDiff !== 0) return orderDiff;
    return (
      Date.parse(b.metadata.createdAt) - Date.parse(a.metadata.createdAt)
    );
  });
}

export function CustomDomainsTable({ domains }: CustomDomainsTableProps) {
  const sorted = useMemo(() => sortDomains(domains), [domains]);
  const params = useParams<{ workspaceSlugOrId: string }>();
  const workspaceSlug = params.workspaceSlugOrId;

  return (
    <div className="relative w-full overflow-hidden overflow-x-auto rounded-md border border-border bg-card">
      <table className={tableClass}>
        <thead className={tableHeaderClass}>
          <tr>
            <th className={tableHeadVariants()}>Domain</th>
            <th className={tableHeadVariants()}>Region</th>
            <th className={tableHeadVariants()}>Status</th>
            <th className={tableHeadVariants()}>Last verified</th>
            <th className={cn(tableHeadVariants(), "w-10")} aria-hidden="true" />
          </tr>
        </thead>
        <tbody className={tableBodyClass}>
          {sorted.map((domain) => (
            <DomainRow
              key={domain.metadata.name}
              domain={domain}
              workspaceSlug={workspaceSlug}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface DomainRowProps {
  domain: CustomDomain;
  workspaceSlug: string;
}

function DomainRow({ domain, workspaceSlug }: DomainRowProps) {
  const { metadata, spec } = domain;
  const href = `/${workspaceSlug}/custom-domains/${encodeURIComponent(metadata.name)}`;
  const isFailed = spec.status === "failed";

  return (
    <>
      <tr
        className={cn(
          tableRowVariants(),
          "group cursor-pointer",
          // personality.md §7 — failure outranks success: failed rows carry a
          // subtle background tint + left-border accent to lift them off the
          // baseline rhythm without crossing into alarm-fatigue territory.
          isFailed && "bg-state-errored-subtle hover:bg-state-errored-subtle",
        )}
      >
        <td
          className={cn(
            tableCellVariants(),
            isFailed && "relative",
          )}
        >
          {isFailed && (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-0.5 bg-state-errored"
            />
          )}
          <Link
            href={href}
            className="flex flex-col gap-0.5 font-mono typography-label outline-hidden focus-visible:shadow-focus-ring rounded-sm"
          >
            <span className="text-foreground">{metadata.name}</span>
            {metadata.displayName && (
              <span className="font-sans typography-caption text-muted-foreground">
                {metadata.displayName}
              </span>
            )}
          </Link>
          <LabelChips labels={metadata.labels} />
        </td>
        <td className={cn(tableCellVariants(), "font-mono typography-label text-muted-foreground")}>
          {spec.region}
        </td>
        <td className={tableCellVariants()}>
          <DomainStatusBadge status={spec.status} />
        </td>
        <td className={cn(tableCellVariants(), "typography-label text-muted-foreground")}>
          {formatRelative(spec.lastVerifiedAt)}
        </td>
        <td className={cn(tableCellVariants(), "w-10 text-right")}>
          <ArrowRight
            aria-hidden="true"
            className="size-4 text-meta-foreground transition-colors group-hover:text-foreground"
          />
        </td>
      </tr>
      {isFailed && spec.verificationError && (
        <tr className="bg-state-errored-subtle">
          <td colSpan={5} className="px-6 pb-3 typography-caption text-state-errored-text">
            <span className="font-medium">
              {extractFirstLine(spec.verificationError)}
            </span>{" "}
            <Link
              href={href}
              className="font-medium underline-offset-2 hover:underline"
            >
              Check your DNS provider and retry verification →
            </Link>
          </td>
        </tr>
      )}
    </>
  );
}

function LabelChips({ labels }: { labels: Record<string, string> }) {
  const entries = Object.entries(labels);
  if (entries.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center rounded-sm bg-muted-surface px-1.5 py-0.5 font-mono typography-meta text-muted-foreground"
        >
          {key}:{value}
        </span>
      ))}
    </div>
  );
}

function extractFirstLine(text: string): string {
  const newline = text.indexOf(".");
  if (newline > 0) return text.slice(0, newline + 1);
  return text;
}
