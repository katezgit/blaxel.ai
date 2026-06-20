"use client";

import { useAccountState } from "@/lib/mock/account-context";
import AddOnRow from "./addon-row";

export function AddOnsView() {
  const { state } = useAccountState();

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Add-ons</h1>
        <p className="text-muted-foreground">
          Paid capabilities you can attach to your account, billed separately
          from credit usage.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {state.addons.map((addon) => (
          <AddOnRow key={addon.id} addon={addon} />
        ))}
      </div>
    </div>
  );
}
