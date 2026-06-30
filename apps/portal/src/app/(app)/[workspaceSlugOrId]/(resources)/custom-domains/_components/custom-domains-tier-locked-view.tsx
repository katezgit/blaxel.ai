import { ArrowUpRight, Asterisk, Globe, MapPin, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/cn";
import UpgradeTierDialog from "@/components/billing/upgrade-tier-dialog";
import CustomDomainsHeader from "./custom-domains-header";

const LOCKED_DESCRIPTION = (
  <p className="text-muted-foreground">
    Custom domains are available on{" "}
    <Link
      href="/account/billing/tier-quotas"
      className="rounded-sm text-muted-foreground hover:text-foreground hover:underline"
    >
      Tier 3 and above
    </Link>
    {" · "}
    <a
      href="https://docs.blaxel.ai/Infrastructure/Custom-domains"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Custom domains documentation, opens in new tab"
      className="inline-flex items-baseline gap-0.5 rounded-sm text-muted-foreground hover:text-foreground hover:underline"
    >
      Docs
      <ArrowUpRight aria-hidden="true" className="size-3 self-center" />
    </a>
    {" · "}
    <a
      href="https://docs.blaxel.ai/api-reference/customdomains/create-application-custom-domain"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Custom domains API reference, opens in new tab"
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

export default function CustomDomainsTierLockedView() {
  return (
    <div className={cn("page-shell", "min-h-full")}>
      <CustomDomainsHeader
        action={null}
        tierLocked
        description={LOCKED_DESCRIPTION}
      />

      <section
        aria-labelledby="custom-domains-locked-heading"
        className="flex flex-1 flex-col"
      >
        <h2 id="custom-domains-locked-heading" className="sr-only">
          Custom domains — Tier 3 upgrade
        </h2>

        <div aria-hidden="true" className="min-h-12 grow basis-0" />

        <div className="flex shrink-0 flex-col items-center gap-4 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-md bg-icon-tile text-muted-foreground"
          >
            <Globe className="size-6" />
          </span>
          <div className="flex flex-col items-center gap-1">
            <h3 className="typography-display text-foreground">
              Bring your own identity to Blaxel
            </h3>
            <p className="max-w-xl text-muted-foreground">
              Connect your own domain names to your Blaxel workspace to use
              when exposing resources. Enable wildcard subdomains and ensure
              your AI workloads carry your product identity.
            </p>
          </div>
        </div>

        <Card className="mt-6 w-full max-w-4xl shrink-0 self-center overflow-hidden border-0 p-0 lg:border">
          <div className="grid lg:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-6 p-6 lg:p-8">
              <div className="flex flex-col gap-2">
                <h3 className="typography-subtitle text-foreground">
                  What you can do with Custom domains
                </h3>
                <p className="text-muted-foreground">
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
              <p className="typography-caption text-muted-foreground">
                Currently routes Sandbox previews. Agents and MCP servers coming
                soon.
              </p>
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
                Upgrade to Tier 3 to register your first domain and map it to a
                Sandbox preview URL.
              </p>
              <UpgradeTierDialog
                recommendedTier={3}
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
