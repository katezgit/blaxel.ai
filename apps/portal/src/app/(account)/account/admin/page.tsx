import { redirect } from "next/navigation";

// Legacy route preserved for backward compatibility with bookmarks and any
// outbound links that still point at /account/admin. The overview now lives
// at the section root /account; "admin" is reserved for admin/member
// management surfaces (e.g. /account/admins).
export default function LegacyAdminRedirectPage() {
  redirect("/account");
}
