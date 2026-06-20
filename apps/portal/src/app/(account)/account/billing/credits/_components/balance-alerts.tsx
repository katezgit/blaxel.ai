import { TriangleAlert } from "lucide-react";
import { Panel } from "@/app/(manage)/_components/page-primitives";

const THRESHOLDS = [5, 10, 20, 50, 100, 500, 1000];

export default function BalanceAlerts() {
  return (
    <Panel
      title="Balance alerts"
      subtitle="Receive an email notification when your credit balance drops below these thresholds."
    >
      <div className="flex flex-col gap-4">
        <p className="text-caption text-muted-foreground">
          Sent to the account Owner + all account Admins. Not configurable
          per-user &mdash; this is an account-level operational alert, not a
          personal subscription. To manage your personal email subscriptions, go
          to Profile &rarr; Notifications.
        </p>

        <div className="flex items-start gap-2 rounded-md border border-state-warning-subtle bg-state-warning-subtle px-3 py-2 text-state-warning-text">
          <TriangleAlert
            className="mt-0.5 size-4"
            aria-hidden="true"
          />
          <p className="text-caption">
            Alert configuration is coming soon. You will currently receive
            automatic alerts at these thresholds:
          </p>
        </div>

        <ul className="flex flex-col gap-1.5">
          {THRESHOLDS.map((threshold) => (
            <li
              key={threshold}
              className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2"
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-state-running"
              />
              <span className="text-body text-foreground">
                Alert at{" "}
                <span className="font-mono tabular-nums">
                  {threshold.toLocaleString()}
                </span>{" "}
                credits
              </span>
            </li>
          ))}
        </ul>

        <p className="text-caption text-meta-foreground">
          Toggles are read-only until configuration ships.
        </p>
      </div>
    </Panel>
  );
}
