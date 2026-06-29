import { redirect } from "next/navigation";

// Plan & billing sub-shell has no Overview page — every section that lived
// there is now owned by a dedicated sub-page (tier, credits, invoices, usage).
// Land users on Credits: it's where Maya spends the most time (top-ups,
// balance, auto-top-up rules).
export default function BillingRootPage() {
  redirect("/account/billing/credits");
}
