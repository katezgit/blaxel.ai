"use client";

import {
  FileText,
  FolderTree,
  Hourglass,
  Infinity as InfinityIcon,
  Share2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/cn";

interface Capability {
  icon: LucideIcon;
  title: string;
  description: string;
}

const CAPABILITIES: ReadonlyArray<Capability> = [
  {
    icon: Share2,
    title: "Share and collaborate on files",
    description:
      "Concurrent read-write access from multiple sandboxes simultaneously.",
  },
  {
    icon: FolderTree,
    title: "Behaves like a shared cloud file system",
    description: "Mount as a path directly in the file tree of any sandbox.",
  },
  {
    icon: InfinityIcon,
    title: "Bottomless storage",
    description: "No pre-provisioning. Drives scale automatically.",
  },
];

const FILLOUT_URL = "https://blaxel.fillout.com/t/pbTXmanx3Sus";

interface AgentDrivePreviewViewProps {
  userEmail: string;
  userName: string;
  accountId: string;
}

export default function AgentDrivePreviewView({
  userEmail,
  userName,
  accountId,
}: AgentDrivePreviewViewProps) {
  const params = new URLSearchParams({
    email: userEmail,
    name: userName,
    accountId,
  });
  const waitlistHref = `${FILLOUT_URL}?${params.toString()}`;

  return (
    <div className={cn("page-shell", "min-h-full")}>
      <header className="page-header">
        <div className="flex items-center gap-2">
          <h1 className="typography-display font-semibold text-foreground">
            Agent Drive
          </h1>
          <Badge variant="neutral" size="sm">
            Private preview
          </Badge>
        </div>
        <p className="max-w-2xl typography-body text-muted-foreground">
          Share data, context and sessions across sandboxes and agents.
        </p>
      </header>

      <section
        aria-labelledby="agent-drive-preview-heading"
        className="flex flex-1 flex-col"
      >
        <h2 id="agent-drive-preview-heading" className="sr-only">
          Agent Drive — private preview
        </h2>

        <div aria-hidden="true" className="min-h-12 grow basis-0" />

        <div className="flex shrink-0 flex-col items-center gap-4 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-md bg-icon-tile text-muted-foreground"
          >
            <FileText className="size-6" />
          </span>
          <div className="flex flex-col items-center gap-1">
            <h3 className="typography-display text-foreground">
              Share data and context across sandboxes
            </h3>
            <p className="max-w-xl text-muted-foreground">
              Agent Drive is a modern, distributed filesystem allowing AI
              agents to collaborate by sharing data and session context in
              real-time.
            </p>
          </div>
        </div>

        <Card className="mt-6 w-full max-w-4xl shrink-0 self-center overflow-hidden border-0 p-0 lg:border">
          <div className="grid lg:grid-cols-[2fr_1fr]">
            <AgentDriveCapabilitiesPanel />
            <AgentDriveCtaPanel waitlistHref={waitlistHref} />
          </div>
        </Card>

        <div aria-hidden="true" className="grow-[1.618] basis-0" />
      </section>
    </div>
  );
}

function AgentDriveCapabilitiesPanel() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <h3 className="typography-subtitle font-semibold text-foreground">
          What you can do with Agent Drive
        </h3>
        <p className="typography-body text-muted-foreground">
          Agent Drive is a modern, distributed filesystem letting AI agents
          collaborate by sharing data and session context in real time.
        </p>
      </div>
      <ul className="flex flex-col gap-4">
        {CAPABILITIES.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-hover-surface text-muted-foreground"
            >
              <Icon className="size-4" />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="typography-body font-semibold text-foreground">
                {title}
              </p>
              <p className="typography-body text-muted-foreground">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface AgentDriveCtaPanelProps {
  waitlistHref: string;
}

function AgentDriveCtaPanel({ waitlistHref }: AgentDriveCtaPanelProps) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-t-surface border-border bg-primary-glow p-6 text-center lg:rounded-t-none lg:border-l lg:p-8">
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary"
      >
        <Hourglass className="size-5" />
      </span>
      <h3 className="typography-subtitle font-semibold text-foreground">
        Join the waitlist
      </h3>
      <p className="typography-body text-muted-foreground">
        Apply below for private preview access to our new flagship filesystem.
      </p>
      <Button asChild variant="primary" className="min-w-[180px]">
        <a href={waitlistHref} target="_blank" rel="noopener noreferrer">
          Get access
        </a>
      </Button>
    </div>
  );
}
