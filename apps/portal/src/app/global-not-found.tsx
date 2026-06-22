// https://nextjs.org/docs/app/api-reference/file-conventions/not-found#global-not-found
// Renders outside the root layout — must define its own <html> and <body>.

import { cookies } from "next/headers";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  Home,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@repo/ui";
import { getSession } from "@/lib/auth/session";
import { findWorkspaceMembership } from "@/lib/mock/org";
import { LAST_WORKSPACE_COOKIE } from "@/lib/workspace/last-visited";
import "./globals.css";

// Recovery anchors are plain <a> on purpose. Per Next.js docs, global-not-found
// "skips rendering and directly returns this global page" — it sits outside the
// client router tree, so <Link> soft navigation from inside leaves the 404 DOM
// mounted even though the URL flips. Hard navigation hits proxy.ts which emits
// a real HTTP 307 to the user's last-visited workspace, so no meta-refresh. The
// "Go back home" button uses <Link> because proxy.ts intercepts `/` at the
// matcher level regardless of soft vs hard navigation.
//
// Resolution is gated on an authenticated session: an unauthenticated visitor
// must not be able to probe workspace existence by reading the recovery links.
// Without a session, popular-page links are suppressed entirely.
async function resolveTargetWorkspaceSlug(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  const store = await cookies();
  const raw = store.get(LAST_WORKSPACE_COOKIE)?.value;
  if (raw && findWorkspaceMembership(raw)) return raw;
  return null;
}

export default async function GlobalNotFound() {
  const workspaceSlug = await resolveTargetWorkspaceSlug();
  const workspaceHref = workspaceSlug
    ? (segment: string) => `/${workspaceSlug}/${segment}`
    : null;
  return (
    // `data-theme="light"` pins the light palette without ThemeProvider.
    // The `<style>` below opts users with prefers-color-scheme: dark into the dark palette.
    <html lang="en" data-theme="light">
      <head>
        <title>404 - Not Found</title>
        <style>{`@media (prefers-color-scheme: dark) { html { color-scheme: dark; } }`}</style>
      </head>
      <body className="min-h-screen bg-background">
        <div className="flex min-h-screen w-full items-center justify-center px-6 py-12">
          <div className="flex w-full max-w-[640px] flex-col items-center gap-8 text-center">
            <TriangleAlert
              aria-hidden="true"
              className="size-16 text-orange-500"
              strokeWidth={1.5}
            />

            <div className="flex flex-col items-center gap-3">
              <span className="typography-display font-bold tracking-tight text-foreground">
                404
              </span>
              <h1 className="text-title font-semibold text-foreground">
                Page not found
              </h1>
              <p className="max-w-[480px] typography-body text-muted-foreground">
                We couldn&apos;t find that page.
              </p>
            </div>

            <div className="flex flex-row items-center gap-3">
              <Button asChild variant="secondary">
                <Link href="/">
                  <Home />
                  Go back home
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <a href="mailto:support@example.com?subject=Page%20not%20found">
                  Get help
                  <ArrowRightIcon />
                </a>
              </Button>
            </div>

            <div className="h-px w-full bg-border" />

            <div className="flex flex-col items-center gap-4">
              <p className="typography-body text-muted-foreground">
                {workspaceHref
                  ? "Or explore these popular pages:"
                  : "Or read the docs:"}
              </p>
              <nav
                aria-label="Recovery navigation"
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
              >
                {workspaceHref ? (
                  <>
                    <a
                      href={workspaceHref("sandboxes")}
                      className="typography-body text-muted-foreground hover:text-foreground hover:underline transition-colors"
                    >
                      Sandboxes
                    </a>
                    <a
                      href={workspaceHref("agents")}
                      className="typography-body text-muted-foreground hover:text-foreground hover:underline transition-colors"
                    >
                      Agents
                    </a>
                    <a
                      href={workspaceHref("settings/api-keys")}
                      className="typography-body text-muted-foreground hover:text-foreground hover:underline transition-colors"
                    >
                      API Keys
                    </a>
                  </>
                ) : null}
                <a
                  href="https://docs.blaxel.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Documentation, opens in new tab"
                  className="inline-flex items-baseline gap-0.5 typography-body text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  Docs
                  <ArrowUpRightIcon
                    aria-hidden="true"
                    className="size-3 self-center"
                  />
                </a>
              </nav>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
