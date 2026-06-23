/**
 * Shared schema + types for the One-time and Monthly flow forms.
 * The form drives both Step 1 (amount selection) and Step 2 (balance
 * protection) — single `useForm` per flow, validated incrementally.
 */

import { z } from "zod";
import { TOP_UP_AMOUNT_OPTIONS } from "@/lib/mock/billing-tiers";

const SELECTION_OPTIONS = [
  ...TOP_UP_AMOUNT_OPTIONS.map((n) => String(n)),
  "custom",
] as const;

export const topUpSchema = z
  .object({
    selection: z.enum(SELECTION_OPTIONS),
    customAmount: z.string(),
    autoTopUpEnabled: z.boolean(),
    autoTopUpThresholdUsd: z.number({ message: "Threshold is required" }).min(1),
    autoTopUpAmountUsd: z.number({ message: "Amount is required" }).min(1),
    monthlyLimitEnabled: z.boolean(),
    monthlyLimitAmountUsd: z.number({ message: "Amount is required" }).min(1),
  })
  .refine(
    (values) => {
      if (values.selection !== "custom") return true;
      const parsed = Number(values.customAmount);
      return Number.isFinite(parsed) && parsed > 0;
    },
    { path: ["customAmount"], message: "Enter an amount greater than $0" },
  );

export type TopUpFormValues = z.infer<typeof topUpSchema>;

export const INITIAL_VALUES: TopUpFormValues = {
  selection: "200",
  customAmount: "",
  autoTopUpEnabled: true,
  autoTopUpThresholdUsd: 25,
  autoTopUpAmountUsd: 75,
  monthlyLimitEnabled: false,
  monthlyLimitAmountUsd: 200,
};

/**
 * Resolve the effective USD amount from form values.
 * Returns `0` when the custom amount is empty/invalid — caller decides
 * whether to disable Continue/Checkout.
 */
export function resolveAmountUsd(values: Pick<TopUpFormValues, "selection" | "customAmount">): number {
  if (values.selection === "custom") {
    const parsed = Number(values.customAmount);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }
  const numeric = Number(values.selection);
  return Number.isFinite(numeric) ? numeric : 0;
}
