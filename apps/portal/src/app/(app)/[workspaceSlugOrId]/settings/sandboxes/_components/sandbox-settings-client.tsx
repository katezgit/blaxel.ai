"use client";

import { useState } from "react";
import { Switch } from "@repo/ui/components/switch";
import { toast } from "sonner";

interface SandboxSettingsClientProps {
  initial: boolean;
}

export default function SandboxSettingsClient({
  initial,
}: SandboxSettingsClientProps) {
  const [logsDisabled, setLogsDisabled] = useState(initial);

  return (
    <div className="flex w-full max-w-3xl items-start justify-between gap-4 rounded-md border border-border bg-muted-surface px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor="disable-process-logging"
          className="typography-body font-medium text-foreground"
        >
          Disable process logging
        </label>
        <p className="typography-caption text-muted-foreground">
          Prevent sandboxes from capturing per-process stdout / stderr logs.
          Requires sandbox-api v0.2.28+.
        </p>
      </div>
      <Switch
        id="disable-process-logging"
        checked={logsDisabled}
        onCheckedChange={(next) => {
          setLogsDisabled(next);
          toast.success(
            next
              ? "Process logging disabled for new sandboxes."
              : "Process logging enabled for new sandboxes.",
          );
        }}
        aria-label="Disable process logging"
      />
    </div>
  );
}
