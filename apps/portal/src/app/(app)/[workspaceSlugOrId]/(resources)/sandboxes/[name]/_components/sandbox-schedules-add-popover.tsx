"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { CopyButton } from "@repo/ui/components/copy-button";
import { ADD_SCHEDULE_CLI_EXAMPLE } from "@/lib/mock/sandbox-schedules-fixtures";

/** Mocked `+ Add schedule` CTA. The dashboard schedule-create flow is out
 * of scope for the demo — the popover routes the operator to the CLI
 * affordance instead, matching the empty-state copy. Composing here lets
 * us drop a Plus + label + popover in any toolbar slot without re-wiring
 * the parent. */
export default function SandboxSchedulesAddPopover() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="secondary">
          <Plus aria-hidden="true" />
          Add schedule
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[28rem] p-4">
        <div className="flex flex-col gap-3">
          <p className="typography-body text-foreground">
            Schedules are created from the CLI. Run this command in your
            terminal:
          </p>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted-surface px-3 py-2">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre font-mono typography-code text-foreground">
              {ADD_SCHEDULE_CLI_EXAMPLE}
            </code>
            <CopyButton
              value={ADD_SCHEDULE_CLI_EXAMPLE}
              ariaLabel="Copy CLI example"
            />
          </div>
          <p className="typography-meta text-meta-foreground">
            Supports cron, one-time (`--at`), and delay (`--in`).
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
