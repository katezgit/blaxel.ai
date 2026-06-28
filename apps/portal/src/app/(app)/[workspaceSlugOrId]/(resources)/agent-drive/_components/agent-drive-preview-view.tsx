"use client";

import { useEffect, useState } from "react";
import {
  Check,
  FolderTree,
  HardDrive,
  Infinity as InfinityIcon,
  Share2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import JoinWaitlistDialog from "./join-waitlist-dialog";

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

// Persisted across reloads so the mock joined state survives a refresh. Mock
// only — there's no backend; the real product would read this from the
// account's waitlist record.
const STORAGE_KEY = "blaxel.agent-drive.waitlist";

interface WaitlistRecord {
  joined: true;
  joinedAt: string;
}

function readWaitlist(): WaitlistRecord | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WaitlistRecord>;
    if (parsed.joined === true && typeof parsed.joinedAt === "string") {
      return { joined: true, joinedAt: parsed.joinedAt };
    }
    return null;
  } catch {
    return null;
  }
}

export default function AgentDrivePreviewView() {
  // Default to null on first render so server and client agree; the joined
  // state lights up in the post-hydration effect.
  const [waitlist, setWaitlist] = useState<WaitlistRecord | null>(null);

  useEffect(() => {
    setWaitlist(readWaitlist());
  }, []);

  const handleConfirmed = () => {
    const record: WaitlistRecord = {
      joined: true,
      joinedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    setWaitlist(record);
  };

  return (
    <div className="page-shell gap-8">
      <header className="page-header">
        <div className="flex items-center gap-2">
          <h1 className="typography-display font-semibold text-foreground">
            Agent Drive
          </h1>
          <Badge variant="neutral" size="sm">
            Private preview
          </Badge>
        </div>
      </header>

      <section aria-labelledby="agent-drive-preview-heading">
        <h2 id="agent-drive-preview-heading" className="sr-only">
          Agent Drive — private preview
        </h2>

        <Card className="overflow-hidden border-0 p-0 sm:border">
          <div className="grid lg:grid-cols-[2fr_1fr]">
            <AgentDriveCapabilitiesPanel />
            {waitlist ? (
              <AgentDriveJoinedPanel joinedAt={waitlist.joinedAt} />
            ) : (
              <AgentDriveCtaPanel onConfirmed={handleConfirmed} />
            )}
          </div>
        </Card>
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
  onConfirmed: () => void;
}

function AgentDriveCtaPanel({ onConfirmed }: AgentDriveCtaPanelProps) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden border-t border-border bg-primary-glow p-6 text-center lg:border-t-0 lg:border-l lg:p-8">
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary"
      >
        <HardDrive className="size-5" />
      </span>
      <h3 className="typography-subtitle font-semibold text-foreground">
        Private preview
      </h3>
      <p className="typography-body text-muted-foreground">
        Agent Drive is rolling out to early users. Join the waitlist and
        we&rsquo;ll reach out when your access is ready.
      </p>
      <JoinWaitlistDialog
        onConfirmed={onConfirmed}
        trigger={
          <Button variant="primary" className="min-w-[180px]">
            Join the waitlist
          </Button>
        }
      />
    </div>
  );
}

interface AgentDriveJoinedPanelProps {
  joinedAt: string;
}

function AgentDriveJoinedPanel({ joinedAt }: AgentDriveJoinedPanelProps) {
  const formatted = formatJoinedDate(joinedAt);
  return (
    <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden border-t border-border bg-primary-glow p-6 text-center lg:border-t-0 lg:border-l lg:p-8">
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary"
      >
        <Check className="size-5" />
      </span>
      <h3 className="typography-subtitle font-semibold text-foreground">
        You&rsquo;re on the waitlist
      </h3>
      <p className="typography-body text-muted-foreground">
        We&rsquo;ll email you when Agent Drive is ready for your account.
      </p>
      <p className="typography-caption text-meta-foreground">
        Joined {formatted}
      </p>
    </div>
  );
}

function formatJoinedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
