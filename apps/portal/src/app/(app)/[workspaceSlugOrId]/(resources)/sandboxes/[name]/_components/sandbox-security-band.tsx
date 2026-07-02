import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { CopyButton } from "@repo/ui/components/copy-button";
import { cn } from "@repo/ui/lib/cn";
import type {
  Sandbox,
  SandboxAttachedApiKey,
  SandboxAttachedPolicy,
} from "@/lib/mock/sandboxes";
import BandFrame from "./band-frame";
import { formatRelative } from "./format-helpers";

interface SandboxSecurityBandProps {
  sandbox: Sandbox;
}

/** §1.9 Security band — Policy sub-card + API key sub-card. Peer scroll
 *  section, never a tab (Sacrificial choice #3 in personality.md). When a
 *  Policy denied a call against this Sandbox inside the active window, the
 *  Policy sub-card flips to `state-warning-subtle` and surfaces the denied
 *  call inline. Empty Policy → quiet caption naming workspace default. */
export default function SandboxSecurityBand({ sandbox }: SandboxSecurityBandProps) {
  return (
    <BandFrame label="Security">
      <div className="flex flex-col gap-6">
        <SecuritySubsection label="Policy">
          <PolicyCard policy={sandbox.attachedPolicy} />
        </SecuritySubsection>
        <SecuritySubsection label="API key">
          <ApiKeyCard apiKey={sandbox.attachedApiKey} />
        </SecuritySubsection>
      </div>
    </BandFrame>
  );
}

interface SecuritySubsectionProps {
  label: string;
  children: React.ReactNode;
}

function SecuritySubsection({ label, children }: SecuritySubsectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="typography-meta text-meta-foreground">{label}</h3>
      {children}
    </div>
  );
}

function PolicyCard({ policy }: { policy: SandboxAttachedPolicy | null }) {
  if (policy === null) {
    return (
      <p className="typography-body text-meta-foreground">
        No Policy attached — workspace default applies.
      </p>
    );
  }
  const denied = policy.denial !== undefined;
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border border-border px-4 py-3",
        denied && "border-state-warning/40 bg-state-warning-subtle",
      )}
    >
      <div className="flex flex-wrap items-center gap-3 typography-body">
        <Link
          href={policy.href}
          className="font-mono font-medium text-foreground transition-colors hover:text-primary"
        >
          {policy.name}
        </Link>
        <ProvenanceArrow label="Policy" href={policy.href} />
      </div>
      <p className="typography-meta text-meta-foreground">
        Regions allowed: {policy.regionsAllowed.join(", ")} · Flavor:{" "}
        <span className="font-mono">{policy.flavor}</span> · Tokens allowed up
        to {policy.tokensPerHour}
      </p>
      {policy.denial && (
        <p className="typography-meta text-state-warning-text">
          Denied: {policy.denial.deniedCall}{" "}
          <Link
            href={policy.denial.resolutionHref}
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            View resolution
          </Link>
        </p>
      )}
    </div>
  );
}

function ApiKeyCard({ apiKey }: { apiKey: SandboxAttachedApiKey }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 typography-body">
        <span className="page-header-meta-group">
          <span className="font-mono font-medium text-foreground">
            {apiKey.prefix}
          </span>
          <CopyButton
            value={apiKey.prefix}
            ariaLabel={`Copy API key prefix ${apiKey.prefix}`}
          />
        </span>
        <ProvenanceArrow label="API key" href={apiKey.href} />
        <DotSeparator />
        <span className="typography-meta text-meta-foreground">
          {apiKey.recentCalls} calls in {apiKey.recentWindow}
        </span>
      </div>
      <p className="typography-meta text-meta-foreground" title={apiKey.spawnedAt}>
        Spawned this Sandbox {formatRelative(apiKey.spawnedAt)}
      </p>
    </div>
  );
}

function DotSeparator() {
  return (
    <span aria-hidden="true" className="text-meta-foreground">
      ·
    </span>
  );
}

function ProvenanceArrow({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 typography-meta text-meta-foreground transition-colors hover:text-foreground"
    >
      <ArrowUp aria-hidden="true" className="size-3.5" />
      {label}
    </Link>
  );
}
