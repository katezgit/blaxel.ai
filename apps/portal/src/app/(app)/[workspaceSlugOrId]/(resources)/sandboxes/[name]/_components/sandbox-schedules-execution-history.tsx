"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, type BadgeProps } from "@repo/ui/components/badge";
import { SearchInput } from "@repo/ui/components/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@repo/ui/components/table";
import type {
  ScheduleExecution,
  ScheduleExecutionStatus,
} from "@/lib/mock/sandbox-schedules-fixtures";

interface SandboxSchedulesExecutionHistoryProps {
  executions: ReadonlyArray<ScheduleExecution>;
}

const TIMESTAMP_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

function formatExecutionTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${TIMESTAMP_FMT.format(d)} UTC`;
}

interface StatusToneSpec {
  label: string;
  icon: typeof CheckCircle2;
  className: string;
}

const STATUS_TONE: Record<ScheduleExecutionStatus, StatusToneSpec> = {
  succeeded: {
    label: "Succeeded",
    icon: CheckCircle2,
    className: "text-state-scored",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "text-state-errored-text",
  },
  running: {
    label: "Running",
    icon: CircleDashed,
    className: "text-state-info-text",
  },
  skipped: {
    label: "Skipped",
    icon: MinusCircle,
    className: "text-meta-foreground",
  },
};

/** Execution history — peer section under Schedules. Owns its own search
 *  state locally; the outer page passes only the executions array. Empty
 *  branch is a quiet inline message rather than the CLI empty-state, since
 *  the parent Schedules empty-state already carries the "you have no
 *  primitive at all" affordance. */
export default function SandboxSchedulesExecutionHistory({
  executions,
}: SandboxSchedulesExecutionHistoryProps) {
  const [search, setSearch] = useState("");

  const visible = useMemo<ReadonlyArray<ScheduleExecution>>(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return executions;
    return executions.filter((execution) => {
      const haystack =
        `${execution.scheduleLabel} ${execution.status}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [executions, search]);

  const isEmpty = executions.length === 0;
  const noResults = !isEmpty && visible.length === 0;

  return (
    <section aria-label="Execution history" className="flex flex-col gap-4">
      <h2 className="typography-subtitle text-foreground">Execution history</h2>
      {!isEmpty && (
        <div>
          <SearchInput
            defaultValue={search}
            onLiveChange={setSearch}
            placeholder="Search executions…"
            aria-label="Search executions"
          />
        </div>
      )}

      {isEmpty ? (
        <p className="rounded-md border border-border bg-card px-6 py-10 text-center typography-body text-muted-foreground">
          No executions yet. Runs appear here once a schedule fires.
        </p>
      ) : (
        <Table
          totalCount={visible.length}
          pageOffset={0}
          bordered
          className="bg-card"
        >
          <TableHeader>
            <tr>
              <TableHeaderCell label="Schedule" />
              <TableHeaderCell label="Trigger status" />
              <TableHeaderCell label="When" />
              <TableHeaderCell label="Logs" />
            </tr>
          </TableHeader>
          <TableBody>
            {noResults ? (
              <tr>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  No executions match this search.
                </TableCell>
              </tr>
            ) : (
              visible.map((execution) => {
                const tone = STATUS_TONE[execution.status];
                const Icon = tone.icon;
                return (
                  <TableRow key={execution.id}>
                    <TableCell>
                      <span className="font-mono typography-code text-foreground">
                        {execution.scheduleLabel}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 typography-body",
                          tone.className,
                        )}
                      >
                        <Icon aria-hidden="true" className="size-3.5" />
                        {tone.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono typography-meta text-meta-foreground">
                        {formatExecutionTime(execution.occurredAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={execution.logsHref}
                        className="typography-body text-foreground underline-offset-4 hover:underline"
                      >
                        View logs
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
