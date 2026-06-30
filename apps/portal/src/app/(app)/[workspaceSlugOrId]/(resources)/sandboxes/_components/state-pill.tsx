"use client";

import { Badge } from "@repo/ui/components/badge";
import type {
  Sandbox,
  SandboxDeploymentStatus,
  SandboxRuntimeState,
} from "@/lib/mock/sandboxes";

// Pill priority — error and in-progress deployment states win; runtime
// state only drives the label once status=DEPLOYED. Matches the table in
// `sandboxes-2026-06-30.wireframe.md` §1.4.

export type SandboxStateLabel =
  | "Active"
  | "Standby"
  | "Deploying"
  | "Errored"
  | "Terminated"
  | "Deactivating"
  | "Inactive";

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
    return { label: "Errored", variant: "destructive" };
  }
  if (status === "TERMINATED" || status === "DELETING") {
    return { label: "Terminated", variant: "neutral" };
  }
  if (status === "DEACTIVATING") {
    return { label: "Deactivating", variant: "running" };
  }
  if (status === "DEACTIVATED") {
    return { label: "Inactive", variant: "neutral" };
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
    <Badge variant={variant} showDot>
      {label}
    </Badge>
  );
}
