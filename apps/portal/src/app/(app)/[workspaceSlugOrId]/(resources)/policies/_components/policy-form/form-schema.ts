import { z } from "zod";
import { Cpu, GaugeCircle, MapPin, type LucideIcon } from "lucide-react";
import type {
  MaxTokenGranularity,
  PolicyResourceType,
  PolicyType,
} from "@/lib/mock/policies";

// ─── Policy type catalog ─────────────────────────────────────────────────────

export interface PolicyTypeOption {
  value: PolicyType;
  label: string;
  hint: string;
  /** One-sentence narrative subtitle for the detail header. */
  narrative: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const POLICY_TYPE_OPTIONS: ReadonlyArray<PolicyTypeOption> = [
  {
    value: "location",
    label: "Location",
    hint: "Continent or country allow-list.",
    narrative:
      "Restricts attached workloads to a continent or country allow-list — requests outside these locations are denied.",
    icon: MapPin,
  },
  {
    value: "maxToken",
    label: "Token usage",
    hint: "Per-period token cap.",
    narrative:
      "Caps token consumption for attached workloads per window — requests over the cap receive 429.",
    icon: GaugeCircle,
  },
  {
    value: "flavor",
    label: "Flavor",
    hint: "CPU type allow-list.",
    narrative:
      "Restricts attached workloads to an allow-listed set of hardware flavors — schedules on other hardware are denied.",
    icon: Cpu,
    disabled: true,
  },
];

export const POLICY_TYPE_BY_VALUE: Record<PolicyType, PolicyTypeOption> =
  POLICY_TYPE_OPTIONS.reduce(
    (acc, option) => {
      acc[option.value] = option;
      return acc;
    },
    {} as Record<PolicyType, PolicyTypeOption>,
  );

// ─── Resource type catalog ───────────────────────────────────────────────────

export const RESOURCE_TYPE_OPTIONS: ReadonlyArray<{
  value: PolicyResourceType;
  label: string;
}> = [
  { value: "agent", label: "Agents" },
  { value: "model", label: "Model APIs" },
  { value: "function", label: "MCP Servers" },
  { value: "sandbox", label: "Sandboxes" },
  { value: "application", label: "Applications" },
];

// ─── Granularity catalog (for maxToken body) ─────────────────────────────────

export const GRANULARITY_OPTIONS: ReadonlyArray<{
  value: MaxTokenGranularity;
  label: string;
}> = [
  { value: "month", label: "Month" },
  { value: "day", label: "Day" },
  { value: "hour", label: "Hour" },
  { value: "minute", label: "Minute" },
];

// ─── Form schema — shared between Create and Edit wrappers ───────────────────

// Labels — Record<string, string> on the wire; the form holds them as an
// ordered array so add/remove/reorder stay stable and useFieldArray can drive
// the editor without churning React keys.
export const labelEntrySchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Key is required.")
    .max(63, "Max 63 characters.")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, digits, and hyphens only."),
  value: z
    .string()
    .trim()
    .min(1, "Value is required.")
    .max(63, "Max 63 characters."),
});

export type LabelEntry = z.infer<typeof labelEntrySchema>;

export const policyFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required.")
    .max(64, "Max 64 characters."),
  name: z
    .string()
    .trim()
    .min(1, "Policy name is required.")
    .max(64, "Max 64 characters.")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, digits, and hyphens only."),
  resourceTypes: z
    .array(z.enum(["agent", "model", "function", "sandbox", "application"]))
    .min(1, "Select at least one target."),
  policyType: z.enum(["location", "maxToken", "flavor"]),
  labels: z.array(labelEntrySchema).refine(
    (rows) => {
      const keys = rows.map((row) => row.key.trim()).filter((k) => k.length > 0);
      return new Set(keys).size === keys.length;
    },
    { message: "Label keys must be unique." },
  ),
});

export type PolicyFormValues = z.infer<typeof policyFormSchema>;

// ─── Labels helpers — Record<->Array conversion at the form boundary ─────────

export function labelsRecordToEntries(
  record: Record<string, string> | undefined,
): ReadonlyArray<LabelEntry> {
  if (!record) return [];
  return Object.entries(record).map(([key, value]) => ({ key, value }));
}

export function labelsEntriesToRecord(
  entries: ReadonlyArray<LabelEntry>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { key, value } of entries) {
    const k = key.trim();
    if (k.length === 0) continue;
    out[k] = value.trim();
  }
  return out;
}

// ─── Body-editor types (local component state, not part of RHF schema) ───────

export interface LocationItem {
  type: "continent" | "country";
  name: string;
}

export interface TokenLimits {
  input: number;
  output: number;
  total: number;
  step: number;
  granularity: MaxTokenGranularity;
}

// Option set mirrors production: 3 entries total, alphabetical within each group.
export const SAMPLE_LOCATIONS: ReadonlyArray<LocationItem> = [
  { type: "continent", name: "Europe" },
  { type: "continent", name: "North America" },
  { type: "country", name: "United States of America" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function readPolicyTypeParam(value: string | null): PolicyType | null {
  if (value === "location" || value === "maxToken" || value === "flavor") {
    return value;
  }
  if (value === "tokenusage" || value === "tokenUsage") return "maxToken";
  return null;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
