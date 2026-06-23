import { ArrowRight, Check, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { UpgradeTierDialog } from "@/components/billing/upgrade-tier-dialog";
import { PoliciesPageHeader } from "./policies-page-header";

const CAPABILITIES = [
  {
    title: "Location policies",
    description:
      "Country and continent restrictions for data residency.",
  },
  {
    title: "Token usage policies",
    description: "Per-workload model API consumption caps.",
  },
  {
    title: "Multi-policy combinations",
    description:
      "UNION within a type, INTERSECTION across types.",
  },
] as const;

export function PoliciesTierLockedView() {
  return (
    <div className="page-shell">
      <PoliciesPageHeader tierLocked />

      <section
        aria-labelledby="policies-locked-heading"
        className="flex flex-col gap-8"
      >
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-md bg-muted-surface text-muted-foreground"
          >
            <ShieldCheck className="size-5" />
          </span>
          <h2
            id="policies-locked-heading"
            className="typography-subtitle font-semibold text-foreground"
          >
            Govern where workloads run and what they spend
          </h2>
          <p className="typography-body text-muted-foreground">
            Pin Agents, MCP Servers, and Model APIs to regions you trust, and
            cap their model API spend per workload.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="flex flex-col gap-4 p-6 lg:col-span-2">
            <h3 className="typography-label font-medium text-foreground">
              What you unlock
            </h3>
            <ul className="flex flex-col gap-3">
              {CAPABILITIES.map((capability) => (
                <li key={capability.title} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
                  >
                    <Check className="size-3" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <p className="typography-body font-semibold text-foreground">
                      {capability.title}
                    </p>
                    <p className="typography-body text-muted-foreground">
                      {capability.description}
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
              <h3 className="typography-body font-semibold text-foreground">
                Ready to ship?
              </h3>
              <p className="typography-body text-muted-foreground">
                Upgrade to Tier 1 to start creating Policies and binding them
                to your workloads.
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
        </div>
      </section>
    </div>
  );
}
