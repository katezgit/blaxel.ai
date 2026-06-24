"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui";

interface ResourceNotFoundProps {
  resourceLabel: string;
  resourceTypeSlug: string;
  id: string;
  supportingLine: string;
  listHref: string;
  listLabel: string;
}

export default function ResourceNotFound({
  resourceLabel,
  resourceTypeSlug,
  id,
  supportingLine,
  listHref,
  listLabel,
}: ResourceNotFoundProps) {
  const router = useRouter();
  const diagnostic = `${resourceTypeSlug}/${id}`;

  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <div className="flex w-full max-w-(--inline-empty-column-w) flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center rounded-md border border-border bg-muted-surface px-3 py-1.5 font-mono typography-label font-medium text-muted-foreground">
          not_found
        </span>

        <h2 className="typography-subtitle font-semibold text-foreground tracking-(--typography-subtitle--letter-spacing)">
          {resourceLabel} not found
        </h2>

        <div className="flex flex-col gap-1">
          <p className="line-clamp-2 font-mono typography-body text-muted-foreground">
            {diagnostic}
          </p>
          <p className="line-clamp-3 typography-body text-muted-foreground">
            {supportingLine}
          </p>
        </div>

        <div className="flex flex-row gap-2">
          <Button asChild variant="primary">
            <Link href={listHref}>{listLabel}</Link>
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
