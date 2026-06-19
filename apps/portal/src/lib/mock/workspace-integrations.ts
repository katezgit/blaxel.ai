import type { Integration } from "@/lib/mock/types";

const FIXTURES: ReadonlyArray<Integration> = [
  { id: "agentmail", name: "AgentMail", description: "Programmable email inboxes for agents.", category: "mcp-server", logoInitial: "A", enabled: true, usedByCount: 2 },
  { id: "airweave", name: "Airweave", description: "Sync structured data from SaaS apps.", category: "mcp-server", logoInitial: "A", enabled: false },
  { id: "anthropic", name: "Anthropic", description: "Claude models via the official API.", category: "model", logoInitial: "A", enabled: true, usedByCount: 5 },
  { id: "aws-bedrock", name: "AWS Bedrock", description: "Managed access to foundation models on AWS.", category: "model", logoInitial: "A", enabled: false },
  { id: "aws-s3", name: "AWS S3", description: "Read/write object storage.", category: "mcp-server", logoInitial: "S", enabled: false },
  { id: "aws-ses", name: "AWS SES", description: "Send transactional email from agents.", category: "mcp-server", logoInitial: "S", enabled: false },
  { id: "azure-ai", name: "Azure AI Inference", description: "Microsoft-hosted inference endpoints.", category: "model", logoInitial: "Z", enabled: false },
  { id: "azure-mp", name: "Azure Marketplace", description: "Marketplace-procured Azure resources.", category: "mcp-server", logoInitial: "Z", enabled: false },
  { id: "blaxel-search", name: "Blaxel Search", description: "First-party web search for agents.", category: "mcp-server", logoInitial: "B", enabled: false },
  { id: "brave-search", name: "Brave Search", description: "Independent index with low-noise results.", category: "mcp-server", logoInitial: "B", enabled: false },
  { id: "cerebras", name: "Cerebras", description: "Wafer-scale fast inference.", category: "model", logoInitial: "C", enabled: false },
  { id: "cloudflare", name: "Cloudflare", description: "Edge cache, KV, and AI gateways.", category: "mcp-server", logoInitial: "C", enabled: false },
  { id: "cohere", name: "Cohere", description: "Command + Rerank models.", category: "model", logoInitial: "C", enabled: false },
  { id: "context7", name: "Context7", description: "Up-to-date docs for popular libraries.", category: "mcp-server", logoInitial: "C", enabled: false },
  { id: "dall-e", name: "Dall-E", description: "OpenAI image generation.", category: "model", logoInitial: "D", enabled: false },
  { id: "deepseek", name: "DeepSeek", description: "DeepSeek V3 and reasoning models.", category: "model", logoInitial: "D", enabled: false },
  { id: "discord", name: "Discord", description: "Read messages, send replies in channels.", category: "mcp-server", logoInitial: "D", enabled: false },
  { id: "exa", name: "Exa", description: "Neural search built for agents.", category: "mcp-server", logoInitial: "E", enabled: false },
  { id: "gemini", name: "Gemini", description: "Google's Gemini family of models.", category: "model", logoInitial: "G", enabled: false },
  { id: "github", name: "GitHub", description: "Read repos, open issues, create PRs.", category: "mcp-server", logoInitial: "G", enabled: false },
  { id: "gitlab", name: "GitLab", description: "GitLab projects, MRs, and issues.", category: "mcp-server", logoInitial: "G", enabled: false },
  { id: "gmail", name: "Gmail", description: "Read and send Gmail on behalf of a user.", category: "mcp-server", logoInitial: "G", enabled: false },
  { id: "google-calendar", name: "Google Calendar", description: "Read and create calendar events.", category: "mcp-server", logoInitial: "G", enabled: false, comingSoon: true },
  { id: "google-docs", name: "Google Docs", description: "Edit Google Docs as a structured surface.", category: "mcp-server", logoInitial: "G", enabled: false, comingSoon: true },
  { id: "groq", name: "Groq", description: "Ultra-low-latency LPU inference.", category: "model", logoInitial: "G", enabled: false },
  { id: "mistral", name: "Mistral", description: "Mistral and Mixtral models via API.", category: "model", logoInitial: "M", enabled: false },
  { id: "openai", name: "OpenAI", description: "GPT-4 family of models.", category: "model", logoInitial: "O", enabled: true, usedByCount: 3 },
  { id: "slack", name: "Slack", description: "Read channels, send messages, respond to mentions.", category: "mcp-server", logoInitial: "S", enabled: false },
];

export async function fetchWorkspaceIntegrations(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<Integration>> {
  void _accountId;
  void _workspaceId;
  await new Promise((r) => setTimeout(r, 60));
  return [...FIXTURES];
}
