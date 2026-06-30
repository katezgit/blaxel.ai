// Pure helpers for the Sandboxes list cells. Region label / TTL countdown /
// image-ref formatting kept here so the table column defs stay declarative.

import type { Sandbox, SandboxRegion } from "@/lib/mock/sandboxes";

const REGION_LABEL: Record<SandboxRegion, string> = {
  auto: "auto",
  "eu-fra-1": "eu-fra-1",
  "eu-lon-1": "eu-lon-1",
  "us-was-1": "us-was-1",
  "us-pdx-1": "us-pdx-1",
};

export function regionLabel(region: SandboxRegion): string {
  return REGION_LABEL[region];
}

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
  // Wireframe: red when < 24h.
  if (expiresInSec === null) return false;
  return expiresInSec < 86_400;
}
