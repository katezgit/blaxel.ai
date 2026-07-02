"use client";

import { Badge } from "@repo/ui/components/badge";
import type {
  Sandbox,
  SandboxDeploymentStatus,
  SandboxRuntimeState,
} from "@/lib/mock/sandboxes";

// Pill priority — failure and in-progress deployment statuses win; runtime
// state only drives the label once status=DEPLOYED.

export type SandboxStateLabel =
  | "Active"
  | "Standby"
  | "Deploying"
  | "Failed"
  | "Terminated";

interface PillSpec {
  label: SandboxStateLabel;
  variant: "success" | "running" | "warning" | "destructive" | "neutral";
}

export function pillFor(sandbox: Pick<Sandbox, "status" | "state">): PillSpec {
  return pillForStatus(sandbox.status, sandbox.state);
}

export function pillForStatus(
  status: SandboxDeploymentStatus,
  state: SandboxRuntimeState,
): PillSpec {
  if (status === "DEPLOYING" || status === "BUILT") {
    return { label: "Deploying", variant: "running" };
  }
  if (status === "FAILED") {
    return { label: "Failed", variant: "destructive" };
  }
  if (status === "TERMINATED" || status === "DELETING") {
    return { label: "Terminated", variant: "neutral" };
  }
  // status === "DEPLOYED"
  if (state === "RUNNING") {
    return { label: "Active", variant: "success" };
  }
  return { label: "Standby", variant: "neutral" };
}

interface StatePillProps {
  sandbox: Pick<Sandbox, "status" | "state">;
}

export function StatePill({ sandbox }: StatePillProps) {
  const { label, variant } = pillFor(sandbox);
  // showDot is suppressed for neutral by Badge's own dot map; we leave it on
  // so success/destructive/running keep their dot.
  return (
    <Badge variant={variant} showDot className="border-transparent bg-transparent">
      {label}
    </Badge>
  );
}
