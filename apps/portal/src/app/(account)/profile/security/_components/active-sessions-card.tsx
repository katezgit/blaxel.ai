"use client";

import { Laptop, LogOut, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/cn";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import type { ActiveSession } from "@/lib/mock/profile";

const RELATIVE_FMT = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

function relativeFrom(iso: string, nowMs: number): string {
  const diffMs = new Date(iso).getTime() - nowMs;
  const absMs = Math.abs(diffMs);
  if (absMs >= DAY_MS) {
    return RELATIVE_FMT.format(Math.round(diffMs / DAY_MS), "day");
  }
  if (absMs >= HOUR_MS) {
    return RELATIVE_FMT.format(Math.round(diffMs / HOUR_MS), "hour");
  }
  return RELATIVE_FMT.format(Math.round(diffMs / MINUTE_MS), "minute");
}

function deviceIcon(device: string): LucideIcon {
  return device.toLowerCase().includes("phone") ? Smartphone : Laptop;
}

interface ActiveSessionsCardProps {
  sessions: ReadonlyArray<ActiveSession>;
}

export default function ActiveSessionsCard({ sessions }: ActiveSessionsCardProps) {
  const nowMs = Date.now();

  return (
    <Panel title="Active sessions">
      <ul className="flex flex-col gap-0">
        {sessions.map((session, idx) => {
          const Icon = deviceIcon(session.device);
          const lastActive = relativeFrom(session.lastActiveAt, nowMs);
          return (
            <li
              key={session.id}
              className={cn(
                "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
                idx !== 0 && "border-t border-border",
                idx === 0 && "pt-0",
                idx === sessions.length - 1 && "pb-0",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted-surface text-muted-foreground"
                >
                  <Icon className="size-5" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-body font-medium text-foreground">
                      {session.device}
                    </span>
                    {session.isCurrent ? (
                      <Badge variant="brand-soft">This device</Badge>
                    ) : null}
                  </div>
                  <span className="text-caption text-muted-foreground">
                    {session.browser}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    {session.location} &middot; Active {lastActive}
                  </span>
                </div>
              </div>
              <div className="shrink-0">
                {session.isCurrent ? (
                  <span className="text-caption text-muted-foreground">
                    Current session
                  </span>
                ) : (
                  <Button variant="secondary">
                    <LogOut aria-hidden="true" className="size-3.5" />
                    Revoke
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
