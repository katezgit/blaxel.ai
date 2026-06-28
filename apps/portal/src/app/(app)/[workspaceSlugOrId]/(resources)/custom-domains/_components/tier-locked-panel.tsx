import { Asterisk, Globe, MapPin, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import UpgradeTierDialog from "@/components/billing/upgrade-tier-dialog";

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

export default function TierLockedPanel() {
  return (
    <section aria-labelledby="custom-domains-locked-heading">
      <h2 id="custom-domains-locked-heading" className="sr-only">
        Custom domains — Tier 3 upgrade
      </h2>

      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-6 p-6 lg:p-8">
            <div className="flex flex-col gap-2">
              <h3 className="typography-subtitle font-semibold text-foreground">
                What you can do with Custom domains
              </h3>
              <p className="typography-body text-muted-foreground">
                Bring your own DNS to Blaxel. Take ownership of how Sandbox
                previews appear and where they route.
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
            <p className="typography-caption text-muted-foreground">
              Currently routes Sandbox previews. Agents and MCP servers coming
              soon.
            </p>
          </div>

          <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden border-t border-border bg-primary-glow p-6 text-center lg:border-t-0 lg:border-l lg:p-8">
            {/* Canonical "Ready to ship?" glyph — Rocket in a soft-orange
                circle, matching the icon-in-chip chrome used by the Policies
                tier-locked panel so every locked-tier CTA shares one mark. */}
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary"
            >
              <Rocket className="size-5" />
            </span>
            <h3 className="typography-subtitle font-semibold text-foreground">
              Ready to ship?
            </h3>
            <p className="typography-body text-muted-foreground">
              Upgrade to Tier 3 to register your first domain and map it to a
              Sandbox preview URL.
            </p>
            <UpgradeTierDialog
              recommendedTier={3}
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
  );
}
