import { ArrowRight, CreditCard, GitMerge, Globe, Gauge } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/cn";
import { UpgradeTierDialog } from "@/components/billing/upgrade-tier-dialog";
import { PoliciesPageHeader } from "./policies-page-header";

interface Capability {
  icon: LucideIcon;
  title: string;
  description: string;
}

const CAPABILITIES: ReadonlyArray<Capability> = [
  {
    icon: Globe,
    title: "Location policies",
    description: "Country and continent restrictions for data residency.",
  },
  {
    icon: Gauge,
    title: "Token usage policies",
    description: "Per-workload model API consumption caps.",
  },
  {
    icon: GitMerge,
    title: "Multi-policy combinations",
    description: "UNION within a type, INTERSECTION across types.",
  },
];

const LOCKED_DESCRIPTION = (
  <div className="flex flex-col gap-1">
    <p className="typography-body font-semibold text-foreground">
      Take control of your deployments
    </p>
    <p className="typography-body text-muted-foreground">
      Define where and how your AI workloads run.
    </p>
  </div>
);

export function PoliciesTierLockedView() {
  return (
    <div className={cn("page-shell", "gap-8")}>
      <PoliciesPageHeader tierLocked description={LOCKED_DESCRIPTION} />

      <section
        aria-labelledby="policies-locked-heading"
        className="grid gap-4 lg:grid-cols-3"
      >
        <h2 id="policies-locked-heading" className="sr-only">
          Policies — Tier 1 upgrade
        </h2>

        <Card className="flex flex-col gap-4 p-6 lg:col-span-2">
          <h3 className="typography-subtitle font-semibold text-foreground">
            What you unlock
          </h3>
          <ul className="flex flex-col gap-4">
            {CAPABILITIES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
                >
                  <Icon className="size-3" />
                </span>
                <div className="flex flex-col gap-1">
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
        </Card>

        <Card className="flex flex-col gap-4 p-6 lg:col-span-1">
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-md bg-muted-surface text-muted-foreground"
          >
            <CreditCard className="size-4" />
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="typography-subtitle font-semibold text-foreground">
              Ready to ship?
            </h3>
            <p className="typography-body text-muted-foreground">
              Upgrade to Tier 1 to start creating Policies and binding them to
              your workloads.
            </p>
          </div>
          <UpgradeTierDialog
            trigger={
              <Button variant="primary" className="self-start">
                Upgrade tier
                <ArrowRight aria-hidden="true" />
              </Button>
            }
          />
        </Card>
      </section>
    </div>
  );
}
