import type { Integration } from "@/lib/mock/types";

// simple-icons brand SVGs distributed via jsdelivr — the canonical
// `cdn.simpleicons.org` endpoint silently drops several enterprise marks
// (OpenAI, AWS, Azure, Slack) for trademark reasons even though the npm
// package still ships the icons, so we pull straight from package contents.
// Slugs are the lowercase brand name with separators stripped. Entries
// without a clean simple-icons match (AgentMail, Airweave, Blaxel Search,
// Context7, Exa, Cerebras, Cohere, Groq) intentionally omit `logoUrl` and
// fall back to the letter monogram — a broken `<img>` would read worse
// than the fallback.
const logo = (slug: string) =>
  `https://cdn.jsdelivr.net/npm/simple-icons/icons/${slug}.svg`;

const FIXTURES: ReadonlyArray<Integration> = [
  { id: "agentmail", name: "AgentMail", description: "Programmable email inboxes for agents.", category: "mcp-server", logoInitial: "A", enabled: true, usedByCount: 2, lastActivityAt: "2026-06-20T14:22:00Z" },
  { id: "airweave", name: "Airweave", description: "Sync structured data from SaaS apps.", category: "mcp-server", logoInitial: "A", enabled: false },
  { id: "anthropic", name: "Anthropic", description: "Claude models via the official API.", category: "model", logoInitial: "A", logoUrl: logo("anthropic"), enabled: true, usedByCount: 5, lastActivityAt: "2026-06-21T09:48:00Z" },
  { id: "aws-bedrock", name: "AWS Bedrock", description: "Managed access to foundation models on AWS.", category: "model", logoInitial: "A", logoUrl: logo("amazonwebservices"), enabled: false },
  { id: "aws-s3", name: "AWS S3", description: "Read/write object storage.", category: "mcp-server", logoInitial: "S", logoUrl: logo("amazonwebservices"), enabled: false },
  { id: "aws-ses", name: "AWS SES", description: "Send transactional email from agents.", category: "mcp-server", logoInitial: "S", logoUrl: logo("amazonwebservices"), enabled: false },
  { id: "azure-ai", name: "Azure AI Inference", description: "Microsoft-hosted inference endpoints.", category: "model", logoInitial: "Z", logoUrl: logo("microsoftazure"), enabled: false },
  { id: "azure-mp", name: "Azure Marketplace", description: "Marketplace-procured Azure resources.", category: "mcp-server", logoInitial: "Z", logoUrl: logo("microsoftazure"), enabled: false },
  { id: "blaxel-search", name: "Blaxel Search", description: "First-party web search for agents.", category: "mcp-server", logoInitial: "B", enabled: false },
  { id: "brave-search", name: "Brave Search", description: "Independent index with low-noise results.", category: "mcp-server", logoInitial: "B", logoUrl: logo("brave"), enabled: false },
  { id: "cerebras", name: "Cerebras", description: "Wafer-scale fast inference.", category: "model", logoInitial: "C", enabled: false },
  { id: "cloudflare", name: "Cloudflare", description: "Edge cache, KV, and AI gateways.", category: "mcp-server", logoInitial: "C", logoUrl: logo("cloudflare"), enabled: false },
  { id: "cohere", name: "Cohere", description: "Command + Rerank models.", category: "model", logoInitial: "C", enabled: false },
  { id: "context7", name: "Context7", description: "Up-to-date docs for popular libraries.", category: "mcp-server", logoInitial: "C", enabled: false },
  { id: "dall-e", name: "Dall-E", description: "OpenAI image generation.", category: "model", logoInitial: "D", logoUrl: logo("openai"), enabled: false },
  { id: "deepseek", name: "DeepSeek", description: "DeepSeek V3 and reasoning models.", category: "model", logoInitial: "D", logoUrl: logo("deepseek"), enabled: false },
  { id: "discord", name: "Discord", description: "Read messages, send replies in channels.", category: "mcp-server", logoInitial: "D", logoUrl: logo("discord"), enabled: false },
  { id: "exa", name: "Exa", description: "Neural search built for agents.", category: "mcp-server", logoInitial: "E", enabled: false },
  { id: "gemini", name: "Gemini", description: "Google's Gemini family of models.", category: "model", logoInitial: "G", logoUrl: logo("googlegemini"), enabled: false },
  { id: "github", name: "GitHub", description: "Read repos, open issues, create PRs.", category: "mcp-server", logoInitial: "G", logoUrl: logo("github"), enabled: false },
  { id: "gitlab", name: "GitLab", description: "GitLab projects, MRs, and issues.", category: "mcp-server", logoInitial: "G", logoUrl: logo("gitlab"), enabled: false },
  { id: "gmail", name: "Gmail", description: "Read and send Gmail on behalf of a user.", category: "mcp-server", logoInitial: "G", logoUrl: logo("gmail"), enabled: false },
  { id: "google-calendar", name: "Google Calendar", description: "Read and create calendar events.", category: "mcp-server", logoInitial: "G", logoUrl: logo("googlecalendar"), enabled: false, comingSoon: true },
  { id: "google-docs", name: "Google Docs", description: "Edit Google Docs as a structured surface.", category: "mcp-server", logoInitial: "G", logoUrl: logo("googledocs"), enabled: false, comingSoon: true },
  { id: "groq", name: "Groq", description: "Ultra-low-latency LPU inference.", category: "model", logoInitial: "G", enabled: false },
  { id: "mistral", name: "Mistral", description: "Mistral and Mixtral models via API.", category: "model", logoInitial: "M", logoUrl: logo("mistralai"), enabled: false },
  { id: "openai", name: "OpenAI", description: "GPT-4 family of models.", category: "model", logoInitial: "O", logoUrl: logo("openai"), enabled: true, usedByCount: 3, lastActivityAt: "2026-06-21T11:02:00Z", statusWarning: "401 from /v1/models — rotate the workspace key" },
  { id: "slack", name: "Slack", description: "Read channels, send messages, respond to mentions.", category: "mcp-server", logoInitial: "S", logoUrl: logo("slack"), enabled: false },
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
