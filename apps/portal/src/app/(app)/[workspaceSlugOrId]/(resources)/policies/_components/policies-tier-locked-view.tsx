import {
  ArrowUpRight,
  FileCheck,
  GitMerge,
  Globe,
  Gauge,
  Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/cn";
import UpgradeTierDialog from "@/components/billing/upgrade-tier-dialog";
import PoliciesPageHeader from "./policies-page-header";

const LOCKED_DESCRIPTION = (
  <p className="text-muted-foreground">
    Policies are available on Tier 1 and above.{" "}
    <a
      href="https://docs.blaxel.ai/Model-Governance/Policies"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Policies documentation, opens in new tab"
      className="inline-flex items-baseline gap-0.5 rounded-sm text-muted-foreground hover:text-foreground hover:underline"
    >
      Docs
      <ArrowUpRight aria-hidden="true" className="size-3 self-center" />
    </a>
    {" · "}
    <a
      href="https://docs.blaxel.ai/api-reference/policies/list-governance-policies"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Policies API reference, opens in new tab"
      className="inline-flex items-baseline gap-0.5 rounded-sm text-muted-foreground hover:text-foreground hover:underline"
    >
      API reference
      <ArrowUpRight aria-hidden="true" className="size-3 self-center" />
    </a>
  </p>
);

interface Capability {
  icon: LucideIcon;
  title: string;
  description: string;
}

const CAPABILITIES: ReadonlyArray<Capability> = [
  {
    icon: Globe,
    title: "Location policies",
    description: "Control where your workloads run by country or continent.",
  },
  {
    icon: Gauge,
    title: "Token usage policies",
    description: "Set rate limits for model API token consumption.",
  },
  {
    icon: GitMerge,
    title: "Multi-policy combinations",
    description: "Combine policies with union and intersection logic.",
  },
];

export default function PoliciesTierLockedView() {
  return (
    <div className={cn("page-shell", "min-h-full")}>
      <PoliciesPageHeader tierLocked description={LOCKED_DESCRIPTION} />

      <section
        aria-labelledby="policies-locked-heading"
        className="flex flex-1 flex-col"
      >
        <h2 id="policies-locked-heading" className="sr-only">
          Policies — Tier 1 upgrade
        </h2>

        <div aria-hidden="true" className="min-h-12 grow basis-0" />

        <div className="flex shrink-0 flex-col items-center gap-4 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-md bg-icon-tile text-muted-foreground"
          >
            <FileCheck className="size-6" />
          </span>
          <div className="flex flex-col items-center gap-1">
            <h3 className="typography-display text-foreground">
              Take control of your deployments
            </h3>
            <p className="max-w-xl text-muted-foreground">
              Define where and how your AI workloads run. Set location
              restrictions, hardware requirements, and usage limits with
              policies as code.
            </p>
          </div>
        </div>

        <Card className="mt-6 w-full max-w-4xl shrink-0 self-center overflow-hidden border-0 p-0 lg:border">
          <div className="grid lg:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-6 p-6 lg:p-8">
              <div className="flex flex-col gap-2">
                <h3 className="typography-subtitle text-foreground">
                  What you can do with Policies
                </h3>
                <p className="text-muted-foreground">
                  Take control of how and where your AI workloads are deployed
                  within the Blaxel platform. Define policies as code to
                  customize your Global Agents Network.
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
                      <p className="font-semibold text-foreground">
                        {title}
                      </p>
                      <p className="text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-t-surface border-border bg-primary-glow p-6 text-center lg:rounded-t-none lg:border-l lg:p-8">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary"
              >
                <Rocket className="size-5" />
              </span>
              <h3 className="typography-subtitle text-foreground">
                Ready to ship?
              </h3>
              <p className="text-muted-foreground">
                Add a payment method to start creating policies and unlock
                higher platform limits.
              </p>
              <UpgradeTierDialog
                trigger={
                  <Button variant="primary">
                    Upgrade tier
                  </Button>
                }
              />
            </div>
          </div>
        </Card>

        <div aria-hidden="true" className="grow-[1.618] basis-0" />
      </section>
    </div>
  );
}
