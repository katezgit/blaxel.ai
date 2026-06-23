import { Check, X, Loader2 } from "lucide-react";
import { CopyButton } from "@repo/ui/components/copy-button";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
import type {
  CustomDomain,
  CustomDomainStatus,
} from "@/lib/mock/custom-domains";
import Band from "./band";

function relativeFromNow(iso: string | null): string {
  if (iso === null) return "—";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const delta = Date.now() - then;
  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;
  if (delta < MINUTE) return "just now";
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)} min ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h ago`;
  if (delta < MONTH) return `${Math.floor(delta / DAY)}d ago`;
  if (delta < YEAR) return `${Math.floor(delta / MONTH)}mo ago`;
  return `${Math.floor(delta / YEAR)}y ago`;
}

interface DnsRecordsBandProps {
  domain: CustomDomain;
}

interface RecordRow {
  type: "CNAME" | "TXT";
  host: string;
  value: string;
  isFailing: boolean;
}

export default function DnsRecordsBand({ domain }: DnsRecordsBandProps) {
  const { metadata, spec } = domain;
  const txtEntries = Object.entries(spec.txtRecords);

  // Anchor failure attribution on backtick-wrapped host in verificationError
  // (e.g. "TXT record `_blaxel-verify.acme.com` not found"). Substring match
  // without backticks would cross-trip (CNAME host's tail matches TXT host).
  const failingFor = (host: string): boolean =>
    spec.status === "failed" &&
    spec.verificationError !== null &&
    spec.verificationError.includes(`\`${host}\``);

  const rows: ReadonlyArray<RecordRow> = [
    {
      type: "CNAME",
      host: metadata.name,
      value: spec.cnameRecords,
      isFailing: failingFor(metadata.name),
    },
    ...txtEntries.map(([host, value]) => ({
      type: "TXT" as const,
      host,
      value,
      isFailing: failingFor(host),
    })),
  ];

  // Catch-all error: failures the per-record annotation can't attribute
  // (CAA conflict, ACM issuance failure, etc.) — surfaced under the table
  // so the page has a single "what's wrong with the DNS check" surface.
  const showCatchAllError =
    spec.status === "failed" &&
    spec.verificationError !== null &&
    !rows.some((r) => r.isFailing);

  return (
    <Band title="DNS records to publish at your provider">
      <div className="flex flex-col gap-3">
        {/* Invariant: lastVerifiedAt is null for pending (never checked) — so
            the pending branch shows the propagation hint instead of an empty
            "Last checked —". */}
        <p className="typography-caption text-muted-foreground">
          {spec.status === "pending" ? (
            "DNS propagation can take up to 48 hours."
          ) : (
            <>
              Last checked{" "}
              <span className="text-foreground">
                {relativeFromNow(spec.lastVerifiedAt)}
              </span>
              {showCatchAllError && (
                <>
                  <span aria-hidden="true"> · </span>
                  <span className="text-state-errored-text">
                    {spec.verificationError}
                  </span>
                </>
              )}
            </>
          )}
        </p>

        <div className="relative w-full overflow-hidden overflow-x-auto rounded-md border border-border bg-card">
          <table className={tableClass} aria-label="DNS records to publish">
            <thead className={tableHeaderClass}>
              <tr>
                {/* Type pins at 80px ("CNAME"/"TXT" at typography-label fit
                    in ~50px; 80 gives breathing room without pulling Host
                    leftward as content lengths vary). Status pins at 140px
                    to fit the longest label "× Not matched" without wrap. */}
                <th className={cn(tableHeadVariants(), "w-[80px]")}>Type</th>
                <th className={tableHeadVariants()}>Host</th>
                <th className={tableHeadVariants()}>Value</th>
                <th className={cn(tableHeadVariants(), "w-[140px]")}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className={tableBodyClass}>
              {rows.map((row) => (
                <RecordTableRow
                  key={`${row.type}-${row.host}`}
                  row={row}
                  status={spec.status}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Band>
  );
}

interface RecordTableRowProps {
  row: RecordRow;
  status: CustomDomainStatus;
}

function RecordTableRow({ row, status }: RecordTableRowProps) {
  return (
    <tr
      className={cn(
        tableRowVariants(),
        "group/row",
        // personality.md §7 — failure outranks success. Failing row gets the
        // wash + accent the rest of the system uses for failed entries; CNAME
        // (matched) and other TXT rows stay default.
        row.isFailing && "bg-dns-record-error-bg hover:bg-dns-record-error-bg",
      )}
    >
      <td
        className={cn(
          tableCellVariants(),
          "font-mono typography-label text-foreground",
          row.isFailing && "relative",
        )}
      >
        {row.isFailing && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-0.5 bg-state-errored"
          />
        )}
        {row.type}
      </td>
      <td className={tableCellVariants()}>
        <HoverCopyCell value={row.host} label="Copy host" />
      </td>
      <td className={tableCellVariants()}>
        <HoverCopyCell value={row.value} label="Copy value" />
      </td>
      <td className={tableCellVariants()}>
        <RowStatusCell row={row} status={status} />
      </td>
    </tr>
  );
}

function HoverCopyCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="font-mono typography-label text-foreground whitespace-nowrap">
        {value}
      </span>
      <CopyButton
        value={value}
        tooltipLabel={label}
        className="opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100"
      />
    </div>
  );
}

function RowStatusCell({ row, status }: RecordTableRowProps) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 typography-caption font-medium text-state-warning-text whitespace-nowrap">
        <Loader2 className="size-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        Checking
      </span>
    );
  }
  if (row.isFailing) {
    return (
      <span className="inline-flex items-center gap-1.5 typography-caption font-medium text-state-errored-text whitespace-nowrap">
        <X className="size-3" aria-hidden="true" />
        {row.type === "CNAME" ? "Not matched" : "Not found"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 typography-caption font-medium text-state-scored-text whitespace-nowrap">
      <Check className="size-3" aria-hidden="true" />
      Matched
    </span>
  );
}
