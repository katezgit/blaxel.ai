interface TabStubPlaceholderProps {
  label: string;
}

/** Scaffold stub for tab routes whose content lands in Phase 3 Step 2.
 * Single muted line, centered in the band area below the tab strip. */
export default function TabStubPlaceholder({ label }: TabStubPlaceholderProps) {
  return (
    <section
      aria-label={`${label} placeholder`}
      className="flex min-h-64 items-center justify-center border-t border-border pt-6"
    >
      <p className="typography-body text-meta-foreground">
        {label} — coming next
      </p>
    </section>
  );
}
