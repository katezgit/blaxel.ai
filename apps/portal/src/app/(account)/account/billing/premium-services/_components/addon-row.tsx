import { Check, Gem, Headphones, ShieldCheck, type LucideIcon } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import type { AddOn, AddOnId } from "@/lib/mock/account";

const ICONS: Record<AddOnId, LucideIcon> = {
  "premium-support": Headphones,
  "dedicated-support": Gem,
  hipaa: ShieldCheck,
};

const formatUsd = (value: number): string =>
  `$${value.toLocaleString("en-US")}`;

interface AddOnRowProps {
  addon: AddOn;
}

export default function AddOnRow({ addon }: AddOnRowProps) {
  const Icon = ICONS[addon.id];

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:flex-row md:items-start md:justify-between md:gap-6">
      <div className="flex flex-1 items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary-surface text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="typography-body font-semibold text-foreground">
            {addon.name}
          </h2>
          <p className="typography-body text-muted-foreground">{addon.description}</p>
          {addon.secondaryDescription ? (
            <p className="typography-caption text-muted-foreground">
              {addon.secondaryDescription}
            </p>
          ) : null}
          <p className="typography-caption text-meta-foreground">
            Billed monthly to your account, separate from credit balance.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1 md:gap-2">
        <span className="font-mono typography-body font-semibold tabular-nums text-foreground">
          {formatUsd(addon.priceUsd)}
          <span className="font-normal text-muted-foreground">/mo</span>
        </span>
        {addon.active ? (
          <Badge variant="success" showDot>
            <Check className="size-3" aria-hidden="true" />
            Active
          </Badge>
        ) : (
          <Badge variant="neutral">Coming soon</Badge>
        )}
      </div>
    </article>
  );
}
