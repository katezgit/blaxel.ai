"use client";

import { MapPin, GaugeCircle, Combine } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CapabilityCard } from "@/components/paywall/capability-card";

interface PoliciesEmptyStateProps {
  onCreate: () => void;
}

const capabilities = [
  {
    icon: MapPin,
    title: "Location policies",
    description:
      "Control which data centers your workloads can be deployed to — by continent or country.",
  },
  {
    icon: GaugeCircle,
    title: "Token usage policies",
    description:
      "Control the maximum number of tokens consumed by Agents or Model APIs over a period of time.",
  },
  {
    icon: Combine,
    title: "Multi-policy combinations",
    description:
      "Combine policies for AND / OR logic: same type = UNION (OR), different types = INTERSECTION (AND).",
  },
] as const;

export function PoliciesEmptyState({ onCreate }: PoliciesEmptyStateProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <section
        aria-labelledby="policies-empty-heading"
        className="flex flex-col gap-4"
      >
        <header className="flex flex-col gap-1">
          <h2
            id="policies-empty-heading"
            className="typography-subtitle font-semibold text-foreground"
          >
            What you can do with Policies
          </h2>
          <p className="typography-body text-muted-foreground">
            Define where and how your AI workloads run — by region, token
            budget, or hardware flavor.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1">
          {capabilities.map(({ icon, title, description }) => (
            <CapabilityCard
              key={title}
              icon={icon}
              title={title}
              description={description}
            />
          ))}
        </div>
      </section>

      <aside
        aria-labelledby="policies-empty-cta-heading"
        className="flex h-fit flex-col gap-4 rounded-lg border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="policies-empty-cta-heading"
            className="font-mono typography-meta uppercase tracking-wider text-meta-foreground"
          >
            Create your first policy
          </h2>
          <p className="typography-body text-foreground">
            Author a policy from the dashboard or apply a YAML manifest from
            the CLI.
          </p>
          <p className="typography-caption text-muted-foreground">
            CLI:{" "}
            <span className="font-mono text-foreground">bl apply -f policy.yaml</span>
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full"
          onClick={onCreate}
        >
          Create policy
        </Button>
      </aside>
    </div>
  );
}
