"use client";

import { useMemo, useState } from "react";
import { CalendarClock, SearchX } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/empty-state";
import { SearchInput } from "@repo/ui/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
import {
  type SandboxSchedule,
  type SandboxScheduleType,
} from "@/lib/mock/sandbox-schedules-fixtures";
import SandboxSchedulesAddDrawer from "./sandbox-schedules-add-drawer";
interface SandboxSchedulesSectionProps {
  schedules: ReadonlyArray<SandboxSchedule>;
}

type TypeFilter = "all" | SandboxScheduleType;

const TYPE_OPTIONS: ReadonlyArray<{ value: TypeFilter; label: string }> = [
  { value: "all", label: "All types" },
  { value: "cron", label: "cron" },
  { value: "one-time", label: "one-time" },
  { value: "delay", label: "delay" },
];

const TYPE_PILL_LABEL: Record<SandboxScheduleType, string> = {
  cron: "cron",
  "one-time": "one-time",
  delay: "delay",
};

/** Schedules — Sandbox-internal command scheduler section. Owns toolbar
 *  filter + search state locally so the parent page stays a thin
 *  composition. Empty state renders the canonical CLI example so the
 *  primitive is self-explanatory the first time the operator sees it. */
export default function SandboxSchedulesSection({
  schedules,
}: SandboxSchedulesSectionProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");

  const visible = useMemo<ReadonlyArray<SandboxSchedule>>(() => {
    const normalized = search.trim().toLowerCase();
    return schedules.filter((schedule) => {
      if (typeFilter !== "all" && schedule.type !== typeFilter) return false;
      if (normalized) {
        const haystack = `${schedule.when} ${schedule.command}`.toLowerCase();
        if (!haystack.includes(normalized)) return false;
      }
      return true;
    });
  }, [schedules, search, typeFilter]);

  const isEmpty = schedules.length === 0;
  const noResults = !isEmpty && visible.length === 0;

  return (
    <section aria-label="Schedules" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="typography-subtitle text-foreground">Schedules</h2>
        <p className="typography-body text-muted-foreground">
          Schedules run a command inside this sandbox automatically, on a
          recurring cron, at a specific date, or after a delay.
        </p>
      </div>

      <div className="flex justify-end">
        <SandboxSchedulesAddDrawer />
      </div>

      {isEmpty ? null : (
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <SearchInput
              defaultValue={search}
              onLiveChange={setSearch}
              placeholder="Search schedules…"
              aria-label="Search schedules"
            />
          </div>
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as TypeFilter)}
          >
            <SelectTrigger
              className="w-40"
              aria-label="Filter schedules by type"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Table
        totalCount={visible.length}
        pageOffset={0}
        bordered
        className="bg-card"
      >
        <TableHeader>
          <tr>
            <TableHeaderCell label="Type" />
            <TableHeaderCell label="When" />
            <TableHeaderCell label="Command" />
          </tr>
        </TableHeader>
        <TableBody>
          {isEmpty && (
            <tr>
              <TableCell colSpan={3} className="py-6">
                <EmptyState
                  variant="zero-state"
                  icon={CalendarClock}
                  title="No schedules yet."
                />
              </TableCell>
            </tr>
          )}
          {!isEmpty && noResults && (
            <tr>
              <TableCell colSpan={3} className="py-6">
                <EmptyState
                  variant="no-results"
                  icon={SearchX}
                  title="No schedules match these filters."
                  cta={
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSearch("");
                        setTypeFilter("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              </TableCell>
            </tr>
          )}
          {!isEmpty &&
            !noResults &&
            visible.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md bg-muted-surface px-2 py-0.5",
                      "typography-meta font-mono text-meta-foreground",
                    )}
                  >
                    {TYPE_PILL_LABEL[schedule.type]}
                  </span>
                </TableCell>
                <TableCell variant="numeric" className="text-left">
                  <span className="font-mono typography-code text-foreground">
                    {schedule.when}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono typography-code text-foreground">
                    {schedule.command}
                  </span>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </section>
  );
}
