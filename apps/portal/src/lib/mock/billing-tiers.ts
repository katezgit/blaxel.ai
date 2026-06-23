/**
 * Top-up tier ladder fixture for the workspace-level UpgradeTierDialog.
 *
 * Decoupled from `account.ts` (account billing surface) on purpose: this
 * fixture describes the *runtime paywall* perspective — "if I commit to $X
 * monthly, what tier do I land on, what quotas unlock". The account surface
 * has its own (richer, multi-attribute) tier representation; that one is
 * not the source of truth for paywall UX.
 *
 * Shape mirrors a hypothetical future API: tier id → ladder entry. Step 1
 * of the dialog is a tier-picker (one card per non-zero tier); the user
 * picks a target tier and the suggested monthly top-up is derived from
 * `TIER_SUGGESTED_MONTHLY_USD`. No persistence; no network. Pure fixture.
 */

/** Display tier exposed in the About-Tier panel. 0 is the free tier. */
export type DisplayTier = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Tiers the user can pick as a target on step 1. Excludes the free tier. */
export type SelectableTier = Exclude<DisplayTier, 0>;

export const SELECTABLE_TIERS: ReadonlyArray<SelectableTier> = [1, 2, 3, 4, 5, 6];

/** Minimum monthly top-up that unlocks a given tier (display only). */
export const TIER_UNLOCK_USD: Record<DisplayTier, number> = {
  0: 0,
  1: 20,
  2: 50,
  3: 200,
  4: 500,
  5: 1500,
  6: 4000,
};

/** Suggested monthly top-up offered next to each tier card. */
export const TIER_SUGGESTED_MONTHLY_USD: Record<SelectableTier, number> = {
  1: 20,
  2: 50,
  3: 200,
  4: 500,
  5: 1500,
  6: 4000,
};

export interface TierQuota {
  id: string;
  label: string;
  value: number | null;
  unit?: string;
}

export interface TierLadderEntry {
  tier: DisplayTier;
  quotas: ReadonlyArray<TierQuota>;
  features: ReadonlyArray<string>;
}

/**
 * Ladder rows. Tier 0 is the free baseline; 1-6 are paid.
 *
 * All values are mock data tuned for visible deltas in the About-Tier
 * panel — they scale with the unlock threshold so a Tier 6 panel reads as
 * meaningfully bigger than Tier 1. No API contract.
 *
 * Quota row ordering is consistent across tiers so the panel rebuilds in
 * place without column reordering when the user switches tiers.
 */
