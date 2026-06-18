// https://nextjs.org/docs/app/api-reference/file-conventions/not-found#global-not-found
// Renders outside the root layout — must define its own <html> and <body>.

import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  Home,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@repo/ui";
import "./globals.css";

export default function GlobalNotFound() {
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
              <span className="text-display font-bold tracking-tight text-foreground">
                404
              </span>
              <h1 className="text-title font-semibold text-foreground">
                Page not found
              </h1>
              <p className="max-w-[480px] text-body text-muted-foreground">
                Sorry, we couldn&apos;t find the page you&apos;re looking for.
                The page might have been moved, deleted, or you entered the
                wrong URL.
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
              <p className="text-body text-muted-foreground">
                Or explore these popular pages:
              </p>
              <nav
                aria-label="Recovery navigation"
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
              >
                <Link
                  href="/sandboxes"
                  className="text-body text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  Sandboxes
                </Link>
                <Link
                  href="/agents"
                  className="text-body text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  Agents
                </Link>
                <Link
                  href="/api-keys"
                  className="text-body text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  API Keys
                </Link>
                <a
                  href="https://docs.blaxel.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Documentation, opens in new tab"
                  className="inline-flex items-baseline gap-0.5 text-body text-muted-foreground hover:text-foreground hover:underline transition-colors"
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
