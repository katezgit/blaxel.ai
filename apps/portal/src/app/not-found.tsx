"use client";

// Root-level 404 — catches URLs that fall through to root (no route match at all,
// or a layout-level notFound() that escapes past the (app)/(manage) boundaries
// like a workspace slug that doesn't resolve). Renders inside the root layout's
// ThemeProvider but WITHOUT AppShell — appropriate for pre-auth or
// no-workspace-context states.

import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@repo/ui";

export default function RootNotFound() {
  return (
    <div className="flex min-h-full w-full items-start justify-center px-6 pt-[16vh] pb-12">
      <div className="flex w-full max-w-(--inline-empty-column-w) flex-col items-center gap-4 text-center">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-icon-tile text-muted-foreground">
          <SearchX aria-hidden="true" className="size-6" />
        </div>

        <h1 className="typography-display font-semibold text-foreground">
          Page not found
        </h1>

        <p className="text-muted-foreground">
          We couldn&apos;t find that page.
        </p>

        <Button asChild variant="secondary">
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
