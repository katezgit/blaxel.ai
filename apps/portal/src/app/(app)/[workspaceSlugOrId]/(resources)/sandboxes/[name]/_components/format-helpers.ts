// Pure formatters for the Sandbox detail Tier-1 surface. Time-ago + TTL
// urgency + image-with-SHA label live here so the band components stay
// declarative. All pure — no React imports.

import type { Sandbox } from "@/lib/mock/sandboxes";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/** Compact relative-time form used in page-header meta rows ("2h ago",
 * "30s ago", "5d ago"). Mirrors the Models detail variant — kept local to
 * avoid cross-route `_components/` imports. */
export function formatRelative(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const delta = Date.now() - then;
  if (delta < MINUTE) {
    const s = Math.max(1, Math.floor(delta / 1_000));
    return `${s}s ago`;
  }
  if (delta < HOUR) {
    return `${Math.floor(delta / MINUTE)}m ago`;
  }
  if (delta < DAY) {
    return `${Math.floor(delta / HOUR)}h ago`;
  }
  if (delta < MONTH) {
    return `${Math.floor(delta / DAY)}d ago`;
  }
  if (delta < YEAR) {
    return `${Math.floor(delta / MONTH)}mo ago`;
  }
  return `${Math.floor(delta / YEAR)}y ago`;
}

/** Image string for the meta row: `name@<6-char SHA prefix>`. No trailing
 * ellipsis — the prefix carries the signal; the meta row is single line
 * and truncates on overflow. */
export function imageWithShaLabel(image: Sandbox["spec"]["image"]): string {
  return `${image.name}@${image.sha.slice(0, 6)}`;
}

/** Memory label for the meta row: `4096 MiB RAM` or `4 GiB RAM`. */
export function memoryLabel(memoryMib: number): string {
  if (memoryMib >= 1024 && memoryMib % 1024 === 0) {
    return `${memoryMib / 1024} GiB RAM`;
  }
  return `${memoryMib} MiB RAM`;
}

export type TtlUrgency = "quiet" | "warning" | "error" | "none";

/** Urgency thresholds per wireframe §1.1.1:
 *   - `> 1h` or `null` → quiet
 *   - `≤ 1h && > 10m` → warning
 *   - `≤ 10m` → error
 */
export function ttlUrgency(expiresInSec: number | null): TtlUrgency {
  if (expiresInSec === null) return "none";
  if (expiresInSec > HOUR / 1_000) return "quiet";
  if (expiresInSec > 10 * (MINUTE / 1_000)) return "warning";
  return "error";
}

/** Pill content per wireframe §1.1: `22h 45m 6s`, `42m 18s`, `9m 12s`.
 * Includes seconds at all granularities so the countdown visibly ticks. */
export function ttlPillLabel(expiresInSec: number | null): string {
  if (expiresInSec === null) return "—";
  const days = Math.floor(expiresInSec / 86_400);
  const hours = Math.floor((expiresInSec % 86_400) / 3_600);
  const minutes = Math.floor((expiresInSec % 3_600) / 60);
  const seconds = Math.floor(expiresInSec % 60);
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
