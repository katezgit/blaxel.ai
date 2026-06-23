import { ArrowRight, Asterisk, CreditCard, Globe, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { UpgradeTierDialog } from "@/components/billing/upgrade-tier-dialog";

interface Capability {
  icon: LucideIcon;
  title: string;
  description: string;
}

const CAPABILITIES: ReadonlyArray<Capability> = [
  {
    icon: Asterisk,
    title: "Wildcard support",
    description:
      "One domain covers every subdomain — no per-subdomain registration.",
  },
  {
    icon: Globe,
    title: "Branded sandbox previews",
    description: "Your users see your domain, not *.preview.bl.run.",
  },
  {
    icon: MapPin,
    title: "Region-locked assignment",
    description: "Each domain pins to one region for latency control.",
  },
];

export function TierLockedPanel() {
  return (
    <section
      aria-labelledby="custom-domains-locked-heading"
      className="grid gap-4 lg:grid-cols-3"
    >
      <h2 id="custom-domains-locked-heading" className="sr-only">
        Custom domains — Tier 3 upgrade
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
    </section>
  );
}
