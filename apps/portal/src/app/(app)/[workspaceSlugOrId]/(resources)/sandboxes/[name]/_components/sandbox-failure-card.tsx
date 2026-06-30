import { AlertTriangle } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import type { Sandbox } from "@/lib/mock/sandboxes";

interface SandboxFailureCardProps {
  sandbox: Sandbox;
}

/** §2.3 inline failure card — sits directly under the identity header for
 * `status === "FAILED"` rows. Cause first, evidence next, one-verb
 * recovery. No apology copy. */
export default function SandboxFailureCard({ sandbox }: SandboxFailureCardProps) {
  const { spec, failureReason } = sandbox;
  const imageRef = `${spec.image.name}@${spec.image.sha.slice(0, 6)}`;
  return (
    <section
      role="alert"
      aria-label="Sandbox failure"
      className="flex flex-col gap-3 rounded-md border border-state-errored-subtle bg-state-errored-subtle px-4 py-4"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-state-errored-text"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="typography-subtitle font-semibold text-state-errored-text">
            Image pull failed
          </h2>
          <p className="typography-body text-foreground">
            <span className="font-mono">{imageRef}</span>{" "}
            {failureReason ?? "could not be pulled from the registry."}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-6">
        <Button type="button" variant="primary">
          Retry
        </Button>
        <Button type="button" variant="ghost">
          Pick another Image
        </Button>
      </div>
    </section>
  );
}
