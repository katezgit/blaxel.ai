import Link from "next/link";
import { ArrowRight, CreditCard, Globe } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";

interface Feature {
  title: string;
  description: string;
}

const FEATURES: ReadonlyArray<Feature> = [
  {
    title: "Wildcard support",
    description:
      "One domain covers every subdomain — no per-subdomain registration.",
  },
  {
    title: "Branded sandbox previews",
    description: "Your users see your domain, not *.preview.bl.run.",
  },
  {
    title: "Region-locked assignment",
    description: "Each domain pins to one region for latency control.",
  },
];

export function TierLockedPanel() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-4">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-md bg-muted-surface text-muted-foreground"
            >
              <Globe className="size-6" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="typography-subtitle font-semibold text-foreground">
                Bring your own identity to Blaxel
              </h2>
              <p className="typography-body text-muted-foreground">
                Route Sandbox previews through your own domain names, with
                automatic TLS via ACM.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-border pt-6">
            <span className="typography-label font-medium uppercase tracking-wider text-muted-foreground">
              Features
            </span>
            <ul className="flex flex-col gap-4">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex flex-col gap-1">
                  <span className="typography-body font-medium text-foreground">
                    {f.title}
                  </span>
                  <span className="typography-body text-muted-foreground">
                    {f.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-2">
            <span className="typography-label font-medium uppercase tracking-wider text-muted-foreground">
              Ready to ship?
            </span>
            <p className="typography-body text-foreground">
              Upgrade to Tier 3 to register custom domains and map them to your
              Sandbox preview URLs.
            </p>
          </div>

          <Button asChild variant="primary">
            <Link
              href="/account/billing/credits"
              className="inline-flex items-center gap-2"
            >
              <CreditCard className="size-4" aria-hidden="true" />
              Upgrade tier
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>

          <p className="typography-caption text-muted-foreground">
            Takes you to account billing — a $200+ monthly top-up activates
            Tier 3.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
