import { GitMerge, Globe, Gauge, Rocket } from "lucide-react";
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

export function PoliciesTierLockedView() {
  return (
    <div className={cn("page-shell", "gap-8")}>
      {/* Locked state: header carries the title + Tier badge only — the card
          below owns the narrative copy, so the orientation row stays tight. */}
      <PoliciesPageHeader tierLocked />

      <section aria-labelledby="policies-locked-heading">
        <h2 id="policies-locked-heading" className="sr-only">
          Policies — Tier 1 upgrade
        </h2>

        {/* One unified Card hosts both regions — capabilities on the left,
            warm-tinted CTA region on the right share an edge instead of
            floating as separate panels. The right region carries a subtle
            primary-glow backdrop so the eye lands on "ship it" without copy
            shouting. On narrow viewports the divider rotates to horizontal. */}
        <Card className="overflow-hidden border-0 p-0 sm:border">
          <div className="grid lg:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-5 p-6 lg:p-8">
              <div className="flex flex-col gap-2">
                <h3 className="typography-subtitle font-semibold text-foreground">
                  What you can do with Policies
                </h3>
                <p className="typography-body text-muted-foreground">
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
                      className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary-surface text-muted-foreground"
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

            <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden border-t border-border bg-primary-glow p-6 text-center lg:border-t-0 lg:border-l lg:p-8">
              {/* Premium-unlock glyph — readable at any width (the 3-bar
                  tier-progress treatment compressed into a single stripe at
                  mobile width). */}
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary"
              >
                <Rocket className="size-5" />
              </span>
              <h3 className="typography-subtitle font-semibold text-foreground">
                Ready to ship?
              </h3>
              <p className="typography-body text-muted-foreground">
                Add a payment method to start creating policies and unlock
                higher platform limits.
              </p>
              <UpgradeTierDialog
                trigger={
                  <Button variant="primary" className="min-w-[180px]">
                    Upgrade tier
                  </Button>
                }
              />
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
