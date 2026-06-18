import { limits } from "@/lib/mock/data";
import type { LimitRow } from "@/lib/mock/types";

export async function fetchLimits(_accountId: string): Promise<ReadonlyArray<LimitRow>> {
  void _accountId;
  return [...limits];
}
