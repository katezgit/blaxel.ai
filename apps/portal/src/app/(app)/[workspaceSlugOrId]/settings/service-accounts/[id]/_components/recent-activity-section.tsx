export default function RecentActivitySection() {
  return (
    <section
      aria-labelledby="sa-activity-heading"
      className="flex flex-col gap-3"
    >
      <h2
        id="sa-activity-heading"
        className="typography-subtitle font-semibold text-foreground"
      >
        Recent activity
      </h2>
      <p className="typography-body text-muted-foreground">
        Activity history will appear here once available. Per-credential call
        history is a forward backend ask.
      </p>
    </section>
  );
}
