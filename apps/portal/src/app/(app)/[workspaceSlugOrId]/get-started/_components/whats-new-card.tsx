import type { ReactNode } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";

type ChangelogEntry = {
  title: string;
  date: string;
  body: ReactNode;
};

const ENTRIES: ChangelogEntry[] = [
  {
    title: "Clear sandbox TTL and lifecycle policies",
    date: "2026-06-19",
    body: (
      <>
        The SDKs can now clear a sandbox&apos;s expiration rules without
        recreating it. Pass null/None (or an empty string for the TTL) to
        updateTtl and updateLifecycle to make a sandbox persist again. See{" "}
        <a href="#" className="text-primary underline">
          Clear sandbox expiry rules
        </a>
        .
      </>
    ),
  },
  {
    title: "Refreshed Billing Explorer experience",
    date: "2026-06-13",
    body: (
      <>
        The Billing Explorer is now available in the Blaxel Console with a
        refreshed UI and exhaustive filters and cost breakdowns.
      </>
    ),
  },
  {
    title: "Self-host Claude Managed Agents on Blaxel",
    date: "2026-06-11",
    body: (
      <>
        Blaxel now integrates with{" "}
        <a href="#" className="text-primary underline">
          Claude Managed Agents (CMA)
        </a>
        , allowing you to self-host the sandbox execution layer while keeping
        the agent loop entirely within Anthropic&apos;s platform. Every tool
        call an agent makes in a CMA session runs inside a Blaxel sandbox:
        command execution, file operations, and code execution happen in fully
        isolated environments. See the{" "}
        <a href="#" className="text-primary underline">
          tutorial
        </a>{" "}
        for a step-by-step walkthrough.
      </>
    ),
  },
];

export default function WhatsNewCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="typography-subtitle font-medium text-foreground">
            What&apos;s new
          </h2>
          <a
            href="https://docs.blaxel.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="typography-caption text-muted-foreground transition-colors hover:text-foreground"
          >
            Full changelog <span aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="typography-caption text-muted-foreground">
          Stay up to date with our latest features and improvements
        </p>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <ul className="divide-y divide-border">
          {ENTRIES.map(({ title, date, body }) => (
            <li key={title} className="flex flex-col gap-2 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="typography-body font-medium text-foreground">
                  {title}
                </h3>
                <span className="inline-flex shrink-0 items-center gap-1 font-mono typography-meta text-muted-foreground">
                  <Calendar aria-hidden="true" className="size-3" />
                  {date}
                </span>
              </div>
              <p className="typography-caption text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
