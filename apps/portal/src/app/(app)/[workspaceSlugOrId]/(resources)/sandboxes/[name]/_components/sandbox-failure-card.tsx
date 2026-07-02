import { AlertTriangle } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import type { Sandbox } from "@/lib/mock/sandboxes";
import { formatRelative, imageWithShaLabel } from "./format-helpers";

interface SandboxFailureCardProps {
  sandbox: Sandbox;
}

/** §2.3 inline failure card — sits directly under the identity header for
 * `status === "FAILED"` rows. Phase 5 voice: cause, evidence, context,
 * recovery. */
export default function SandboxFailureCard({ sandbox }: SandboxFailureCardProps) {
  const { spec, failure } = sandbox;
  if (failure === undefined) return null;
  const imageRef = imageWithShaLabel(spec.image);
  const lastSuccessRef = imageWithShaLabel(failure.lastSuccessfulPull.image);
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
            {failure.cause}
          </h2>
          <p className="typography-body text-foreground">
            <span className="font-mono">{imageRef}</span> returned{" "}
            {failure.httpStatus} from the registry.
          </p>
          <p className="typography-body text-foreground">
            Last successful pull:{" "}
            <span className="font-mono">{lastSuccessRef}</span> (
            {formatRelative(failure.lastSuccessfulPull.occurredAt)}).
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
