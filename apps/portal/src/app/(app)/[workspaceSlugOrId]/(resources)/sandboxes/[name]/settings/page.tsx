import type { Metadata } from "next";
import SandboxSettingsView from "../_components/sandbox-settings-view";

export const metadata: Metadata = {
  title: "Sandbox settings",
};

// The sandbox query is prefetched in the parent layout and dehydrated into
// the shared HydrationBoundary; the Settings view reads from the populated
// cache plus a Settings-only fixture overlay. Loading / error / not-found
// shells live in `[name]/layout.tsx`.
export default function SandboxSettingsPage() {
  return <SandboxSettingsView />;
}
