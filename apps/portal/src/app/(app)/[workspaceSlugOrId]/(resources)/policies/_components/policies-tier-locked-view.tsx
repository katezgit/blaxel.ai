"use client";

import Link from "next/link";
import { ArrowRight, MapPin, GaugeCircle, Combine, BookOpen, Terminal } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { PoliciesPageHeader } from "./policies-page-header";

const PAYMENT_HREF = "/account/billing/credits#payment-method";

interface CapabilityCardProps {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  title: string;
  description: string;
}

function CapabilityCard({ icon: Icon, title, description }: CapabilityCardProps) {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        <h3 className="typography-label font-medium text-foreground">
          {title}
        </h3>
      </div>
      <p className="typography-caption text-muted-foreground">{description}</p>
    </Card>
  );
}

interface ResourceCardProps {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  title: string;
  description: string;
  href: string;
}

function ResourceCard({ icon: Icon, title, description, href }: ResourceCardProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group"
    >
      <Card
        variant="interactive"
        className="flex flex-col gap-2 p-4"
      >
        <div className="flex items-center gap-2">
          <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
          <h3 className="typography-label font-medium text-foreground">
            {title}
          </h3>
          <ArrowRight aria-hidden="true" className="ml-auto size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
        <p className="typography-caption text-muted-foreground">{description}</p>
      </Card>
    </Link>
  );
}

export function PoliciesTierLockedView() {
  return (
    <div className="page-shell">
      <PoliciesPageHeader showCreate={false} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <section
          aria-labelledby="policies-capabilities-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="policies-capabilities-heading"
            className="font-mono typography-meta uppercase tracking-wider text-meta-foreground"
          >
            Capabilities
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1">
            <CapabilityCard
              icon={MapPin}
              title="Location policies"
              description="Control which data centers your workloads can be deployed to — by continent or country."
            />
            <CapabilityCard
              icon={GaugeCircle}
              title="Token usage policies"
              description="Control the maximum number of tokens consumed by Agents or Model APIs over a period of time."
            />
            <CapabilityCard
              icon={Combine}
              title="Multi-policy combinations"
              description="Combine policies for AND / OR logic: same type = UNION (OR), different types = INTERSECTION (AND)."
            />
          </div>
        </section>

        <aside
          aria-labelledby="policies-unlock-heading"
          className="flex h-fit flex-col gap-3 rounded-lg border border-border bg-card p-5"
        >
          <h2
            id="policies-unlock-heading"
            className="font-mono typography-meta uppercase tracking-wider text-meta-foreground"
          >
            Unlock Policies
          </h2>
          <p className="typography-body text-foreground">
            Policies require Tier 1.
          </p>
          <p className="typography-caption text-muted-foreground">
            Add a payment method to unlock.
          </p>
          <Button asChild variant="primary" className="mt-2 w-full">
            <Link href={PAYMENT_HREF}>
              Add payment method
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </aside>
      </div>

      <section
        aria-labelledby="policies-resources-heading"
        className="flex flex-col gap-3"
      >
        <h2
          id="policies-resources-heading"
          className="font-mono typography-meta uppercase tracking-wider text-meta-foreground"
        >
          Resources
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ResourceCard
            icon={BookOpen}
            title="Documentation"
            description="Model governance and policy authoring guide."
            href="https://docs.blaxel.ai/Security/Policies"
          />
          <ResourceCard
            icon={Terminal}
            title="API Reference"
            description="Manage policies via the REST API or the bl CLI."
            href="https://docs.blaxel.ai/api-reference/policies"
          />
        </div>
      </section>
    </div>
  );
}
