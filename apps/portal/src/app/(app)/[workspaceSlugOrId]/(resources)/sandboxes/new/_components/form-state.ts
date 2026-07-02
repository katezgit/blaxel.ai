// Single source of truth for the Create-Sandbox flow form. All three steps
// read from / write to this shape; the parent owns it and passes a
// `value + onChange` down to each step body. URL `?step=` drives which
// step body is mounted.
//
// Shape mirrors `Sandbox.spec` so the snippet builders + summary rail can
// project from it without per-step adapters.

import type { SandboxRegion } from "@/lib/mock/sandboxes";
import type { SandboxImage } from "@/lib/mock/sandbox-images";

export type CreateStep = "image" | "resources" | "confirm";

export interface EnvVar {
  id: string;
  name: string;
  value: string;
}

export interface AttachedVolume {
  id: string;
  name: string;
  region: SandboxRegion | "auto";
}

export type SandboxTtl = "none" | "1d" | "7d" | "30d";

export interface CreateFormState {
  imageRef: string | null;
  memoryMib: 2048 | 4096 | 8192 | 16384;
  ttl: SandboxTtl;
  region: SandboxRegion;
  volumes: ReadonlyArray<AttachedVolume>;
  envVars: ReadonlyArray<EnvVar>;
  displayName: string;
  sandboxName: string;
}

export const INITIAL_STATE: CreateFormState = {
  imageRef: null,
  memoryMib: 2048,
  ttl: "none",
  region: "auto",
  volumes: [],
  envVars: [],
  displayName: "",
  sandboxName: "",
};

const MEMORY_OPTIONS = [2048, 4096, 8192, 16384] as const;

export function isValidMemory(value: number): value is CreateFormState["memoryMib"] {
  return (MEMORY_OPTIONS as ReadonlyArray<number>).includes(value);
}

export function readStepParam(value: string | null): CreateStep {
  if (value === "resources" || value === "confirm") return value;
  return "image";
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 49);
}

const NAME_PATTERN = /^[a-z0-9][a-z0-9-]{0,48}$/;

export function isValidSandboxName(name: string): boolean {
  return NAME_PATTERN.test(name);
}

/** Hydrates the form with image-driven defaults (memory etc.) without
 * stomping fields the user has already touched. */
export function applyImageDefaults(
  state: CreateFormState,
  image: SandboxImage | undefined,
  hasUserChangedMemory: boolean,
): CreateFormState {
  if (!image) return state;
  if (hasUserChangedMemory) return state;
  return { ...state, memoryMib: image.defaultMemoryMib };
}
