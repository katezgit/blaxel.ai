import path from "node:path";
import type { NextConfig } from "next";

// turbopack.root pins workspace inference to this monorepo. Without it Next 16
// walks up the FS looking for a lockfile and may pick a stray ~/yarn.lock,
// emitting a warning during build.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  transpilePackages: ["@repo/ui", "@repo/libs"],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  // Pre-render redirect emits a real HTTP 307. Doing the same redirect from a
  // Server Component via redirect() in a streaming context only writes a
  // <meta http-equiv="refresh"> with a 1-second delay (per Next.js docs), which
  // surfaces as a flicker — especially when navigating back from global-not-found.
  // When real auth lands the destination must come from the session, at which
  // point this moves to a proxy. Hardcoded slug mirrors mock/data.ts → currentOrg.
  async redirects() {
    return [
      {
        source: "/",
        destination: "/webflow-prod/sandboxes",
        permanent: false,
      },
    ];
  },
  experimental: {
    // Wraps client-side route changes in document.startViewTransition() so the
    // app↔manage sidebar swap can choreograph via ::view-transition-* CSS.
    // Choreography lives in app/globals.css; direction is tagged on <html>
    // by RouteDirectionTagger in the root layout.
    viewTransition: true,
  },
};

export default nextConfig;
