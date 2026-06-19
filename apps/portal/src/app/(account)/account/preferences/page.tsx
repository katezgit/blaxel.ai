import type { Metadata } from "next";
import { ThemePreferenceField } from "./_components/theme-preference-field";

export const metadata: Metadata = {
  title: "Account · Preferences",
};

export default function PreferencesPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Preferences</h1>
        <p className="text-muted-foreground">
          Density, locale, notification rules, default theme.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-subtitle font-semibold text-foreground">Theme</h2>
        <ThemePreferenceField />
      </section>
    </div>
  );
}
