/**
 * Top-up tier ladder fixture for the workspace-level UpgradeTierDialog.
 *
 * Decoupled from `account.ts` (account billing surface) on purpose: this
 * fixture describes the *runtime paywall* perspective — "if I top up $X
 * monthly, what tier do I land on, what quotas unlock". The account surface
 * has its own (richer, multi-attribute) tier representation; that one is
 * not the source of truth for paywall UX.
 *
 * Shape mirrors a hypothetical future API: amount → tier id → ladder entry.
 * No persistence; no network. Pure fixture.
 */

/** Monthly USD amounts that map to a tier. */
export const TOP_UP_AMOUNT_OPTIONS = [100, 200, 500, 1000] as const;
export type TopUpAmount = (typeof TOP_UP_AMOUNT_OPTIONS)[number];

/** Display tier exposed in the About-Tier panel. 0 is the free tier. */
export type DisplayTier = 0 | 1 | 2 | 3 | 4;

/** Amount → tier mapping. Per spec ($100 → Tier 1, $200 → Tier 3, …). */
const AMOUNT_TO_TIER: Record<TopUpAmount, DisplayTier> = {
  100: 1,
  200: 3,
  500: 4,
  1000: 4,
};

export function tierForAmount(amount: number): DisplayTier {
  // Find the highest tier whose threshold is ≤ amount.
  let resolved: DisplayTier = 0;
  for (const option of TOP_UP_AMOUNT_OPTIONS) {
    if (amount >= option) resolved = AMOUNT_TO_TIER[option];
  }
  return resolved;
}

/** Minimum monthly top-up that unlocks a given tier (display only). */
export const TIER_UNLOCK_USD: Record<DisplayTier, number> = {
  0: 0,
  1: 100,
  2: 100,
  3: 200,
  4: 500,
};

export interface TierQuota {
  /** Stable id used as React key. */
  id: string;
  /** Label shown to the user (e.g. "Standby sandboxes"). */
  label: string;
  /** Quota value at this tier — `null` = unlimited / not-applicable. */
  value: number | null;
  /** Suffix appended to the value when rendered (e.g. "GB", "/ deployment"). */
  unit?: string;
}

export interface TierLadderEntry {
  tier: DisplayTier;
  /** Quota set shown in the About-Tier panel. */
  quotas: ReadonlyArray<TierQuota>;
  /** Features that become available at this tier (Tier ≥ 1). */
  features: ReadonlyArray<string>;
}

/**
 * Ladder rows. Tier 0 is the free baseline; 1-4 are paid.
 *
 * Quotas mirror `TIER_LIMITS` in `account.ts` for tiers 0-3 (so the dialog
 * stays plausible against the rest of the demo). Tier 4 is aspirational —
 * the demo never seeds a Tier 4 `state.tier`, but the ladder panel still
 * renders it when the user previews a $500+ monthly top-up.
 */
export const TIER_LADDER: Record<DisplayTier, TierLadderEntry> = {
  0: {
    tier: 0,
    quotas: [
      { id: "standby", label: "Standby sandboxes", value: 10 },
      { id: "concurrent", label: "Concurrent sandboxes", value: 10 },
      { id: "ram", label: "Concurrent RAM", value: 4, unit: " GB" },
      { id: "agents", label: "Agents / MCPs / Jobs", value: 5 },
      { id: "lifetime", label: "Sandbox max lifetime", value: 7, unit: " days" },
      { id: "logs", label: "Logs retention", value: 3, unit: " days" },
    ],
    features: [],
  },
  1: {
    tier: 1,
    quotas: [
      { id: "standby", label: "Standby sandboxes", value: 50 },
      { id: "concurrent", label: "Concurrent sandboxes", value: 20 },
      { id: "ram", label: "Concurrent RAM", value: 64, unit: " GB" },
      { id: "agents", label: "Agents / MCPs / Jobs", value: 20 },
      { id: "volumes", label: "Volumes", value: 100 },
      { id: "logs", label: "Logs retention", value: 14, unit: " days" },
    ],
    features: ["Volumes & Agent Drives", "Cron triggers", "Policies"],
  },
  2: {
    tier: 2,
    quotas: [
      { id: "standby", label: "Standby sandboxes", value: 200 },
      { id: "concurrent", label: "Concurrent sandboxes", value: 75 },
      { id: "ram", label: "Concurrent RAM", value: 128, unit: " GB" },
      { id: "agents", label: "Agents / MCPs / Jobs", value: 75 },
      { id: "volumes", label: "Volumes", value: 400 },
      { id: "logs", label: "Logs retention", value: 30, unit: " days" },
    ],
    features: ["Unlimited sandbox runtime", "All features of Tier 1"],
  },
  3: {
    tier: 3,
    quotas: [
      { id: "standby", label: "Standby sandboxes", value: 800 },
      { id: "concurrent", label: "Concurrent sandboxes", value: 200 },
      { id: "ram", label: "Concurrent RAM", value: 256, unit: " GB" },
      { id: "agents", label: "Agents / MCPs / Jobs", value: 200 },
      { id: "volumes", label: "Volumes", value: 6000 },
      { id: "domains", label: "Custom domains", value: 20 },
    ],
    features: ["Custom domains", "All features of Tier 2"],
  },
  4: {
    tier: 4,
    quotas: [
      { id: "standby", label: "Standby sandboxes", value: null },
      { id: "concurrent", label: "Concurrent sandboxes", value: 500 },
      { id: "ram", label: "Concurrent RAM", value: 512, unit: " GB" },
      { id: "agents", label: "Agents / MCPs / Jobs", value: 500 },
      { id: "volumes", label: "Volumes", value: null },
      { id: "domains", label: "Custom domains", value: null },
    ],
    features: [
      "Unlimited standby sandboxes",
      "Unlimited volumes",
      "All features of Tier 3",
    ],
  },
};

export function ladderEntry(tier: DisplayTier): TierLadderEntry {
  return TIER_LADDER[tier];
}

/**
 * Compute the delta of a quota between two tiers. Returns:
 *   - `null` when either value is `null` (unlimited / N/A) — caller renders "Unlimited".
 *   - a positive number when target > current.
 *   - `0` when unchanged (caller may hide it).
 */
export function quotaDelta(quotaId: string, fromTier: DisplayTier, toTier: DisplayTier): number | null {
  const from = TIER_LADDER[fromTier].quotas.find((q) => q.id === quotaId);
  const to = TIER_LADDER[toTier].quotas.find((q) => q.id === quotaId);
  if (!from || !to) return null;
  if (from.value === null || to.value === null) return null;
  return to.value - from.value;
}
