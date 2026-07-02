import { CopyButton } from "@repo/ui/components/copy-button";
import type { Sandbox } from "@/lib/mock/sandboxes";
import BandFrame from "./band-frame";
import { imageWithShaLabel, memoryLabel } from "./format-helpers";

interface SandboxSettingsDeploymentConfigProps {
  sandbox: Sandbox;
  deploymentId: string;
}

/** Settings → Deployment config sub-section per wireframe §3 — Image (with
 *  6-char SHA prefix), Memory, Ports (label pills), Region, Deployment ID
 *  UUID with CopyButton. All read-only — every mutation of these fields
 *  requires a re-deploy, so the surface intentionally has no edit
 *  affordance.  */
export default function SandboxSettingsDeploymentConfig({
  sandbox,
  deploymentId,
}: SandboxSettingsDeploymentConfigProps) {
  return (
    <BandFrame label="Deployment config">
      <dl className="flex flex-col gap-4">
        <ConfigRow label="Image">
          <span className="font-mono typography-body text-foreground">
            {imageWithShaLabel(sandbox.spec.image)}
          </span>
        </ConfigRow>
        <ConfigRow label="Memory">
          <span className="typography-body text-foreground">
            {memoryLabel(sandbox.spec.memoryMib)}
          </span>
        </ConfigRow>
        <ConfigRow label="Ports">
          <ul className="flex flex-wrap items-center gap-2">
            {sandbox.spec.ports.map((port) => (
              <li key={port.name}>
                <PortPill name={port.name} port={port.port} />
              </li>
            ))}
          </ul>
        </ConfigRow>
        <ConfigRow label="Region">
          <span className="font-mono typography-body text-foreground">
            {sandbox.spec.region}
          </span>
        </ConfigRow>
        <ConfigRow label="Deployment ID">
          <span className="inline-flex items-center gap-1">
            <span className="font-mono typography-body text-foreground">
              {deploymentId}
            </span>
            <CopyButton
              value={deploymentId}
              ariaLabel={`Copy deployment ID ${deploymentId}`}
            />
          </span>
        </ConfigRow>
      </dl>
    </BandFrame>
  );
}

function ConfigRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <dt className="typography-meta text-meta-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function PortPill({ name, port }: { name: string; port: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted-surface px-2 py-0.5 font-mono typography-meta text-foreground">
      <span className="text-meta-foreground">{name}</span>
      <span aria-hidden="true" className="text-meta-foreground">
        :
      </span>
      <span>{port}</span>
    </span>
  );
}
