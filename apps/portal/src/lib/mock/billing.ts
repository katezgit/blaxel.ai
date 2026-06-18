import { billingHistory } from "@/lib/mock/data";
import type { BillingHistoryEntry } from "@/lib/mock/types";

export async function fetchBillingHistory(
  _accountId: string,
): Promise<ReadonlyArray<BillingHistoryEntry>> {
  void _accountId;
  return [...billingHistory];
}
