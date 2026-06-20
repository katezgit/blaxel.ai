"use client";

import { useEffect, useState } from "react";
import { cn } from "@repo/ui/lib/cn";
import { useAccountState } from "@/lib/mock/account-context";
import type { Tier } from "@/lib/mock/account";

const TIERS: ReadonlyArray<Tier> = [0, 1, 2, 3];

/**
 * Dev-only tier switcher pinned next to the role switcher. Flips the mocked
 * account tier so the demo audience can see gated rows render with and
 * without the gate. Production builds drop this entirely.
 */
export default function DevTierSwitcher() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // eslint-disable-next-line turbo/no-undeclared-env-vars -- NODE_ENV is Next.js-provided
  if (!mounted || process.env.NODE_ENV === "production") return null;

  return <TierSwitcherChrome />;
}

function TierSwitcherChrome() {
  const { state, setTier } = useAccountState();

  return (
    <div
      role="group"
      aria-label="Demo tier switcher (dev only)"
      className="fixed right-3 bottom-3 z-sticky flex items-center gap-1 rounded-md border border-border-strong bg-card p-1 shadow-popover"
    >
      <span className="px-1.5 font-mono text-caption text-meta-foreground uppercase">
        tier
      </span>
      {TIERS.map((value) => {
        const isActive = state.tier === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTier(value)}
            aria-pressed={isActive}
            className={cn(
              "rounded-sm px-2 py-1 text-caption font-medium transition-colors duration-fast ease-out-standard",
              isActive
                ? "bg-selected-surface text-foreground"
                : "text-muted-foreground hover:bg-hover-surface hover:text-foreground",
            )}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
