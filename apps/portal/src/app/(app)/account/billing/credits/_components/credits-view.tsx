"use client";

import CreditsViewInner from "./credits-view-inner";

export default function CreditsView() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">
          Credits
        </h1>
        <p className="text-muted-foreground">
          Manage your account credit balance and automatic top-ups.
        </p>
      </header>

      <CreditsViewInner />
    </div>
  );
}
