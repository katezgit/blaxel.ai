import type { ServiceAccount, ServiceAccountApiKey } from "@/lib/mock/types";

const MIN_MS = 60_000;
const HR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HR_MS;
const WK_MS = 7 * DAY_MS;
const MO_MS = 30 * DAY_MS;
const YR_MS = 365 * DAY_MS;

/** "143 days", "8 months", "2 yrs" — coarse human age used in the list. */
export function formatAgeFromIso(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const delta = Math.max(0, Date.now() - then);
  if (delta < DAY_MS) return "today";
  if (delta < MO_MS) return `${Math.floor(delta / DAY_MS)} days`;
  if (delta < YR_MS) return `${Math.floor(delta / MO_MS)} months`;
  return `${Math.floor(delta / YR_MS)} yrs`;
}

/** "2 hrs ago", "12 min ago", "just now". Null reads as "—" (no signal). */
export function formatRelativePast(iso: string | null): string {
  if (iso === null) return "—";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const delta = Math.max(0, Date.now() - then);
  if (delta < MIN_MS) return "just now";
  if (delta < HR_MS) return `${Math.floor(delta / MIN_MS)} min ago`;
  if (delta < DAY_MS) return `${Math.floor(delta / HR_MS)} hrs ago`;
  if (delta < WK_MS) return `${Math.floor(delta / DAY_MS)} days ago`;
  if (delta < MO_MS) return `${Math.floor(delta / WK_MS)} wks ago`;
  if (delta < YR_MS) return `${Math.floor(delta / MO_MS)} mo ago`;
  return `${Math.floor(delta / YR_MS)} yrs ago`;
}

/** Detail page Created field — `MMM D, YYYY · HH:mm UTC`. */
export function formatCreatedAtUtc(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `${dateFmt.format(date)} · ${timeFmt.format(date)} UTC`;
}

/** Keys table Created at column — short date only. */
export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Window per spec §6.4 — keys expiring within 14 days render in warning state. */
export const EXPIRY_WARN_DAYS = 14;

export type ExpiryClass = "never" | "expired" | "near" | "future";

export function classifyExpiry(expiresAt: string | null): ExpiryClass {
  if (!expiresAt) return "never";
  const days = daysUntil(expiresAt);
  if (days <= 0) return "expired";
  if (days <= EXPIRY_WARN_DAYS) return "near";
  return "future";
}

export function daysUntil(isoDate: string): number {
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / DAY_MS);
}

/** "87 days", "Expired", "No expiration" — keys table "Expires in" cell. */
export function formatExpiresIn(expiresAt: string | null): string {
  const kind = classifyExpiry(expiresAt);
  if (kind === "never") return "No expiration";
  if (kind === "expired") return "Expired";
  const days = daysUntil(expiresAt as string);
  return days === 1 ? "1 day" : `${days} days`;
}

/**
 * Oldest-key age across an SA's keys. Returns null when the SA has no keys
 * (list column then renders "—"). Uses the key's createdAt — not expiry.
 */
export function oldestKeyAgeFor(sa: ServiceAccount): string | null {
  const first = sa.apiKeys[0];
  if (!first) return null;
  const oldest = sa.apiKeys.reduce<ServiceAccountApiKey>(
    (acc, k) => (Date.parse(k.createdAt) < Date.parse(acc.createdAt) ? k : acc),
    first,
  );
  return formatAgeFromIso(oldest.createdAt);
}
