import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { UpgradeTierDialog } from "@/components/billing/upgrade-tier-dialog";

export function TierLockedPanel() {
  return (
    <section
      aria-labelledby="custom-domains-locked-heading"
      className="flex max-w-2xl flex-col gap-6"
    >
      <div className="flex flex-col gap-1">
        <span className="font-mono typography-meta uppercase tracking-wider text-meta-foreground">
          Tier 3 feature
        </span>
        <h2
          id="custom-domains-locked-heading"
          className="typography-subtitle font-semibold text-foreground"
        >
          Custom domains require Tier 3.
        </h2>
        <p className="typography-body text-muted-foreground">
          Map customer-owned DNS to Sandbox preview URLs with managed TLS,
          region-locked per domain. Activate Tier 3 to register your first
          domain.
        </p>
      </div>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <h3 className="typography-body font-semibold text-foreground">
            Activate Tier 3
          </h3>
          <p className="typography-body text-muted-foreground">
            A $200+ monthly top-up activates Tier 3 and unlocks Custom domains
            alongside the rest of the dedicated runtime surface.
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