export const TIER_LADDER: Record<DisplayTier, TierLadderEntry> = {
  0: {
    tier: 0,
    quotas: [
      { id: "standby", label: "Standby sandboxes", value: 10 },
      { id: "concurrent", label: "Concurrent sandboxes", value: 10 },
      { id: "agents", label: "Agents / MCPs / Jobs", value: 5 },
      { id: "tasks", label: "Concurrent tasks", value: 10 },
      { id: "job-timeout", label: "Job timeout", value: 1, unit: " h" },
      { id: "ram", label: "RAM per sandbox", value: 4, unit: " GB" },
      { id: "volumes", label: "Volumes", value: 10 },
      { id: "logs", label: "Logs retention", value: 3, unit: " days" },
      { id: "domains", label: "Custom domains", value: 0 },
      { id: "lifetime", label: "Sandbox max lifetime", value: 7, unit: " days" },
    ],
    features: [],
  },
  1: {
    tier: 1,
    quotas: [
      { id: "standby", label: "Standby sandboxes", value: 50 },
      { id: "concurrent", label: "Concurrent sandboxes", value: 20 },
      { id: "agents", label: "Agents / MCPs / Jobs", value: 20 },
      { id: "tasks", label: "Concurrent tasks", value: 25 },
      { id: "job-timeout", label: "Job timeout", value: 24, unit: " h" },
      { id: "ram", label: "RAM per sandbox", value: 8, unit: " GB" },
      { id: "volumes", label: "Volumes", value: 100 },
      { id: "logs", label: "Logs retention", value: 14, unit: " days" },
      { id: "domains", label: "Custom domains", value: 1 },
      { id: "lifetime", label: "Sandbox max lifetime", value: 30, unit: " days" },
    ],
    features: ["Extended quotas", "24 h job timeout", "8 GB RAM max"],
  },
  2: {
    tier: 2,
    quotas: [
      { id: "standby", label: "Standby sandboxes", value: 150 },
      { id: "concurrent", label: "Concurrent sandboxes", value: 50 },
      { id: "agents", label: "Agents / MCPs / Jobs", value: 50 },
      { id: "tasks", label: "Concurrent tasks", value: 75 },
      { id: "job-timeout", label: "Job timeout", value: 48, unit: " h" },
      { id: "ram", label: "RAM per sandbox", value: 16, unit: " GB" },
      { id: "volumes", label: "Volumes", value: 300 },
      { id: "logs", label: "Logs retention", value: 30, unit: " days" },
      { id: "domains", label: "Custom domains", value: 3 },
      { id: "lifetime", label: "Sandbox max lifetime", value: 60, unit: " days" },
    ],
    features: ["48 h job timeout", "16 GB RAM max", "Cron triggers"],
  },
  3: {
    tier: 3,
    quotas: [
      { id: "standby", label: "Standby sandboxes", value: 500 },
      { id: "concurrent", label: "Concurrent sandboxes", value: 150 },
      { id: "agents", label: "Agents / MCPs / Jobs", value: 150 },
      { id: "tasks", label: "Concurrent tasks", value: 200 },
      { id: "job-timeout", label: "Job timeout", value: 72, unit: " h" },
      { id: "ram", label: "RAM per sandbox", value: 32, unit: " GB" },
      { id: "volumes", label: "Volumes", value: 1000 },
      { id: "logs", label: "Logs retention", value: 60, unit: " days" },
      { id: "domains", label: "Custom domains", value: 10 },
      { id: "lifetime", label: "Sandbox max lifetime", value: 90, unit: " days" },
    ],
    features: ["72 h job timeout", "32 GB RAM max", "Custom domains", "Policies"],
  },
  4: {
    tier: 4,
    quotas: [
      { id: "standby", label: "Standby sandboxes", value: 1500 },
      { id: "concurrent", label: "Concurrent sandboxes", value: 400 },
      { id: "agents", label: "Agents / MCPs / Jobs", value: 400 },
      { id: "tasks", label: "Concurrent tasks", value: 500 },
      { id: "job-timeout", label: "Job timeout", value: 168, unit: " h" },
      { id: "ram", label: "RAM per sandbox", value: 64, unit: " GB" },
      { id: "volumes", label: "Volumes", value: 4000 },
      { id: "logs", label: "Logs retention", value: 90, unit: " days" },
      { id: "domains", label: "Custom domains", value: 25 },
      { id: "lifetime", label: "Sandbox max lifetime", value: 180, unit: " days" },
    ],
    features: [
      "168 h job timeout",
      "64 GB RAM max",
      "Priority scheduling",
      "All Tier 3 features",
    ],
  },
  5: {
    tier: 5,
    quotas: [
      { id: "standby", label: "Standby sandboxes", value: 5000 },
      { id: "concurrent", label: "Concurrent sandboxes", value: 1000 },
      { id: "agents", label: "Agents / MCPs / Jobs", value: 1000 },
      { id: "tasks", label: "Concurrent tasks", value: 1500 },
      { id: "job-timeout", label: "Job timeout", value: 336, unit: " h" },
      { id: "ram", label: "RAM per sandbox", value: 128, unit: " GB" },
      { id: "volumes", label: "Volumes", value: 12000 },
      { id: "logs", label: "Logs retention", value: 180, unit: " days" },
      { id: "domains", label: "Custom domains", value: 75 },
      { id: "lifetime", label: "Sandbox max lifetime", value: 365, unit: " days" },
    ],
    features: [
      "336 h job timeout",
      "128 GB RAM max",
      "Dedicated capacity",
      "All Tier 4 features",
    ],
  },
  6: {
    tier: 6,
    quotas: [
      { id: "standby", label: "Standby sandboxes", value: null },
      { id: "concurrent", label: "Concurrent sandboxes", value: 2500 },
      { id: "agents", label: "Agents / MCPs / Jobs", value: 2500 },
      { id: "tasks", label: "Concurrent tasks", value: null },
      { id: "job-timeout", label: "Job timeout", value: null },
      { id: "ram", label: "RAM per sandbox", value: 256, unit: " GB" },
      { id: "volumes", label: "Volumes", value: null },
      { id: "logs", label: "Logs retention", value: 365, unit: " days" },
      { id: "domains", label: "Custom domains", value: null },
      { id: "lifetime", label: "Sandbox max lifetime", value: null },
    ],
    features: [
      "Unlimited job timeout",
      "256 GB RAM max",
      "Unlimited sandboxes",
      "All Tier 5 features",
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
