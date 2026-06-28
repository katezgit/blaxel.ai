import type { Integration, IntegrationConnection } from "@/lib/mock/types";

// Brand logos served via Iconify's simple-icons proxy. The `?color=` query
// is applied to `currentColor` paths in the SVG, baking a brand-accurate
// fill into the served file — so the same URL renders correctly on both
// light and dark surfaces without a CSS filter at the call site. Hexes
// come from simple-icons' published metadata (simpleicons.org) unless an
// adjustment is needed for legibility against the card surface
// (`#FFFFFF` light / `#191924` dark) — adjustments are flagged inline.
// Entries without a clean simple-icons match (AgentMail, Airweave, Blaxel
// Search, Context7, Exa, Cerebras, Cohere, Groq) omit `logoUrl` and fall
// back to the letter monogram.
const logo = (slug: string, hex: string) =>
  `https://api.iconify.design/simple-icons:${slug}.svg?color=%23${hex}`;

const FIXTURES: ReadonlyArray<Integration> = [
  { id: "agentmail", name: "AgentMail", description: "Programmable email inboxes for agents.", category: "mcp-server", logoInitial: "A" },
  { id: "airweave", name: "Airweave", description: "Sync structured data from SaaS apps.", category: "mcp-server", logoInitial: "A" },
  // anthropic: published hex `191919` is invisible on dark card; using the
  // brand coral from anthropic.com instead — closer to the marketing palette.
  { id: "anthropic", name: "Anthropic", description: "Claude models via the official API.", category: "model", logoInitial: "A", logoUrl: logo("anthropic", "D97757") },
  { id: "aws-bedrock", name: "AWS Bedrock", description: "Managed access to foundation models on AWS.", category: "model", logoInitial: "A", logoUrl: logo("amazonwebservices", "FF9900") },
  { id: "aws-s3", name: "AWS S3", description: "Read/write object storage.", category: "mcp-server", logoInitial: "S", logoUrl: logo("amazonwebservices", "FF9900") },
  { id: "aws-ses", name: "AWS SES", description: "Send transactional email from agents.", category: "mcp-server", logoInitial: "S", logoUrl: logo("amazonwebservices", "FF9900") },
  { id: "azure-ai", name: "Azure AI Inference", description: "Microsoft-hosted inference endpoints.", category: "model", logoInitial: "Z", logoUrl: logo("microsoftazure", "0078D4") },
  { id: "azure-mp", name: "Azure Marketplace", description: "Marketplace-procured Azure resources.", category: "mcp-server", logoInitial: "Z", logoUrl: logo("microsoftazure", "0078D4") },
  { id: "blaxel-search", name: "Blaxel Search", description: "First-party web search for agents.", category: "mcp-server", logoInitial: "B" },
  { id: "brave-search", name: "Brave Search", description: "Independent index with low-noise results.", category: "mcp-server", logoInitial: "B", logoUrl: logo("brave", "FB542B") },
  { id: "cerebras", name: "Cerebras", description: "Wafer-scale fast inference.", category: "model", logoInitial: "C" },
  { id: "cloudflare", name: "Cloudflare", description: "Edge cache, KV, and AI gateways.", category: "mcp-server", logoInitial: "C", logoUrl: logo("cloudflare", "F38020") },
  { id: "cohere", name: "Cohere", description: "Command + Rerank models.", category: "model", logoInitial: "C" },
  { id: "context7", name: "Context7", description: "Up-to-date docs for popular libraries.", category: "mcp-server", logoInitial: "C" },
  { id: "dall-e", name: "Dall-E", description: "OpenAI image generation.", category: "model", logoInitial: "D", logoUrl: logo("openai", "412991") },
  { id: "deepseek", name: "DeepSeek", description: "DeepSeek V3 and reasoning models.", category: "model", logoInitial: "D", logoUrl: logo("deepseek", "4D6BFE") },
  { id: "discord", name: "Discord", description: "Read messages, send replies in channels.", category: "mcp-server", logoInitial: "D", logoUrl: logo("discord", "5865F2") },
  { id: "exa", name: "Exa", description: "Neural search built for agents.", category: "mcp-server", logoInitial: "E" },
  { id: "gemini", name: "Gemini", description: "Google's Gemini family of models.", category: "model", logoInitial: "G", logoUrl: logo("googlegemini", "8E75B2") },
  // github: published hex `181717` disappears against the dark card surface
  // (`#191924`). Substituting a neutral mid-gray that survives both light
  // (#FFF) and dark backgrounds; brand recognition rides on the octocat shape.
  { id: "github", name: "GitHub", description: "Read repos, open issues, create PRs.", category: "mcp-server", logoInitial: "G", logoUrl: logo("github", "737373") },
  { id: "gitlab", name: "GitLab", description: "GitLab projects, MRs, and issues.", category: "mcp-server", logoInitial: "G", logoUrl: logo("gitlab", "FC6D26") },
  { id: "gmail", name: "Gmail", description: "Read and send Gmail on behalf of a user.", category: "mcp-server", logoInitial: "G", logoUrl: logo("gmail", "EA4335") },
  { id: "google-calendar", name: "Google Calendar", description: "Read and create calendar events.", category: "mcp-server", logoInitial: "G", logoUrl: logo("googlecalendar", "4285F4"), comingSoon: true },
  { id: "google-docs", name: "Google Docs", description: "Edit Google Docs as a structured surface.", category: "mcp-server", logoInitial: "G", logoUrl: logo("googledocs", "4285F4"), comingSoon: true },
  { id: "groq", name: "Groq", description: "Ultra-low-latency LPU inference.", category: "model", logoInitial: "G" },
  { id: "mistral", name: "Mistral", description: "Mistral and Mixtral models via API.", category: "model", logoInitial: "M", logoUrl: logo("mistralai", "FA520F") },
  { id: "openai", name: "OpenAI", description: "GPT-4 family of models.", category: "model", logoInitial: "O", logoUrl: logo("openai", "412991") },
  // slack: brand aubergine `4A154B` is too dark against the dark card; using
  // the lifted aubergine `611F69` that Slack also publishes in its palette.
  { id: "slack", name: "Slack", description: "Read channels, send messages, respond to mentions.", category: "mcp-server", logoInitial: "S", logoUrl: logo("slack", "611F69") },
];

