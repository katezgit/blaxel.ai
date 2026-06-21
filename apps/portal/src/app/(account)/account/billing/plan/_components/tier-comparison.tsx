"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/cn";
import type { Tier } from "@/lib/mock/account";

type TierKey = Tier | 4 | 5 | 6 | 7 | 8 | 9;

type ActionKind = "top-up" | "contact";

interface TierData {
  tier: TierKey;
  requirement: string;
  progressLabel?: string;
  keyQuotas: ReadonlyArray<string>;
  features: ReadonlyArray<string>;
  action: ActionKind | null;
}

const TIERS: ReadonlyArray<TierData> = [
  {
    tier: 0,
    requirement: "None",
    keyQuotas: [
      "Sandboxes: 10 total, 10 concurrent",
      "Agents / MCPs / Jobs: 5 max.",
      "Jobs: 4 GB total concurrent RAM",
    ],
    features: [
      "3 days max. logs / metrics retention",
      "7 days max. sandbox runtime",
    ],
    action: null,
  },
  {
    tier: 1,
    requirement: "Add a payment method",
    keyQuotas: [
      "Sandboxes: 50 total, 20 concurrent",
      "Agents / MCPs / Jobs: 20 max.",
      "Jobs: 64 GB total concurrent RAM, max 24h timeout",
      "8 GB RAM max. instance size",
    ],
    features: [
      "Private previews",
      "Cron triggers",
      "Revisions (max. 5)",
      "14 days max. logs / metrics retention",
      "Volumes",
      "Policies",
      "Unlimited sandbox (max. 30 days in Tier 1)",
      "Custom domains",
    ],
    action: "top-up",
  },
  {
    tier: 2,
    requirement: "50+ credits top-up in past 3 months",
    progressLabel: "$0 / $50 (last 3 months)",
    keyQuotas: [
      "Sandboxes: 200 total, 75 concurrent",
      "Volumes: 400 volumes, 200 GB total",
      "Agents / MCPs / Jobs: 75 max.",
      "Jobs: 128 GB total concurrent RAM",
      "32 GB RAM max. instance size",
    ],
    features: [
      "All features of previous tiers",
      "Unlimited sandbox",
      "30 days max. logs / metrics retention",
      "Custom domains",
    ],
    action: "top-up",
  },
  {
    tier: 3,
    requirement: "200+ credits top-up in the past 30 days",
    keyQuotas: [
      "Sandboxes: 800 total, 200 concurrent",
      "Volumes: 6,000 volumes, 3 TB total",
      "Agents / MCPs / Jobs: 200 max.",
    ],
    features: ["All features of previous tiers", "Custom domains"],
    action: "top-up",
  },
  {
    tier: 4,
    requirement: "500+ credits top-up in the past 30 days",
    keyQuotas: [
      "Sandboxes: 2,000 total, 400 concurrent",
      "Volumes: 18,000 volumes, 9 TB total",
      "Jobs: 1,000 tasks per exec., 512 GB total concurrent RAM, max 7d timeout",
      "Agents / MCPs / Jobs: 500 max.",
    ],
    features: ["All features of previous tiers"],
    action: "top-up",
  },
  {
    tier: 5,
    requirement: "1,500+ credits top-up in past 30 days",
    keyQuotas: [
      "Sandboxes: 5,000 total, 1,000 concurrent",
      "Volumes: 50,000 volumes, 24 TB total",
    ],
    features: ["All features of previous tiers"],
    action: "top-up",
  },
  {
    tier: 6,
    requirement: "4,000+ credits top-up in past 30 days",
    keyQuotas: [
      "Sandboxes: 10,000 total, 2,000 concurrent",
      "Volumes: 144,000 volumes, 70 TB total",
      "Jobs: 760 GB total concurrent RAM",
    ],
    features: ["All features of previous tiers"],
    action: "top-up",
  },
  {
    tier: 7,
    requirement: "Contact us for a custom quote",
    keyQuotas: [
      "Sandboxes: 25,000 total, 4,000 concurrent",
      "Volumes: 512,000 volumes, 250 TB total",
      "Jobs: 1 TB total concurrent RAM",
    ],
    features: ["All features of previous tiers"],
    action: "contact",
  },
  {
    tier: 8,
    requirement: "Contact us for a custom quote",
    keyQuotas: [
      "Sandboxes: 50,000 total, 8,000 concurrent",
      "Volumes: 1,024,000 volumes, 500 TB total",
      "Jobs: 2 TB total concurrent RAM",
    ],
    features: ["All features of previous tiers"],
    action: "contact",
  },
  {
    tier: 9,
    requirement: "Contact us for a custom quote",
    keyQuotas: [
      "Sandboxes: 100,000+ total, 10,000+ concurrent",
      "Volumes: 2,048,000 volumes, 1,000+ TB total",
      "Jobs: 4 TB total concurrent RAM",
    ],
    features: ["All features of previous tiers"],
    action: "contact",
  },
];

