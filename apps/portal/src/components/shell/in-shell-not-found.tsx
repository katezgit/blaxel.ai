"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
        headline: "Profile page not found",
        primaryHref: "/profile",
        primaryLabel: "Go to Profile",
      };
    case "account":
      return {
        headline: "Account page not found",
        primaryHref: "/account",
        primaryLabel: "Go to Account",
      };
    case "billing":
      return {
        headline: "Billing page not found",
        primaryHref: "/account/billing",
        primaryLabel: "Go to Plan & billing",
      };
    case "settings":
      return {
        headline: "Settings page not found",
        primaryHref: `/${section.workspaceSlugOrId}/settings/general`,
        primaryLabel: "Go to Settings",
      };
  }
}

export default function InShellNotFound(props: Section) {
  const router = useRouter();
  const pathname = usePathname();
  const diagnostic =
    pathname.length > 80 ? `${pathname.slice(0, 80)}…` : pathname;
  const { headline, primaryHref, primaryLabel } = resolveSection(props);

  return (
    <div className="flex min-h-full w-full items-center justify-center py-12">
      <div className="flex max-w-(--not-found-column-w) flex-col items-center gap-4 px-6 text-center">
        <span className="inline-flex items-center rounded-md border border-border bg-muted-surface px-3 py-1.5 font-mono typography-label font-medium text-muted-foreground">
          404
        </span>

        <h1 className="typography-subtitle font-semibold text-foreground tracking-(--typography-subtitle--letter-spacing)">
          {headline}
        </h1>

        <div className="max-w-(--not-found-text-w)">
          <p className="line-clamp-2 font-mono typography-body text-muted-foreground">
            {diagnostic}
          </p>
          <p className="line-clamp-3 typography-body text-muted-foreground">
            This section doesn&apos;t have a page at this URL.
          </p>
        </div>

        <div className="flex flex-row gap-2">
          <Button asChild variant="primary">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
