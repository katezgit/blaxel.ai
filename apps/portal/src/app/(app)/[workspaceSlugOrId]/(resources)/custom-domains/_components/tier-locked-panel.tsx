import { ArrowRight, Asterisk, MapPin, Tag } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { UpgradeTierDialog } from "@/components/billing/upgrade-tier-dialog";
import { CapabilityCard } from "@/components/paywall/capability-card";

export function TierLockedPanel() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <section
        aria-labelledby="custom-domains-capabilities-heading"
        className="flex flex-col gap-3"
      >
        <h2
          id="custom-domains-capabilities-heading"
          className="font-mono typography-meta uppercase tracking-wider text-meta-foreground"
        >
          Capabilities
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1">
          <CapabilityCard
            icon={Asterisk}
            title="Wildcard support"
            description="One domain covers every subdomain — no per-subdomain registration."
          />
          <CapabilityCard
            icon={Tag}
            title="Branded sandbox previews"
            description="Your users see your domain, not *.preview.bl.run."
          />
          <CapabilityCard
            icon={MapPin}
            title="Region-locked assignment"
            description="Each domain pins to one region for latency control."
          />
        </div>
      </section>

      <aside
        aria-labelledby="custom-domains-unlock-heading"
        className="flex h-fit flex-col gap-3 rounded-lg border border-border bg-card p-5"
      >
        <h2
          id="custom-domains-unlock-heading"
          className="font-mono typography-meta uppercase tracking-wider text-meta-foreground"
        >
          Unlock Custom domains
        </h2>
        <p className="typography-body text-foreground">
          Custom domains require Tier 3.
        </p>
        <p className="typography-caption text-muted-foreground">
          A $200+ monthly top-up activates Tier 3.
        </p>
        <UpgradeTierDialog
          trigger={
            <Button variant="primary" className="mt-2 w-full">
              Upgrade tier
              <ArrowRight aria-hidden="true" />
            </Button>
          }
        />
      </aside>
    </div>
  );
}
