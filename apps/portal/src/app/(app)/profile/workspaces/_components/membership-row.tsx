"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import type { WorkspaceMembership } from "@/lib/mock/profile";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const RELATIVE_FMT = new Intl.RelativeTimeFormat("en-US", {
  numeric: "auto",
});

function relativeFromNow(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((then - now) / 1000);
  const absSec = Math.abs(diffSec);
  if (absSec < 60) return RELATIVE_FMT.format(diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return RELATIVE_FMT.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return RELATIVE_FMT.format(diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) return RELATIVE_FMT.format(diffDay, "day");
  const diffMonth = Math.round(diffDay / 30);
  return RELATIVE_FMT.format(diffMonth, "month");
}

interface MembershipRowProps {
  membership: WorkspaceMembership;
  onLeave: () => void;
}

export default function MembershipRow({
  membership,
  onLeave,
}: MembershipRowProps) {
  const initial = membership.workspaceName.charAt(0).toUpperCase();

  return (
    <li>
      <Card className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft font-mono typography-body font-semibold text-primary"
          >
            {initial}
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/${membership.workspaceSlug}/sandboxes`}
                className="inline-flex items-center gap-1 rounded-sm font-mono typography-body font-medium text-foreground transition-colors duration-fast ease-out-standard hover:text-primary hover:underline focus-visible:shadow-focus-ring"
              >
                {membership.workspaceName}
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
              <Badge variant="neutral">{membership.role}</Badge>
            </div>
            <span className="typography-caption text-muted-foreground">
              Joined {DATE_FMT.format(new Date(membership.joinedAt))} ·
              {" "}Last active {relativeFromNow(membership.lastAccessedAt)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              onLeave();
              toast.success(`Left ${membership.workspaceName} (mock).`);
            }}
            disabled={membership.role === "owner"}
          >
            Leave
          </Button>
        </div>
      </Card>
    </li>
  );
}
