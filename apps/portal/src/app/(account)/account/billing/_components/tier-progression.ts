import type { Tier } from "@/lib/mock/account";

export interface TierProgress {
  /** Why the account is on this tier today. */
  reason: string;
  /** What unlocks the next tier (null at Tier 3 ceiling for demo). */
  nextRequirement: string | null;
  /** Numeric label of the next tier; null when there is no next tier. */
  nextTier: Tier | null;
}

const PROGRESSION: Record<Tier, TierProgress> = {
  0: {
    reason: "no payment method on file",
    nextRequirement: "Add a payment method",
    nextTier: 1,
  },
  1: {
    reason: "payment method added",
    nextRequirement: "$50 in top-ups over the past 3 months",
    nextTier: 2,
  },
  2: {
    reason: "$50+ in top-ups over the past 3 months",
    nextRequirement: "$200+ in top-ups over the past 30 days",
    nextTier: 3,
  },
  3: {
    reason: "$200+ in top-ups over the past 30 days",
    nextRequirement: null,
    nextTier: null,
  },
};

export function tierProgressFor(tier: Tier): TierProgress {
  return PROGRESSION[tier];
}
