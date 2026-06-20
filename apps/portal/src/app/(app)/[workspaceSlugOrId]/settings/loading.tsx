import RouteSpinner from "@/components/shell/route-spinner";

// Colocated with the WorkspaceSettingsShell mount in settings/layout.tsx —
// same rationale as (resources)/loading.tsx: the Suspense fallback must live
// INSIDE the shell so cross-group transitions don't flash a blank spinner.
export default function Loading() {
  return <RouteSpinner />;
}
