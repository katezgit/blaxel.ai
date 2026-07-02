import type { Sandbox } from "@/lib/mock/sandboxes";
import type { SandboxLifecyclePolicy } from "@/lib/mock/sandbox-settings-fixtures";
import BandFrame from "./band-frame";
import { SandboxTtlControl } from "./sandbox-ttl-control";

interface SandboxSettingsLifecycleProps {
  sandbox: Sandbox;
  lifecyclePolicies: ReadonlyArray<SandboxLifecyclePolicy>;
  terminationAt: string | null;
}

const LOCAL_FMT = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatLocal(iso: string | null): string {
  if (iso === null) return "—";
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return iso;
  return LOCAL_FMT.format(new Date(ts));
}

/** Settings → Lifecycle sub-section per wireframe §3 — TTL Extension popover
 *  (reusing the Tier-1 `SandboxTtlControl`), Lifecycle policies (read-only
 *  list from fixture; "—" empty), Date of termination (absolute local
 *  time). */
export default function SandboxSettingsLifecycle({
  sandbox,
  lifecyclePolicies,
  terminationAt,
}: SandboxSettingsLifecycleProps) {
  return (
    <BandFrame label="Lifecycle" className="border-t-0 pt-0">
      <div className="flex flex-col gap-6">
        <LifecycleSubsection label="TTL extension">
          <SandboxTtlControl sandbox={sandbox} />
        </LifecycleSubsection>
        <LifecycleSubsection label="Lifecycle policies">
          {lifecyclePolicies.length === 0 ? (
            <p className="typography-body text-meta-foreground">—</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {lifecyclePolicies.map((policy) => (
                <li
                  key={policy.name}
                  className="flex flex-col gap-0.5"
                >
                  <span className="typography-body text-foreground">
                    {policy.name}
                  </span>
                  <span className="typography-meta text-meta-foreground">
                    {policy.description}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </LifecycleSubsection>
        <LifecycleSubsection label="Date of termination">
          <span
            title={terminationAt ?? undefined}
            className="font-mono typography-body text-foreground"
          >
            {formatLocal(terminationAt)}
          </span>
        </LifecycleSubsection>
      </div>
    </BandFrame>
  );
}

function LifecycleSubsection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="typography-meta text-meta-foreground">{label}</h3>
      {children}
    </div>
  );
}
