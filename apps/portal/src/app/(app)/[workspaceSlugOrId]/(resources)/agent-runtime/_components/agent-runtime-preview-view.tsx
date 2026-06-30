"use client";

import {
  Bot,
  Clock,
  Fingerprint,
  Layers,
  Plug,
  Sparkles,
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
    icon: Fingerprint,
    title: "Session-first, keyed by identity",
    description:
      "State and storage persist across restarts. Retrieve it with just a key.",
  },
  {
    icon: Clock,
    title: "No execution timeouts",
    description:
      "Agents are meant to run for hours and days, not 15 minutes. Scale to zero while waiting on external APIs.",
  },
  {
    icon: Layers,
    title: "Multi-agent primitives built in",
    description:
      "Atomic lock, borrow, and handover. Copy-on-write forks. Shared context drives.",
  },
  {
    icon: Plug,
    title: "Fully harness-agnostic",
    description: "Use whichever agentic framework or harness you want.",
  },
];

const FILLOUT_URL = "https://blaxel.fillout.com/t/pbTXmanx3Sus";

interface AgentRuntimePreviewViewProps {
  userEmail: string;
  userName: string;
  accountId: string;
}

export default function AgentRuntimePreviewView({
  userEmail,
  userName,
  accountId,
}: AgentRuntimePreviewViewProps) {
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
            Agent Runtime
          </h1>
          <Badge variant="neutral" size="sm">
            Soon!
          </Badge>
        </div>
        <p className="max-w-2xl typography-body text-muted-foreground">
          Run stateful, long-running agents as sessions.
        </p>
      </header>

      <section
        aria-labelledby="agent-runtime-preview-heading"
        className="flex flex-1 flex-col"
      >
        <h2 id="agent-runtime-preview-heading" className="sr-only">
          Agent Runtime — coming soon
        </h2>

        <div aria-hidden="true" className="min-h-12 grow basis-0" />

        <div className="flex shrink-0 flex-col items-center gap-4 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-md bg-icon-tile text-muted-foreground"
          >
            <Bot className="size-6" />
          </span>
          <div className="flex flex-col items-center gap-1">
            <h3 className="typography-display text-foreground">
              A runtime built for how agents actually behave
            </h3>
            <p className="max-w-xl text-muted-foreground">
              Agent Runtime is a session-first, fully stateful runtime for AI
              agents. Run for hours, and hand off cleanly between agents
              without writing a single line of state management.
            </p>
          </div>
        </div>

        <Card className="mt-6 w-full max-w-4xl shrink-0 self-center overflow-hidden border-0 p-0 lg:border">
          <div className="grid lg:grid-cols-[2fr_1fr]">
            <AgentRuntimeCapabilitiesPanel />
            <AgentRuntimeCtaPanel waitlistHref={waitlistHref} />
          </div>
        </Card>

        <div aria-hidden="true" className="grow-[1.618] basis-0" />
      </section>
    </div>
  );
}

function AgentRuntimeCapabilitiesPanel() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <h3 className="typography-subtitle font-semibold text-foreground">
          What you can do with Agent Runtime
        </h3>
        <p className="typography-body text-muted-foreground">
          A purpose-built runtime for stateful, long-running, multi-agent
          workloads.
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

interface AgentRuntimeCtaPanelProps {
  waitlistHref: string;
}

function AgentRuntimeCtaPanel({ waitlistHref }: AgentRuntimeCtaPanelProps) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-t-surface border-border bg-primary-glow p-6 text-center lg:rounded-t-none lg:border-l lg:p-8">
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary"
      >
        <Sparkles className="size-5" />
      </span>
      <h3 className="typography-subtitle font-semibold text-foreground">
        Join the waitlist
      </h3>
      <p className="typography-body text-muted-foreground">
        Apply below to get access when the private preview opens.
      </p>
      <Button asChild variant="primary" className="min-w-[180px]">
        <a href={waitlistHref} target="_blank" rel="noopener noreferrer">
          Get access
        </a>
      </Button>
    </div>
  );
}
