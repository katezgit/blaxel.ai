export type ExpiryOption = "7d" | "30d" | "90d" | "1y" | "never";

export const EXPIRY_OPTIONS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "1y", label: "1 year" },
  { value: "never", label: "No expiration" },
] as const satisfies ReadonlyArray<{ value: ExpiryOption; label: string }>;

const DAY_MS = 86_400_000;

const EXPIRY_DAYS: Record<Exclude<ExpiryOption, "never">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

/** Maps the form option to an ISO date or null (no expiration). */
export function expiresInToIsoDate(option: ExpiryOption): string | null {
  if (option === "never") return null;
  return new Date(Date.now() + EXPIRY_DAYS[option] * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export function randomSecret(byteCount: number): string {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < byteCount; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/** Mock full API key value — `bxl_k_<24 hex>`. Only ever shown once. */
export function randomKeyValue(): string {
  return `bxl_k_${randomSecret(24)}`;
}
