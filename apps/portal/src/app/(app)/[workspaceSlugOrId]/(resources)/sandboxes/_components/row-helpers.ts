// Pure helpers for the Sandboxes list cells. TTL countdown / image-ref / RAM
// / created-at formatting kept here so the table column defs stay
// declarative. (Region formatting lives in the shared `@/lib/regions` helper
// so it stays consistent with Custom Domains and any future region-bearing
// surface.)

import type { Sandbox } from "@/lib/mock/sandboxes";

export function imageRefLabel(image: Sandbox["spec"]["image"]): string {
  // Display short form: `<name>@<sha-prefix>…` — the wireframe uses 4-char
  // SHA prefixes; the fixtures store 8 chars so we trim.
  const shortSha = image.sha.slice(0, 4);
  return `${image.name}@${shortSha}…`;
}

export function expiresInLabel(expiresInSec: number | null): string {
  if (expiresInSec === null) return "—";
  const days = Math.floor(expiresInSec / 86_400);
  const hours = Math.floor((expiresInSec % 86_400) / 3_600);
  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  if (hours > 0) {
    const minutes = Math.floor((expiresInSec % 3_600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  const minutes = Math.floor(expiresInSec / 60);
  return `${minutes}m`;
}

export function isExpiresInWarning(expiresInSec: number | null): boolean {
  // Wireframe §1.3: expiry badge appears on the Name cell when < 24h.
  if (expiresInSec === null) return false;
  return expiresInSec < 86_400;
}

/**
 * Compact expiry label for the inline `⚠ Nh` badge on the Name cell.
 * Always renders in hours (or minutes when < 1h) — a bare "22h" reads faster
 * than "22h 45m" at glance-scale on a dense row.
 */
export function expiresInBadgeLabel(expiresInSec: number): string {
  const hours = Math.floor(expiresInSec / 3_600);
  if (hours >= 1) return `${hours}h`;
  const minutes = Math.max(1, Math.floor(expiresInSec / 60));
  return `${minutes}m`;
}

/** Allocated RAM cell — `4096 MB` / `2048 MB` etc. Wireframe reads MB in
 * the header + cell to match production; underlying data is MiB. */
export function allocatedRamLabel(memoryMib: number): string {
  return `${memoryMib.toLocaleString("en-US")} MB`;
}

/** Peak RAM (24h) cell — `569 MB (13%)`. Percentage is peak vs allocated.
 * Returns `null` when we have no signal to render (Deploying / never
 * active / no strip data). */
export function peakRamCell(
  sandbox: Pick<Sandbox, "vitals" | "spec">,
): { label: string; percent: number } | null {
  const { peakRamGiB, ramStrip } = sandbox.vitals;
  const allocMib = sandbox.spec.memoryMib;
  if (!ramStrip || peakRamGiB <= 0 || allocMib <= 0) return null;
  const peakMib = Math.round(peakRamGiB * 1024);
  const percent = Math.round((peakMib / allocMib) * 100);
  return {
    label: `${peakMib.toLocaleString("en-US")} MB (${percent}%)`,
    percent,
  };
}

/** Absolute created-at label in workspace-local time. ISO input; output
 * `YYYY-MM-DD HH:mm` per wireframe §1.3. */
export function createdAtLabel(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

/**
 * Normalize a ram/cpu strip (5-12 fractional [0,1] values) into exactly 12
 * bars for the Activity sparkline. Repeats the last value if the source
 * strip is shorter — keeps geometry stable across rows so the sparkline
 * column reads as one visual set. Returns null when no strip data (row
 * shows `—`).
 */
export function activityBarsFor(
  strip: ReadonlyArray<number> | null,
): ReadonlyArray<number> | null {
  if (!strip || strip.length === 0) return null;
  const TARGET = 12;
  const bars: Array<number> = [];
  for (let i = 0; i < TARGET; i += 1) {
    const idx = Math.min(
      strip.length - 1,
      Math.round((i / (TARGET - 1)) * (strip.length - 1)),
    );
    bars.push(Math.max(0.06, Math.min(1, strip[idx]!)));
  }
  return bars;
}
