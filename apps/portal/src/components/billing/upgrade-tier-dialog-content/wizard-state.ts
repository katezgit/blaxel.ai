import { z } from "zod";
import {
  SELECTABLE_TIERS,
  TIER_SUGGESTED_MONTHLY_USD,
  type SelectableTier,
} from "@/lib/mock/billing-tiers";

const TIER_SELECTION_VALUES = SELECTABLE_TIERS.map(
  (t) => String(t) as `${SelectableTier}`,
) as [`${SelectableTier}`, ...`${SelectableTier}`[]];

export const topUpSchema = z.object({
  selectedTier: z.enum(TIER_SELECTION_VALUES),
  autoTopUpEnabled: z.boolean(),
  autoTopUpThresholdUsd: z.number({ message: "Threshold is required" }).min(1),
  autoTopUpAmountUsd: z.number({ message: "Amount is required" }).min(1),
  monthlyLimitEnabled: z.boolean(),
  monthlyLimitAmountUsd: z.number({ message: "Amount is required" }).min(1),
});

export type TopUpFormValues = z.infer<typeof topUpSchema>;

/** Default selection — Tier 1, the recommended next-tier-up from Tier 0. */
export const INITIAL_VALUES: TopUpFormValues = {
  selectedTier: "1",
  autoTopUpEnabled: true,
  autoTopUpThresholdUsd: 25,
  autoTopUpAmountUsd: 75,
  monthlyLimitEnabled: false,
  monthlyLimitAmountUsd: 200,
};

/** Selected tier as a `SelectableTier` (numeric, 1-6) — parsed from the form string. */
export function selectedTier(
  values: Pick<TopUpFormValues, "selectedTier">,
): SelectableTier {
  return Number(values.selectedTier) as SelectableTier;
}

/** USD amount that maps to the currently selected tier's suggested monthly top-up. */
export function resolveAmountUsd(
  values: Pick<TopUpFormValues, "selectedTier">,
): number {
  return TIER_SUGGESTED_MONTHLY_USD[selectedTier(values)];
}
