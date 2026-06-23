"use client";

import { useState } from "react";
import { Asterisk, Tag, MapPin } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CapabilityCard } from "@/components/paywall/capability-card";
import { AddDomainDialog } from "./add-domain-dialog";

const capabilities = [
  {
    icon: Asterisk,
    title: "Wildcard support",
    description:
      "Register a domain once and automatically enable the use of any subdomain.",
  },
  {
    icon: Tag,
    title: "Branded sandbox previews",
    description:
      "Expose your sandbox previews using your verified custom domain.",
  },
  {
    icon: MapPin,
    title: "Region-locked assignment",
    description: "Uniquely assign domains to specific regions.",
  },
] as const;

export function CustomDomainsEmpty() {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <section
        aria-labelledby="custom-domains-empty-heading"
        className="flex flex-col gap-4"
      >
        <header className="flex flex-col gap-1">
          <h2
            id="custom-domains-empty-heading"
            className="typography-subtitle font-semibold text-foreground"
          >
            What you can do with Custom Domains
          </h2>
          <p className="typography-body text-muted-foreground">
            Expose resources on your own terms. Configure domains to align with
            your product&apos;s branding.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1">
          {capabilities.map(({ icon, title, description }) => (
            <CapabilityCard
              key={title}
              icon={icon}
              title={title}
              description={description}
            />
          ))}
        </div>
      </section>

      <aside
        aria-labelledby="custom-domains-empty-cta-heading"
        className="flex h-fit flex-col gap-4 rounded-lg border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="custom-domains-empty-cta-heading"
            className="font-mono typography-meta uppercase tracking-wider text-meta-foreground"
          >
            Register your first domain
          </h2>
          <p className="typography-body text-foreground">
            Drop in a domain you own to walk through DNS verification.
          </p>
          <p className="typography-caption text-muted-foreground">
            Or register from the CLI with{" "}
            <span className="font-mono text-foreground">bl domain register</span>.
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full"
          onClick={() => setOpen(true)}
        >
          Add domain
        </Button>
      </aside>
      <AddDomainDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
