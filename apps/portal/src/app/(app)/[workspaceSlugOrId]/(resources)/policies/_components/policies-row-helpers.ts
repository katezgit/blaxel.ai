/**
 * Row-level display helpers for the Policies list table. Pure functions —
 * each takes the canonical `Policy` shape (or a sub-field) and returns the
 * exact string the cell renders. Kept colocated with the table so the
 * governance-inventory column language stays in one place.
 */

import type {
  Policy,
  PolicyFlavor,
  PolicyLocation,
  PolicyMaxTokens,
  PolicyResourceType,
  PolicyUsageCounts,
} from "@/lib/mock/policies";
import { resourceTypeLabel } from "@/lib/mock/policies";

// Frozen anchor so relative timestamps reproduce across screenshots. Matches
// the convention in `lib/mock/notifications.ts` (separate anchor — policies
// fixtures live in mid-2026, notifications fixtures in mid-2026 too).
const MOCK_NOW = new Date("2026-06-22T15:30:00Z");

export function ruleSummary(policy: Policy): string {
  const { spec } = policy;
  if (spec.type === "location") {
    return locationRule(spec.locations ?? []);
  }
  if (spec.type === "maxToken") {
    return tokenCapRule(spec.maxTokens);
  }
  return flavorRule(spec.flavors ?? []);
}

function locationRule(locations: ReadonlyArray<PolicyLocation>): string {
  if (locations.length === 0) return "Location · —";
  const first = locations[0]!.name;
  if (locations.length === 1) return `Location · ${first}`;
  return `Location · ${first} +${locations.length - 1} more`;
}

function tokenCapRule(maxTokens: PolicyMaxTokens | undefined): string {
  if (!maxTokens) return "Token cap · —";
  const dominant =
    maxTokens.total > 0
      ? maxTokens.total
      : Math.max(maxTokens.input, maxTokens.output);
  const value = formatTokenCount(dominant);
  const window = formatWindow(maxTokens.granularity, maxTokens.step);
  return `Token cap · ${value} / ${window}`;
}

function flavorRule(flavors: ReadonlyArray<PolicyFlavor>): string {
  if (flavors.length === 0) return "Flavor · —";
  const first = `${flavors[0]!.type.toUpperCase()} ${flavors[0]!.name}`;
  if (flavors.length === 1) return `Flavor · ${first}`;
  return `Flavor · ${first} +${flavors.length - 1} more`;
}

function formatTokenCount(n: number): string {
  if (n >= 1_000_000_000) return trimZero(n / 1_000_000_000) + "B";
  if (n >= 1_000_000) return trimZero(n / 1_000_000) + "M";
  if (n >= 1_000) return trimZero(n / 1_000) + "k";
  return String(n);
}

// 2_000_000 → "2", 2_500_000 → "2.5", 1_500_000_000 → "1.5"
function trimZero(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function formatWindow(
  granularity: PolicyMaxTokens["granularity"],
  step: number,
): string {
  if (step === 1) return granularity;
  return `${step} ${granularity}`;
}

export function appliesToLabel(
  resourceTypes: ReadonlyArray<PolicyResourceType>,
): string {
  if (resourceTypes.length === 0) return "—";
  return resourceTypes.map(resourceTypeLabel).join(" · ");
}

export interface AttachedResourcesSummary {
  /** `Unused` flag — render as a single muted word. */
  unused: boolean;
  /** Pre-joined display string when `unused` is false. */
  label: string;
}

export function attachedResourcesLabel(
  usage: PolicyUsageCounts,
): AttachedResourcesSummary {
  const parts: Array<{ count: number; label: string }> = [];
  if (usage.agents > 0) parts.push({ count: usage.agents, label: "Agent" });
  if (usage.models > 0) parts.push({ count: usage.models, label: "Model API" });
  if (usage.functions > 0)
    parts.push({ count: usage.functions, label: "MCP Server" });
  if (usage.sandboxes > 0)
    parts.push({ count: usage.sandboxes, label: "Sandbox" });
  if (usage.jobs > 0) parts.push({ count: usage.jobs, label: "Job" });

  if (parts.length === 0) return { unused: true, label: "Unused" };

  if (parts.length > 3) {
    const total = parts.reduce((sum, part) => sum + part.count, 0);
    return {
      unused: false,
      label: `${total} resources across ${parts.length} kinds`,
    };
  }
  return {
    unused: false,
    label: parts.map((part) => pluralize(part.count, part.label)).join(" · "),
  };
}

function pluralize(count: number, singular: string): string {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

export function relativeUpdated(iso: string): string {
  const diffMs = MOCK_NOW.getTime() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(days / 365);
  return `${years}y ago`;
}

export function fullTimestamp(iso: string): string {
  return new Date(iso).toUTCString();
}
