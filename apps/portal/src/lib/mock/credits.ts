import { burnHistory, creditState, priorPeriodBurn } from "@/lib/mock/data";
import type { CreditState } from "@/lib/mock/types";

export async function fetchCreditState(_accountId: string): Promise<CreditState> {
  void _accountId;
  return { ...creditState };
}

export interface BurnHistory {
  history: ReadonlyArray<{ day: number; spent: number }>;
  priorPeriodBurn: number;
}

export async function fetchBurnHistory(_accountId: string): Promise<BurnHistory> {
  void _accountId;
  return {
    history: [...burnHistory],
    priorPeriodBurn,
  };
}
