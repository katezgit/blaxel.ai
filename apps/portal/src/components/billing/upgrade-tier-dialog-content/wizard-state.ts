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
});

export type TopUpFormValues = z.infer<typeof topUpSchema>;

/** Default selection — Tier 1, the recommended next-tier-up from Tier 0. */
export const INITIAL_VALUES: TopUpFormValues = {
  selectedTier: "1",
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

// --- One-time top-up form ----------------------------------------------------
//
// Separate from the Monthly schema above on purpose: one-time has no tier
// concept (it's a raw credit purchase), so it carries its own amount-chip
// selection + optional custom amount.

/** Preset chip values, in display order. `null` = the Custom chip. */
export const ONE_TIME_AMOUNT_PRESETS: ReadonlyArray<number> = [
  50, 100, 200, 500, 1000,
];

export const oneTimeTopUpSchema = z
  .object({
    presetAmountUsd: z.number().nullable(),
    customAmountUsd: z
      .number({ message: "Amount is required" })
      .min(1, "Amount must be at least $1")
      .max(10000, "Amount must be at most $10,000")
      .optional(),
  })
  .superRefine((values, ctx) => {
    if (values.presetAmountUsd === null && values.customAmountUsd === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customAmountUsd"],
        message: "Enter a custom amount",
      });
    }
  });

export type OneTimeTopUpFormValues = z.infer<typeof oneTimeTopUpSchema>;

/** Default — $200 preset selected. */
export const ONE_TIME_INITIAL_VALUES: OneTimeTopUpFormValues = {
  presetAmountUsd: 200,
  customAmountUsd: undefined,
};

/** Effective USD amount — either the selected preset or the custom value. Returns 0 when nothing valid is set. */
export function resolveOneTimeAmountUsd(
  values: Pick<OneTimeTopUpFormValues, "presetAmountUsd" | "customAmountUsd">,
): number {
  if (values.presetAmountUsd !== null) return values.presetAmountUsd;
  if (typeof values.customAmountUsd === "number" && Number.isFinite(values.customAmountUsd)) {
    return values.customAmountUsd;
  }
  return 0;
}
