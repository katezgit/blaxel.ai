"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type AccountAdmin,
  type AccountState,
  type AddOn,
  type AddOnId,
  type AutoTopUp,
  type DomainPolicy,
  type LowBalanceAlert,
  type MonthlyTopUp,
  type SamlConfiguration,
  type Tier,
  seedForTier,
} from "@/lib/mock/account";

const TIER_STORAGE_KEY = "portal:mock-tier";

const STREAM_INTERVAL_MS = 4500;
const STREAM_MAX_DRIFT = 0.04;

interface AccountContextValue {
  state: AccountState;
  setTier: (tier: Tier) => void;
  setAutoTopUp: (next: AutoTopUp) => void;
  setMonthlyTopUp: (next: MonthlyTopUp) => void;
  setLowBalanceAlert: (next: LowBalanceAlert) => void;
  toggleAddOn: (id: AddOnId) => void;
  addAdmin: (admin: AccountAdmin) => void;
  removeAdmin: (id: string) => void;
  restoreAdmin: (admin: AccountAdmin, index: number) => void;
  addDomain: (domain: string) => void;
  verifyDomain: (id: string) => void;
  setDomainMethod: (
    id: string,
    method: NonNullable<DomainPolicy["enforcedMethod"]>,
  ) => void;
  removeDomain: (id: string) => void;
  saveSaml: (config: SamlConfiguration) => void;
}

const AccountContext = createContext<AccountContextValue | null>(null);

interface AccountProviderProps {
  children: ReactNode;
}

function isTier(value: unknown): value is Tier {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

function parseStoredTier(raw: string | null): Tier | null {
  if (raw == null) return null;
  const parsed = Number(raw);
  return isTier(parsed) ? parsed : null;
}

export function AccountStateProvider({ children }: AccountProviderProps) {
  const [state, setState] = useState<AccountState>(() => seedForTier(0));

  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const url = new URL(window.location.href);
    const query = url.searchParams.get("tier");
    const stored = parseStoredTier(window.localStorage.getItem(TIER_STORAGE_KEY));
    const parsedQuery = parseStoredTier(query);
    const initial = parsedQuery ?? stored ?? 0;
    if (initial !== 0) {
      setState(seedForTier(initial));
    }
    if (parsedQuery !== null) {
      window.localStorage.setItem(TIER_STORAGE_KEY, String(parsedQuery));
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((prev) => {
        const drift = (Math.random() - 0.5) * 2 * STREAM_MAX_DRIFT;
        const next = Math.max(0, prev.balanceUsd + drift);
        return { ...prev, balanceUsd: next };
      });
    }, STREAM_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  const setTier = useCallback((next: Tier) => {
    setState(seedForTier(next));
    window.localStorage.setItem(TIER_STORAGE_KEY, String(next));
  }, []);

  const setAutoTopUp = useCallback((next: AutoTopUp) => {
    setState((prev) => ({ ...prev, autoTopUp: next }));
  }, []);

  const setMonthlyTopUp = useCallback((next: MonthlyTopUp) => {
    setState((prev) => ({ ...prev, monthlyTopUp: next }));
  }, []);

  const setLowBalanceAlert = useCallback((next: LowBalanceAlert) => {
    setState((prev) => ({ ...prev, lowBalanceAlert: next }));
  }, []);

  const toggleAddOn = useCallback((id: AddOnId) => {
    setState((prev) => ({
      ...prev,
      addons: prev.addons.map((addon: AddOn) =>
        addon.id === id ? { ...addon, active: !addon.active } : addon,
      ),
    }));
  }, []);

  const addAdmin = useCallback((admin: AccountAdmin) => {
    setState((prev) => ({ ...prev, admins: [...prev.admins, admin] }));
  }, []);

  const removeAdmin = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      admins: prev.admins.filter((admin) => admin.id !== id),
    }));
  }, []);

  const restoreAdmin = useCallback((admin: AccountAdmin, index: number) => {
    setState((prev) => {
      const next = prev.admins.slice();
      // clamp index so splice never throws on a stale position
      const clamped = Math.min(Math.max(index, 0), next.length);
      next.splice(clamped, 0, admin);
      return { ...prev, admins: next };
    });
  }, []);

  const addDomain = useCallback((domain: string) => {
    const id = `dom_${domain.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}`;
    const txtRecord = `blaxel-verify=${Math.random().toString(36).slice(2, 14)}`;
    setState((prev) => ({
      ...prev,
      domains: [
        ...prev.domains,
        {
          id,
          domain,
          verification: "pending",
          enforcedMethod: null,
          txtRecord,
        },
      ],
    }));
  }, []);

  const verifyDomain = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      domains: prev.domains.map((domain) =>
        domain.id === id
          ? { ...domain, verification: "verified", enforcedMethod: "Any" }
          : domain,
      ),
    }));
  }, []);

  const setDomainMethod = useCallback(
    (id: string, method: NonNullable<DomainPolicy["enforcedMethod"]>) => {
      setState((prev) => ({
        ...prev,
        domains: prev.domains.map((domain) =>
          domain.id === id ? { ...domain, enforcedMethod: method } : domain,
        ),
      }));
    },
    [],
  );

  const removeDomain = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      domains: prev.domains.filter((domain) => domain.id !== id),
    }));
  }, []);

  const saveSaml = useCallback((config: SamlConfiguration) => {
    setState((prev) => ({ ...prev, saml: config }));
  }, []);

  const value = useMemo<AccountContextValue>(
    () => ({
      state,
      setTier,
      setAutoTopUp,
      setMonthlyTopUp,
      setLowBalanceAlert,
      toggleAddOn,
      addAdmin,
      removeAdmin,
      restoreAdmin,
      addDomain,
      verifyDomain,
      setDomainMethod,
      removeDomain,
      saveSaml,
    }),
    [
      state,
      setTier,
      setAutoTopUp,
      setMonthlyTopUp,
      setLowBalanceAlert,
      toggleAddOn,
      addAdmin,
      removeAdmin,
      restoreAdmin,
      addDomain,
      verifyDomain,
      setDomainMethod,
      removeDomain,
      saveSaml,
    ],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccountState(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error(
      "useAccountState must be used within AccountStateProvider",
    );
  }
  return ctx;
}
