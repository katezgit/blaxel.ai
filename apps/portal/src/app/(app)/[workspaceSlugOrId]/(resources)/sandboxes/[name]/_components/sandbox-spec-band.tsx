"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";
import type { Sandbox, SandboxEgressMode } from "@/lib/mock/sandboxes";
import {
  expiresInLabel,
  imageRefLabel,
  regionLabel,
} from "../../_components/row-helpers";
import BandFrame from "./band-frame";

interface SandboxSpecBandProps {
  sandbox: Sandbox;
  className?: string;
}

const EGRESS_LABEL: Record<SandboxEgressMode, string> = {
  shared: "Shared",
  dedicated: "Dedicated",
  private: "Private",
};

export default function SandboxSpecBand({
  sandbox,
  className,
}: SandboxSpecBandProps) {
  const { spec } = sandbox;
  const envs = spec.runtime.envs;
  const volumes = spec.volumes;
  const expirationPolicies = spec.lifecycle.expirationPolicies;
  return (
    <BandFrame label="Specification" className={className}>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[160px_1fr]">
        <SpecRow label="Image">
          <span className="font-mono typography-body text-foreground">
            {imageRefLabel(spec.image)}
          </span>
        </SpecRow>
        <SpecRow label="Region">
          <span className="font-mono typography-body text-foreground">
            {regionLabel(spec.region)}
          </span>
        </SpecRow>
        <SpecRow label="Memory">
          <span className="typography-body text-foreground">
            {formatMemory(spec.memoryMib)}
          </span>
        </SpecRow>
        <SpecRow label="TTL">
          <span className="typography-body text-foreground">
            {spec.ttl === "none" ? "No expiry" : spec.ttl}
          </span>
          {spec.expiresInSec !== null && (
            <span className="typography-body text-muted-foreground">
              {" "}
              · expires in {expiresInLabel(spec.expiresInSec)}
            </span>
          )}
        </SpecRow>
        <SpecRow label="Enabled">
          <span className="typography-body text-foreground">
            {spec.enabled ? "Yes" : "No"}
          </span>
        </SpecRow>
        <SpecRow label="Egress">
          <span className="typography-body text-foreground">
            {EGRESS_LABEL[spec.network.egressMode]}
          </span>
        </SpecRow>
        <SpecRow label="Expiration policies">
          {expirationPolicies.length === 0 ? (
            <span className="typography-body text-muted-foreground">None</span>
          ) : (
            <ul className="flex flex-col gap-1">
              {expirationPolicies.map((policy, idx) => (
                <li
                  key={`${policy.type}-${idx}`}
                  className="typography-body text-foreground"
                >
                  <span className="font-mono">{policy.type}</span>{" "}
                  <span className="text-muted-foreground">→</span>{" "}
                  <span>{policy.action} after </span>
                  <span className="font-mono">{policy.value}</span>
                </li>
              ))}
            </ul>
          )}
        </SpecRow>
        <SpecRow label="Volumes">
          {volumes.length === 0 ? (
            <span className="typography-body text-muted-foreground">None</span>
          ) : (
            <ul className="flex flex-col gap-1">
              {volumes.map((volume) => (
                <li
                  key={volume.name}
                  className="typography-body text-foreground"
                >
                  <span className="font-mono">{volume.mountPath}</span>{" "}
                  <span className="text-muted-foreground">
                    ({volume.name}
                    {volume.readOnly ? ", read-only" : ""})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SpecRow>
        <SpecRow label="Environment">
          {envs.length === 0 ? (
            <span className="typography-body text-muted-foreground">None</span>
          ) : (
            <ul className="flex flex-col gap-1">
              {envs.map((env) => (
                <li
                  key={env.name}
                  className="flex flex-wrap items-baseline gap-x-2 typography-body"
                >
                  <span className="font-mono text-foreground">{env.name}</span>
                  <span className="font-mono text-muted-foreground">
                    {env.secret ? "••••••••" : env.value}
                  </span>
                  {env.secret && (
                    <span className="typography-caption text-meta-foreground">
                      secret
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SpecRow>
      </dl>
    </BandFrame>
  );
}

interface SpecRowProps {
  label: string;
  children: ReactNode;
}

function SpecRow({ label, children }: SpecRowProps) {
  return (
    <>
      <dt className="typography-body font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("flex flex-wrap items-baseline gap-x-1")}>
        {children}
      </dd>
    </>
  );
}

function formatMemory(memoryMib: number): string {
  if (memoryMib >= 1024 && memoryMib % 1024 === 0) {
    return `${memoryMib / 1024} GiB`;
  }
  return `${memoryMib} MiB`;
}
