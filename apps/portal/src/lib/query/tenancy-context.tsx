"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface Tenancy {
  accountId: string;
  workspaceId: string;
}

const TenancyContext = createContext<Tenancy | null>(null);

interface TenancyProviderProps {
  value: Tenancy;
  children: ReactNode;
}

export function TenancyProvider({ value, children }: TenancyProviderProps) {
  return (
    <TenancyContext.Provider value={value}>{children}</TenancyContext.Provider>
  );
}

export function useCurrentTenancy(): Tenancy {
  const ctx = useContext(TenancyContext);
  if (!ctx) {
    throw new Error(
      "useCurrentTenancy must be used within a TenancyProvider — wrap the (app) / (manage) shell.",
    );
  }
  return ctx;
}
