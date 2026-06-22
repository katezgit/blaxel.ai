import type { Integration } from "@/lib/mock/types";

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
  { id: "agentmail", name: "AgentMail", description: "Programmable email inboxes for agents.", category: "mcp-server", logoInitial: "A", enabled: true, usedByCount: 2, lastActivityAt: "2026-06-20T14:22:00Z" },
  { id: "airweave", name: "Airweave", description: "Sync structured data from SaaS apps.", category: "mcp-server", logoInitial: "A", enabled: false },
  // anthropic: published hex `191919` is invisible on dark card; using the
  // brand coral from anthropic.com instead — closer to the marketing palette.
  { id: "anthropic", name: "Anthropic", description: "Claude models via the official API.", category: "model", logoInitial: "A", logoUrl: logo("anthropic", "D97757"), enabled: true, usedByCount: 5, lastActivityAt: "2026-06-21T09:48:00Z" },
  { id: "aws-bedrock", name: "AWS Bedrock", description: "Managed access to foundation models on AWS.", category: "model", logoInitial: "A", logoUrl: logo("amazonwebservices", "FF9900"), enabled: false },
  { id: "aws-s3", name: "AWS S3", description: "Read/write object storage.", category: "mcp-server", logoInitial: "S", logoUrl: logo("amazonwebservices", "FF9900"), enabled: false },
  { id: "aws-ses", name: "AWS SES", description: "Send transactional email from agents.", category: "mcp-server", logoInitial: "S", logoUrl: logo("amazonwebservices", "FF9900"), enabled: false },
  { id: "azure-ai", name: "Azure AI Inference", description: "Microsoft-hosted inference endpoints.", category: "model", logoInitial: "Z", logoUrl: logo("microsoftazure", "0078D4"), enabled: false },
  { id: "azure-mp", name: "Azure Marketplace", description: "Marketplace-procured Azure resources.", category: "mcp-server", logoInitial: "Z", logoUrl: logo("microsoftazure", "0078D4"), enabled: false },
  { id: "blaxel-search", name: "Blaxel Search", description: "First-party web search for agents.", category: "mcp-server", logoInitial: "B", enabled: false },
  { id: "brave-search", name: "Brave Search", description: "Independent index with low-noise results.", category: "mcp-server", logoInitial: "B", logoUrl: logo("brave", "FB542B"), enabled: false },
  { id: "cerebras", name: "Cerebras", description: "Wafer-scale fast inference.", category: "model", logoInitial: "C", enabled: false },
  { id: "cloudflare", name: "Cloudflare", description: "Edge cache, KV, and AI gateways.", category: "mcp-server", logoInitial: "C", logoUrl: logo("cloudflare", "F38020"), enabled: false },
  { id: "cohere", name: "Cohere", description: "Command + Rerank models.", category: "model", logoInitial: "C", enabled: false },
  { id: "context7", name: "Context7", description: "Up-to-date docs for popular libraries.", category: "mcp-server", logoInitial: "C", enabled: false },
  { id: "dall-e", name: "Dall-E", description: "OpenAI image generation.", category: "model", logoInitial: "D", logoUrl: logo("openai", "412991"), enabled: false },
  { id: "deepseek", name: "DeepSeek", description: "DeepSeek V3 and reasoning models.", category: "model", logoInitial: "D", logoUrl: logo("deepseek", "4D6BFE"), enabled: false },
  { id: "discord", name: "Discord", description: "Read messages, send replies in channels.", category: "mcp-server", logoInitial: "D", logoUrl: logo("discord", "5865F2"), enabled: false },
  { id: "exa", name: "Exa", description: "Neural search built for agents.", category: "mcp-server", logoInitial: "E", enabled: false },
  { id: "gemini", name: "Gemini", description: "Google's Gemini family of models.", category: "model", logoInitial: "G", logoUrl: logo("googlegemini", "8E75B2"), enabled: false },
  // github: published hex `181717` disappears against the dark card surface
  // (`#191924`). Substituting a neutral mid-gray that survives both light
  // (#FFF) and dark backgrounds; brand recognition rides on the octocat shape.
  { id: "github", name: "GitHub", description: "Read repos, open issues, create PRs.", category: "mcp-server", logoInitial: "G", logoUrl: logo("github", "737373"), enabled: false },
  { id: "gitlab", name: "GitLab", description: "GitLab projects, MRs, and issues.", category: "mcp-server", logoInitial: "G", logoUrl: logo("gitlab", "FC6D26"), enabled: false },
  { id: "gmail", name: "Gmail", description: "Read and send Gmail on behalf of a user.", category: "mcp-server", logoInitial: "G", logoUrl: logo("gmail", "EA4335"), enabled: false },
  { id: "google-calendar", name: "Google Calendar", description: "Read and create calendar events.", category: "mcp-server", logoInitial: "G", logoUrl: logo("googlecalendar", "4285F4"), enabled: false, comingSoon: true },
  { id: "google-docs", name: "Google Docs", description: "Edit Google Docs as a structured surface.", category: "mcp-server", logoInitial: "G", logoUrl: logo("googledocs", "4285F4"), enabled: false, comingSoon: true },
  { id: "groq", name: "Groq", description: "Ultra-low-latency LPU inference.", category: "model", logoInitial: "G", enabled: false },
  { id: "mistral", name: "Mistral", description: "Mistral and Mixtral models via API.", category: "model", logoInitial: "M", logoUrl: logo("mistralai", "FA520F"), enabled: false },
  { id: "openai", name: "OpenAI", description: "GPT-4 family of models.", category: "model", logoInitial: "O", logoUrl: logo("openai", "412991"), enabled: true, usedByCount: 3, lastActivityAt: "2026-06-21T11:02:00Z", statusWarning: "401 from /v1/models — rotate the workspace key" },
  // slack: brand aubergine `4A154B` is too dark against the dark card; using
  // the lifted aubergine `611F69` that Slack also publishes in its palette.
  { id: "slack", name: "Slack", description: "Read channels, send messages, respond to mentions.", category: "mcp-server", logoInitial: "S", logoUrl: logo("slack", "611F69"), enabled: false },
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
