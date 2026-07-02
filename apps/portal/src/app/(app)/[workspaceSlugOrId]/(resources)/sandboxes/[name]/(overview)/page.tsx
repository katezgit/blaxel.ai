import type { Metadata } from "next";
import SandboxOverviewBands from "../_components/sandbox-overview-bands";

export const metadata: Metadata = {
  title: "Sandbox",
};

// Header (§1.1) + tab strip live in `layout.tsx`. This page renders only the
// Tier 1 + Tier 2 bands. The sandbox query is prefetched in the layout and
// dehydrated into the shared HydrationBoundary, so the overview bands client
// reads from the populated cache without re-fetching.
export default function SandboxOverviewPage() {
  return <SandboxOverviewBands />;
}
