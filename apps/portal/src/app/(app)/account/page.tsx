import { redirect } from "next/navigation";

// Account sub-shell has no Overview page — owner email + account ID surface
// on the sidebar identity chip; admins / workspaces / login policy each own
// their own page. Land users on Admins: it's the first sub-page and the most
// actionable identity surface (workspaces is read-only structure, login
// policy is tier-gated).
export default function AccountRootPage() {
  redirect("/account/admins");
}
