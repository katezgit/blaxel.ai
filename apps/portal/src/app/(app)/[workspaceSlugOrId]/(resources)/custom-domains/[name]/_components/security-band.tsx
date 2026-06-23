import type { CustomDomain } from "@/lib/mock/custom-domains";
import { formatAbsoluteUtc } from "../../_lib/relative-time";
import { Band } from "./band";

interface SecurityBandProps {
  domain: CustomDomain;
}

export function SecurityBand({ domain }: SecurityBandProps) {
  const { metadata } = domain;
  const labels = Object.entries(metadata.labels);

  return (
    <Band title="Security">
      <dl className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-3 items-baseline">
        <dt className="typography-label text-muted-foreground">Registered by</dt>
        <dd className="typography-label text-foreground">{metadata.createdBy}</dd>

        <dt className="typography-label text-muted-foreground">Registered at</dt>
        <dd className="font-mono typography-label text-foreground">
          {formatAbsoluteUtc(metadata.createdAt)}
        </dd>

        <dt className="typography-label text-muted-foreground">Last updated by</dt>
        <dd className="typography-label text-foreground">{metadata.updatedBy}</dd>

        <dt className="typography-label text-muted-foreground">Last updated at</dt>
        <dd className="font-mono typography-label text-foreground">
          {formatAbsoluteUtc(metadata.updatedAt)}
        </dd>

        <dt className="typography-label text-muted-foreground">Labels</dt>
        <dd>
          {labels.length === 0 ? (
            <span className="typography-label text-muted-foreground">No labels.</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {labels.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center rounded-sm bg-muted-surface px-2 py-0.5 font-mono typography-meta text-muted-foreground"
                >
                  {key}:{value}
                </span>
              ))}
            </div>
          )}
        </dd>
      </dl>
    </Band>
  );
}
