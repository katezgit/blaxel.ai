import { secrets } from "@/lib/mock/data";
import type { Secret } from "@/lib/mock/types";

export async function fetchSecrets(_accountId: string): Promise<ReadonlyArray<Secret>> {
  void _accountId;
  return [...secrets];
}
