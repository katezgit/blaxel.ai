import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policies",
};

export default function PoliciesPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Policies</h1>
        <p className="text-muted-foreground">Placeholder.</p>
      </header>
    </div>
  );
}
