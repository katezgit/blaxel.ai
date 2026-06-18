import { usageRows } from "@/lib/mock/data";
import type { UsageRow } from "@/lib/mock/types";

export async function fetchUsage(_accountId: string): Promise<ReadonlyArray<UsageRow>> {
  void _accountId;
  return [...usageRows];
}
