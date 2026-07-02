"use client";

import { useEffect, useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/cn";
import {
  extendSandboxTtl,
  type ExtendTtlStep,
  type Sandbox,
} from "@/lib/mock/sandboxes";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { ttlPillLabel, ttlUrgency } from "./format-helpers";

const STEPS: ReadonlyArray<{ step: ExtendTtlStep; label: string }> = [
  { step: "+1h", label: "+1h" },
  { step: "+24h", label: "+24h" },
  { step: "+7d", label: "+7d" },
  { step: "none", label: "No TTL" },
];

interface SandboxExtendActionProps {
  sandbox: Sandbox;
}

/** Top-right identity-band action: `Extend · {countdown}`. Hidden entirely
 *  when the Sandbox has no TTL (`expiresInSec === null`) — the `···` menu
 *  remains as the sole affordance.
 *
 * Any TTL = borrowed time, so the warning surface is ambient rather than
 * threshold-gated. `≤ 10m` escalates to the error tier and adds weight.
 *
 * The countdown ticks each second off a client-side wall-clock delta from
 * the initial `expiresInSec` snapshot. No network polling. */
export function SandboxExtendAction({ sandbox }: SandboxExtendActionProps) {
  const initialExpiresInSec = sandbox.spec.expiresInSec;
  const { accountId, workspaceId } = useCurrentTenancy();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ExtendTtlStep | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (initialExpiresInSec === null) return;
    const id = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1_000);
    return () => window.clearInterval(id);
  }, [initialExpiresInSec]);

  if (initialExpiresInSec === null) return null;

  const remainingSec = Math.max(0, initialExpiresInSec - elapsedSec);
  const urgency = ttlUrgency(remainingSec);
  const label = ttlPillLabel(remainingSec);

  async function handleStep(step: ExtendTtlStep) {
    setPending(step);
    try {
      await extendSandboxTtl(
        accountId,
        workspaceId,
        sandbox.metadata.name,
        step,
      );
      setOpen(false);
    } finally {
      setPending(null);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Extend TTL — currently ${label}`}
          className={cn(
            "font-mono tabular-nums",
            urgency === "error"
              ? "bg-state-errored-subtle text-state-errored-text font-medium not-disabled:not-aria-disabled:[&:not([data-loading])]:hover:bg-state-errored-subtle"
              : "bg-state-warning-subtle text-state-warning-text not-disabled:not-aria-disabled:[&:not([data-loading])]:hover:bg-state-warning-subtle",
          )}
        >
          Extend · {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1">
        <ul role="group" aria-label="Extend TTL">
          {STEPS.map(({ step, label: stepLabel }) => (
            <li key={step}>
              <button
                type="button"
                disabled={pending !== null}
                onClick={() => handleStep(step)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5",
                  "typography-body text-foreground",
                  "hover:bg-muted-surface",
                  "focus-visible:bg-muted-surface focus-visible:outline-none",
                  "disabled:opacity-50",
                )}
              >
                <span>{stepLabel}</span>
                {pending === step && (
                  <span className="typography-meta text-muted-foreground">
                    …
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
