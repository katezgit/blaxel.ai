import type { Metadata } from "next";
import { seedForTier } from "@/lib/mock/account";
import AddOnRow from "./_components/addon-row";

export const metadata: Metadata = {
  title: "Premium services",
};

// Add-ons are tier-invariant in the mock (same template across every seed), so
// the page renders fully on the server from the tier-0 seed. The dev tier
// switcher does not affect this list.
export default function AddOnsPage() {
  const addons = seedForTier(0).addons;

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">Premium services</h1>
        <p className="text-muted-foreground">
          Optional paid services for support, compliance, and account-level
          assistance.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {addons.map((addon) => (
          <AddOnRow key={addon.id} addon={addon} />
        ))}
      </div>
    </div>
  );
}