const GRID_COLS =
  "grid-cols-[minmax(96px,_120px)_minmax(220px,_260px)_minmax(0,_1fr)_minmax(0,_1fr)]";

interface TierComparisonProps {
  currentTier: Tier;
}

export default function TierComparison({ currentTier }: TierComparisonProps) {
  const [tier0Open, setTier0Open] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-subtitle font-semibold text-foreground">
          All tiers
        </h2>
        <p className="text-muted-foreground">
          About to launch and expect a temporary spike?{" "}
          <a
            href="mailto:sales@blaxel.ai"
            className="font-medium text-primary hover:underline focus-visible:shadow-focus-ring rounded-sm"
          >
            Contact us on this form
          </a>
        </p>
      </header>

      <div
        className={cn(
          "grid gap-4 border-b border-border px-4 py-2",
          GRID_COLS,
        )}
      >
        <span className="font-mono text-meta uppercase text-meta-foreground">
          Tier
        </span>
        <span className="font-mono text-meta uppercase text-meta-foreground">
          Requirement
        </span>
        <span className="font-mono text-meta uppercase text-meta-foreground">
          Key Quotas
        </span>
        <span className="font-mono text-meta uppercase text-meta-foreground">
          Key Limits &amp; Features
        </span>
      </div>

      <div
        className="flex max-h-[640px] flex-col gap-2 overflow-y-auto"
        style={{ scrollbarGutter: "stable" }}
      >
        {tier0Open ? null : (
          <button
            type="button"
            onClick={() => setTier0Open(true)}
            aria-expanded={false}
            aria-controls="tier-row-0"
            className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-left text-caption text-muted-foreground hover:text-foreground hover:bg-hover-surface focus-visible:shadow-focus-ring transition-colors duration-fast ease-out-standard"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
            Show Tier 0 — 0
          </button>
        )}

        {TIERS.filter((t) => t.tier !== 0 || tier0Open).map((t) => (
          <TierRow
            key={t.tier}
            tier={t}
            isCurrent={t.tier === currentTier}
            onCollapseTier0={t.tier === 0 ? () => setTier0Open(false) : undefined}
          />
        ))}
      </div>
    </section>
  );
}

interface TierRowProps {
  tier: TierData;
  isCurrent: boolean;
  onCollapseTier0?: () => void;
}

function TierRow({ tier, isCurrent, onCollapseTier0 }: TierRowProps) {
  return (
    <div
      id={tier.tier === 0 ? "tier-row-0" : undefined}
      aria-current={isCurrent ? "true" : undefined}
      className={cn(
        "group relative grid gap-4 rounded-md border px-4 py-4 transition-colors duration-fast ease-out-standard",
        GRID_COLS,
        isCurrent
          ? "border-primary"
          : "border-border hover:bg-hover-surface",
      )}
    >
      {isCurrent ? (
        <span className="absolute -top-2 left-3 rounded-sm border border-primary bg-background px-1.5 font-mono text-meta uppercase text-primary">
          Current tier
        </span>
      ) : null}

      <div className="flex flex-col gap-1">
        <span className="font-mono text-body text-foreground tabular-nums">
          Tier {tier.tier}
        </span>
        {tier.tier === 0 && onCollapseTier0 ? (
          <button
            type="button"
            onClick={onCollapseTier0}
            aria-expanded={true}
            aria-controls="tier-row-0"
            className="-ml-1 inline-flex items-center gap-1 self-start rounded-sm px-1 text-caption text-muted-foreground hover:text-foreground focus-visible:shadow-focus-ring"
          >
            <ChevronDown className="size-3" aria-hidden="true" />
            Hide
          </button>
        ) : null}
      </div>

      <div className="flex flex-col items-start gap-2">
        {tier.progressLabel ? (
          <span className="font-mono text-caption text-muted-foreground tabular-nums">
            {tier.progressLabel}
          </span>
        ) : null}
        <span className="text-foreground">{tier.requirement}</span>
        <TierAction action={tier.action} isCurrent={isCurrent} />
      </div>

      <BulletList items={tier.keyQuotas} />
      <BulletList items={tier.features} />
    </div>
  );
}

interface TierActionProps {
  action: ActionKind | null;
  isCurrent: boolean;
}

function TierAction({ action, isCurrent }: TierActionProps) {
  if (!action || isCurrent) return null;

  const reveal =
    "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-fast ease-out-standard";

  if (action === "top-up") {
    return (
      <Button asChild variant="primary" className={reveal}>
        <Link href="/account/billing/credits">
          <Plus aria-hidden="true" />
          Top up
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="secondary" className={reveal}>
      <a href="mailto:sales@blaxel.ai">Contact Us</a>
    </Button>
  );
}

function BulletList({ items }: { items: ReadonlyArray<string> }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2 text-foreground"
        >
          <Check
            className="size-4 mt-0.5 shrink-0 text-state-scored"
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
