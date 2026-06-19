import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account · Invoices",
};

export default function InvoicesPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Invoices</h1>
        <p className="text-muted-foreground">
          Invoice history, download PDF. Page coming soon.
        </p>
      </header>
    </div>
  );
}
