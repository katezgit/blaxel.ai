"use client";

import { useState } from "react";
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
import {
  ttlPillLabel,
  ttlUrgency,
  type TtlUrgency,
} from "./format-helpers";

const STEPS: ReadonlyArray<{ step: ExtendTtlStep; label: string }> = [
  { step: "+1h", label: "+1h" },
  { step: "+24h", label: "+24h" },
  { step: "+7d", label: "+7d" },
  { step: "none", label: "No TTL" },
];

interface SandboxTtlControlProps {
  sandbox: Sandbox;
}

/** Inline TTL pill + Extend action per wireframe §1.1 + §1.1.1.
 *
 * State machine — three urgency tokens drive the pill tone; the Extend
 * button is visible at every urgency (operator can rescue at any point).
 * Selecting a step calls the mocked `extendSandboxTtl`, closes the popover,
 * and flashes a success label for ~1.5s. No optimistic mutation of the
 * pill in demo mode — the fixture is read-only. */
export function SandboxTtlControl({ sandbox }: SandboxTtlControlProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ExtendTtlStep | null>(null);
  const [succeededAt, setSucceededAt] = useState<number | null>(null);

  const urgency = ttlUrgency(sandbox.spec.expiresInSec);
  const pillLabel = ttlPillLabel(sandbox.spec.expiresInSec);

  async function handleStep(step: ExtendTtlStep) {
    setPending(step);
    try {
      await extendSandboxTtl(
        accountId,
        workspaceId,
        sandbox.metadata.name,
        step,
      );
      setSucceededAt(Date.now());
      setOpen(false);
      setTimeout(() => setSucceededAt(null), 1_500);
    } finally {
      setPending(null);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="typography-body text-muted-foreground">Expires in</span>
      <TtlPill urgency={urgency} label={pillLabel} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label={`Extend TTL for ${sandbox.metadata.displayName}`}
          >
            {succeededAt === null ? "Extend" : "Extended"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40 p-1">
          <ul role="group" aria-label="Extend TTL">
            {STEPS.map(({ step, label }) => (
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
                  <span>{label}</span>
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
    </span>
  );
}

interface TtlPillProps {
  urgency: TtlUrgency;
  label: string;
}

function TtlPill({ urgency, label }: TtlPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5",
        "font-mono typography-meta",
        urgency === "quiet" && "bg-muted-surface text-meta-foreground",
        urgency === "none" && "bg-muted-surface text-meta-foreground",
        urgency === "warning" &&
          "bg-state-warning-subtle text-state-warning-text",
        urgency === "error" &&
          "bg-state-errored-subtle font-medium text-state-errored-text",
      )}
    >
      {label}
    </span>
  );
}
