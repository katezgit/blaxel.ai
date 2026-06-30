"use client";

import type { Sandbox } from "@/lib/mock/sandboxes";
import BandFrame from "./band-frame";

interface SandboxEventsBandProps {
  sandbox: Sandbox;
  className?: string;
}

const TIMESTAMP_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
  timeZoneName: "short",
});

export default function SandboxEventsBand({
  sandbox,
  className,
}: SandboxEventsBandProps) {
  const events = sandbox.events;
  return (
    <BandFrame label="Recent events" className={className}>
      {events.length === 0 ? (
        <p className="typography-body text-muted-foreground">
          No events recorded.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          {events.map((event, idx) => (
            <li
              key={`${event.time}-${idx}`}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono typography-caption text-meta-foreground">
                  {event.status}
                </span>
                <span className="typography-body text-foreground">
                  {event.message}
                </span>
              </div>
              <span className="shrink-0 typography-caption text-muted-foreground">
                {TIMESTAMP_FMT.format(new Date(event.time))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </BandFrame>
  );
}
