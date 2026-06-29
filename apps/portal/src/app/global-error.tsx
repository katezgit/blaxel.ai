"use client";

// https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error

import { useEffect } from "react";
import { Button } from "@repo/ui";
import "./globals.css";

function diagnosticFor(error: Error & { digest?: string }): string | null {
  const raw = error.message?.trim() || error.name?.trim() || "";
  if (!raw) return null;
  return raw.length > 120 ? `${raw.slice(0, 120)}…` : raw;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const diagnostic = diagnosticFor(error);
  const digest = error.digest;
  const hasDiagnosticBlock = diagnostic !== null || Boolean(digest);

  return (
    // global-error renders outside the ThemeProvider, so next-themes never
    // writes `data-theme`. The inline script below resolves the same localStorage
    // key (`theme`) next-themes uses and sets data-theme + color-scheme before
    // first paint — mirroring next-themes' FOUC-prevention script. defaultTheme
    // (`dark`) matches providers.tsx.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var r;if(t==='light'||t==='dark')r=t;else if(t==='system')r=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';else r='dark';var h=document.documentElement;h.setAttribute('data-theme',r);h.style.colorScheme=r;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background">
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="flex max-w-(--not-found-column-w) flex-col items-center gap-4 px-6 text-center">
            <span className="inline-flex items-center rounded-md border border-border bg-muted-surface px-3 py-1.5 font-mono typography-label font-medium text-muted-foreground">
              FATAL
            </span>

            <h1 className="typography-subtitle font-semibold text-foreground">
              Platform failed to initialize
            </h1>

            {hasDiagnosticBlock && (
              <div className="flex max-w-(--not-found-text-w) flex-col gap-1">
                {diagnostic &&(
                  <p className="line-clamp-2 font-mono typography-code text-muted-foreground">
                    {diagnostic}
                  </p>
                )}
                {digest && (
                  <p className="font-mono typography-code text-muted-foreground/60">
                    digest: {digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-row gap-2">
              <Button type="button" variant="primary" onClick={reset}>
                Reload page
              </Button>
              <Button asChild variant="ghost">
                <a href="mailto:support@example.com?subject=Platform%20failed%20to%20initialize">
                  Contact us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
