import { ArrowRight, Check, CreditCard, Globe } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { UpgradeTierDialog } from "@/components/billing/upgrade-tier-dialog";

const CAPABILITIES = [
  {
    title: "Wildcard support",
    description:
      "One domain covers every subdomain — no per-subdomain registration.",
  },
  {
    title: "Branded sandbox previews",
    description:
      "Your users see your domain, not *.preview.bl.run.",
  },
  {
    title: "Region-locked assignment",
    description: "Each domain pins to one region for latency control.",
  },
] as const;

export function TierLockedPanel() {
  return (
    <section
      aria-labelledby="custom-domains-locked-heading"
      className="flex flex-col gap-8"
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-md bg-muted-surface text-muted-foreground"
        >
          <Globe className="size-5" />
        </span>
        <h2
          id="custom-domains-locked-heading"
          className="typography-subtitle font-semibold text-foreground"
        >
          Bring your own identity to Blaxel
        </h2>
        <p className="typography-body text-muted-foreground">
          Route Sandbox preview URLs through your own domain names, with
          managed TLS, region-locked per domain.
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
              Upgrade to Tier 3 to register your first domain and map it to a
              Sandbox preview URL.
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
  );
}
