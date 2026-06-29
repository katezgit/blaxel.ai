import Link from "next/link";
import { SearchX } from "lucide-react";
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
  const diagnostic = `${resourceTypeSlug}/${id}`;

  return (
    <div className="flex min-h-full w-full items-start justify-center px-6 pt-[16vh] pb-12">
      <div className="flex w-full max-w-(--inline-empty-column-w) flex-col items-center gap-4 text-center">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-icon-tile text-muted-foreground">
          <SearchX aria-hidden="true" className="size-6" />
        </div>

        <h1 className="typography-display font-semibold text-foreground">
          {resourceLabel} not found
        </h1>

        <div className="flex flex-col gap-1">
          <p className="line-clamp-2 typography-code text-muted-foreground">
            {diagnostic}
          </p>
          <p className="line-clamp-3 text-muted-foreground">
            {supportingLine}
          </p>
        </div>

        <Button asChild variant="secondary">
          <Link href={listHref}>{listLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
