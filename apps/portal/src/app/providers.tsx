"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@repo/ui/components/toast";
import { RouteDirectionTagger } from "@/components/shell/route-direction-tagger";
import { getQueryClient } from "@/lib/query/get-query-client";
import { AccountStateProvider } from "@/lib/mock/account-context";

// next-themes is wired with `attribute="data-theme"` because token themes key off
// [data-theme="dark"]. The provider lives in a client component so the
// FOUC-prevention <script> next-themes injects is owned by a client boundary
// (React 19 + Next 16 warn when server components render it).
export default function Providers({ children }: { children: React.ReactNode }) {
  // getQueryClient() owns the browser-singleton guard via `isServer`; no
  // useState wrapper needed — wrapping it would defeat the dedupe.
  const queryClient = getQueryClient();
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AccountStateProvider>
          <RouteDirectionTagger />
          {children}
          <Toaster />
        </AccountStateProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
