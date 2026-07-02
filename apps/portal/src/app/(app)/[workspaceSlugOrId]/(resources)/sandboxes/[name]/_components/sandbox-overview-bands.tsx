"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { sandboxQueries } from "@/lib/query/sandboxes";
import { useParams } from "next/navigation";
import SandboxConnectNow from "./sandbox-connect-now";
import SandboxConnectionMethodsBand from "./sandbox-connection-methods-band";
import SandboxEventsBand from "./sandbox-events-band";
import SandboxFailureCard from "./sandbox-failure-card";
import SandboxProcessLogBand from "./sandbox-process-log-band";
import SandboxProvenanceBand from "./sandbox-provenance-band";
import SandboxSecurityBand from "./sandbox-security-band";
import SandboxStorageBand from "./sandbox-storage-band";
import SandboxVitalsStrip from "./sandbox-vitals-strip";

/** Tier 1 + Tier 2 forensic bands for the sandbox detail Overview tab.
 * Reads sandbox data from the hydrated query cache populated in `layout.tsx`.
 * The loading / error / not-found shells live in the layout chrome — if this
 * component is rendered, the sandbox is guaranteed populated. */
export default function SandboxOverviewBands() {
  const { name } = useParams<{ name: string }>();
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: sandbox } = useQuery(
    sandboxQueries.detail(accountId, workspaceId, name),
  );
  if (sandbox == null) return null;

  const isFailed = sandbox.status === "FAILED";
  const isTerminated =
    sandbox.status === "TERMINATED" || sandbox.status === "DELETING";
  const showConnectNow = !isTerminated;
  const showConnectionMethods = !isTerminated;

  return (
    <>
      {isFailed && <SandboxFailureCard sandbox={sandbox} />}
      <SandboxProvenanceBand sandbox={sandbox} />
      {showConnectNow && <SandboxConnectNow sandbox={sandbox} />}
      <SandboxVitalsStrip sandbox={sandbox} />
      {showConnectionMethods && <SandboxConnectionMethodsBand sandbox={sandbox} />}
      <SandboxEventsBand sandbox={sandbox} />
      <SandboxProcessLogBand sandbox={sandbox} />
      <SandboxStorageBand sandbox={sandbox} />
      <SandboxSecurityBand sandbox={sandbox} />
    </>
  );
}
