import RouteSpinner from "@/components/shell/route-spinner";

// Colocated with the WorkspaceShell mount in (resources)/layout.tsx. Placing
// the Suspense fallback ABOVE the shell (e.g. at (app)/loading.tsx) makes the
// shell unmount and flash a blank spinner on cross-group navigation from
// (account)/* into (app)/*. Inside the shell, it only fires for intra-app
// page transitions and renders within the existing chrome.
export default function Loading() {
  return <RouteSpinner />;
}
