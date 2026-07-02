"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUp,
  Circle,
  CircleDot,
  Play,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/cn";
import type { Sandbox, SandboxTimelineEvent } from "@/lib/mock/sandboxes";
import BandFrame from "./band-frame";

interface SandboxEventsBandProps {
  sandbox: Sandbox;
}

type EventTypeFilter =
  | "all"
  | "transitions"
  | "requests"
  | "boot"
  | "ttl"
  | "errors";

type TimeRange = "5m" | "1h" | "6h" | "24h" | "7d" | "custom";

const TYPE_FILTERS: ReadonlyArray<{ value: EventTypeFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "transitions", label: "State transitions" },
  { value: "requests", label: "Requests" },
  { value: "boot", label: "Boot" },
  { value: "ttl", label: "TTL" },
  { value: "errors", label: "Errors" },
];

const TIME_RANGES: ReadonlyArray<{ value: TimeRange; label: string }> = [
  { value: "5m", label: "Last 5m" },
  { value: "1h", label: "Last 1h" },
  { value: "6h", label: "Last 6h" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
  { value: "custom", label: "Custom" },
];

const TIMESTAMP_FMT = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

/** §1.6 Events timeline band — the only temporal view on Overview once the
 *  time-series chart band is gone. Standby↔Active grouping is fixture-side
 *  (the `groupedCount` field on the timeline row); this component renders
 *  the summary text and applies the default filter that hides ungrouped
 *  idle transitions unless the type filter = "all".
 *
 *  Each row carries `id="event-{occurredAt}"` so deep links from the
 *  incident channel paste straight to the row. */
export default function SandboxEventsBand({ sandbox }: SandboxEventsBandProps) {
  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>("all");
  const [range, setRange] = useState<TimeRange>("1h");

  const filtered = useMemo(
    () => filterTimeline(sandbox.timeline, typeFilter),
    [sandbox.timeline, typeFilter],
  );

  return (
    <BandFrame
      label="Events"
      action={
        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as EventTypeFilter)}
          >
            <SelectTrigger size="sm" aria-label="Event type filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={range}
            onValueChange={(v) => setRange(v as TimeRange)}
          >
            <SelectTrigger size="sm" aria-label="Time range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      {filtered.length === 0 ? (
        <p className="typography-body text-meta-foreground">No events in this window.</p>
      ) : (
        <ol className="flex flex-col divide-y divide-border rounded-md border border-border">
          {filtered.map((event) => (
            <EventRow key={event.occurredAt + event.label} event={event} />
          ))}
        </ol>
      )}
    </BandFrame>
  );
}

function filterTimeline(
  timeline: ReadonlyArray<SandboxTimelineEvent>,
  filter: EventTypeFilter,
): ReadonlyArray<SandboxTimelineEvent> {
  if (filter === "all") return timeline;
  return timeline.filter((event) => {
    switch (filter) {
      case "transitions":
        return event.kind === "transition";
      case "requests":
        return event.kind === "request";
      case "boot":
        return event.kind === "boot";
      case "ttl":
        return event.kind === "ttl";
      case "errors":
        return event.kind === "error";
    }
  });
}

function EventRow({ event }: { event: SandboxTimelineEvent }) {
  const isError = event.kind === "error";
  const isGroupedSummary =
    event.groupedCount !== undefined && event.groupedCount > 0;
  const anchor = `event-${event.occurredAt}`;
  return (
    <li
      id={anchor}
      className={cn(
        "grid grid-cols-[7rem_1.25rem_minmax(0,1fr)] items-baseline gap-3 px-4 py-2",
        isError && "bg-state-errored-subtle",
      )}
    >
      <span className="font-mono typography-meta text-meta-foreground">
        {TIMESTAMP_FMT.format(new Date(event.occurredAt))}
      </span>
      <span aria-hidden="true" className="flex items-center justify-center">
        <EventIcon event={event} muted={isGroupedSummary} />
      </span>
      <span
        className={cn(
          "flex flex-col gap-0.5 typography-body",
          isError && "font-medium text-state-errored-text",
          !isError && isGroupedSummary && "text-meta-foreground",
          !isError && !isGroupedSummary && "text-foreground",
        )}
      >
        <span className="flex flex-wrap items-baseline gap-2">
          <span>{event.label}</span>
          {isGroupedSummary && (
            <span className="typography-meta text-meta-foreground">
              (× {event.groupedCount} in last 1h)
            </span>
          )}
        </span>
        {event.context && (
          <span
            className={cn(
              "typography-meta",
              isError ? "text-state-errored-text" : "text-meta-foreground",
            )}
          >
            {event.context}
            {event.contextHref && (
              <>
                {" "}
                <a
                  href={event.contextHref}
                  className="underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  see log line
                </a>
              </>
            )}
          </span>
        )}
      </span>
    </li>
  );
}

function EventIcon({
  event,
  muted,
}: {
  event: SandboxTimelineEvent;
  muted: boolean;
}) {
  switch (event.icon) {
    case "active":
      return (
        <Circle
          className={cn(
            "size-3",
            muted
              ? "fill-meta-foreground text-meta-foreground"
              : "fill-state-scored text-state-scored",
          )}
          aria-hidden="true"
        />
      );
    case "standby":
      return (
        <CircleDot
          className="size-3 text-meta-foreground"
          aria-hidden="true"
        />
      );
    case "deployed":
      return <Play className="size-3 text-foreground" aria-hidden="true" />;
    case "spawned":
      return (
        <ArrowUp className="size-3 text-meta-foreground" aria-hidden="true" />
      );
    case "error":
      return (
        <AlertTriangle
          className="size-3 text-state-errored-text"
          aria-hidden="true"
        />
      );
    case "terminated":
      return <X className="size-3 text-meta-foreground" aria-hidden="true" />;
    case "ttl":
      return (
        <CircleDot
          className="size-3 text-state-warning-text"
          aria-hidden="true"
        />
      );
    case "request":
      return (
        <Circle
          className="size-3 fill-state-scored text-state-scored"
          aria-hidden="true"
        />
      );
  }
}
