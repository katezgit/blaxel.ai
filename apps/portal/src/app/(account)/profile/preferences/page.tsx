import type { Metadata } from "next";
import { PreferencesClient } from "./_components/preferences-client";

export const metadata: Metadata = {
  title: "Preferences",
};

export default function PreferencesPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Preferences</h1>
        <p className="text-muted-foreground">
          Email, marketing, and privacy choices. These apply to every workspace you belong to.
        </p>
      </header>

      <PreferencesClient />
    </div>
  );
}
