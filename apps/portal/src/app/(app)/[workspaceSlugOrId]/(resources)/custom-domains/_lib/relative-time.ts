/**
 * Compact relative-time formatter for the Custom Domains surface.
 * Reads `Date.now()` directly so cells stay correct across re-renders without
 * threading a `now` reference through every prop.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export function formatRelative(iso: string | null): string {
  if (iso === null) return "—";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const delta = Date.now() - then;
  if (delta < MINUTE) return "just now";
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)} min ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h ago`;
  if (delta < MONTH) return `${Math.floor(delta / DAY)}d ago`;
  if (delta < YEAR) return `${Math.floor(delta / MONTH)}mo ago`;
  return `${Math.floor(delta / YEAR)}y ago`;
}

export function formatAbsoluteUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `${date} · ${time} UTC`;
}
