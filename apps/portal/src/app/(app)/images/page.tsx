import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Images",
};

export default function ImagesPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Images</h1>
        <p className="text-muted-foreground">Placeholder.</p>
      </header>
    </div>
  );
}
