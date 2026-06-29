import { redirect } from "next/navigation";

// Land users on Credits: it's where Maya spends the most time (top-ups,
// balance, auto-top-up rules), so it's the most useful default landing
// inside the Plan & billing sub-shell.
export default function BillingRootPage() {
  redirect("/account/billing/credits");
}
