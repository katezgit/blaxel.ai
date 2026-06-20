import { redirect } from "next/navigation";

// /account/billing has no surface of its own — billing is split into Plan,
// Credits, and Add-ons. Land on Credits as the default since that's the
// payment-method + balance view that most outbound links target.
export default function BillingIndexRedirectPage() {
  redirect("/account/billing/credits");
}
