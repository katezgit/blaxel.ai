"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchX } from "lucide-react";
import { Button } from "@repo/ui";

type Section =
  | { kind: "profile" }
  | { kind: "account" }
  | { kind: "billing" }
  | { kind: "settings"; workspaceSlugOrId: string };

type SectionCopy = {
  headline: string;
  primaryHref: string;
  primaryLabel: string;
};

function resolveSection(section: Section): SectionCopy {
  switch (section.kind) {
    case "profile":
      return {
        headline: "Page not found",
        primaryHref: "/profile",
        primaryLabel: "Go to Profile",
      };
    case "account":
      return {
        headline: "Page not found",
        primaryHref: "/account",
        primaryLabel: "Go to Account",
      };
    case "billing":
      return {
        headline: "Page not found",
        primaryHref: "/account/billing",
        primaryLabel: "Go to Plan & billing",
      };
    case "settings":
      return {
        headline: "Page not found",
        primaryHref: `/${section.workspaceSlugOrId}/settings/general`,
        primaryLabel: "Go to Settings",
      };
  }
}

export default function InShellNotFound(props: Section) {
  const pathname = usePathname();
  const diagnostic =
    pathname.length > 80 ? `${pathname.slice(0, 80)}…` : pathname;
  const { headline, primaryHref, primaryLabel } = resolveSection(props);

  return (
    <div className="flex min-h-full w-full items-start justify-center px-6 pt-[16vh] pb-12">
      <div className="flex w-full max-w-(--inline-empty-column-w) flex-col items-center gap-4 text-center">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-icon-tile text-muted-foreground">
          <SearchX aria-hidden="true" className="size-6" />
        </div>

        <h1 className="typography-display font-semibold text-foreground">
          {headline}
        </h1>

        <div className="flex flex-col gap-1">
          <p className="line-clamp-2 typography-code text-muted-foreground">
            {diagnostic}
          </p>
          <p className="line-clamp-3 text-muted-foreground">
            This section doesn&apos;t have a page at this URL.
          </p>
        </div>

        <Button asChild variant="secondary">
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