const DAY_MS = 86400000;

const isoDate = (offsetDays: number): string =>
  new Date(Date.now() + offsetDays * DAY_MS).toISOString();

// Deterministic 4-char suffix from a seed string — keeps the masked tail
// stable across reloads so the operator's screenshots reproduce.
const suffix = (seed: string): string => {
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += ALPHABET[hash % ALPHABET.length];
    hash = Math.floor(hash / ALPHABET.length) + i * 17;
  }
  return out;
};

// Brand prefix shapes mirror each provider's public key format. Anthropic uses
// `sk-ant-…`, OpenAI uses `sk-…`, AgentMail uses `am_…`. Generic fallback for
// providers we haven't seen a key shape for is `sk_…`.
const keyPrefix = (providerId: string): string => {
  if (providerId === "anthropic") return "sk-ant-";
  if (providerId === "openai") return "sk-";
  if (providerId === "agentmail") return "am_";
  return "sk_";
};

const makeConnection = (
  providerId: string,
  name: string,
  ageDays: number,
  createdBy?: string,
): IntegrationConnection => ({
  id: name,
  providerId,
  apiKeyPreview: `${keyPrefix(providerId)}••••••${suffix(`${providerId}:${name}`)}`,
  createdAt: isoDate(-ageDays),
  createdBy,
});

// Seeded fixtures — Anthropic carries the load (production + staging + a small
// eval rotation) to make the most-common shape (one provider, several envs)
// legible at a glance. OpenAI shows the second-most-common shape (two service
// accounts). AgentMail shows the MCP-server connection shape.
const CONNECTIONS: ReadonlyArray<IntegrationConnection> = [
  makeConnection("anthropic", "anthropic-prod", 87, "runtime-orchestrator"),
  makeConnection("anthropic", "anthropic-staging", 62, "Maya Reyes"),
  makeConnection("anthropic", "anthropic-eval-01", 30, "staging-eval-harness"),
  makeConnection("anthropic", "anthropic-eval-02", 28, "staging-eval-harness"),
  makeConnection("anthropic", "anthropic-experimental", 5, "Avery Lin"),
  makeConnection("openai", "openai-prod", 124, "runtime-orchestrator"),
  makeConnection("openai", "openai-staging", 91, "Maya Reyes"),
  makeConnection("openai", "openai-eval", 21, "staging-eval-harness"),
  makeConnection("agentmail", "agentmail-support", 41, "Maya Reyes"),
  makeConnection("agentmail", "agentmail-marketing", 14, "Avery Lin"),
];

export default async function fetchWorkspaceIntegrations(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<Integration>> {
  void _accountId;
  void _workspaceId;
  await new Promise((r) => setTimeout(r, 60));
  return [...FIXTURES];
}

export async function fetchWorkspaceConnections(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<IntegrationConnection>> {
  void _accountId;
  void _workspaceId;
  await new Promise((r) => setTimeout(r, 60));
  return [...CONNECTIONS];
}

export function getConnectionsForProvider(
  providerId: string,
): ReadonlyArray<IntegrationConnection> {
  return CONNECTIONS.filter((c) => c.providerId === providerId);
}

export function getConnectionCount(providerId: string): number {
  let n = 0;
  for (const c of CONNECTIONS) if (c.providerId === providerId) n++;
  return n;
}
