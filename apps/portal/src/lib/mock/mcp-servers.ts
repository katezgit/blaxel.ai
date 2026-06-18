export type McpServerStatus = "connected" | "disconnected" | "error";

export interface McpServer {
  id: string;
  name: string;
  status: McpServerStatus;
  /** Tool count exposed by the server. */
  tools: number;
  endpoint: string;
}

const FIXTURES: ReadonlyArray<McpServer> = [
  {
    id: "mcp_github",
    name: "github",
    status: "connected",
    tools: 14,
    endpoint: "https://mcp.acme.dev/github",
  },
  {
    id: "mcp_linear",
    name: "linear",
    status: "connected",
    tools: 9,
    endpoint: "https://mcp.acme.dev/linear",
  },
  {
    id: "mcp_browser",
    name: "browser",
    status: "connected",
    tools: 22,
    endpoint: "https://mcp.acme.dev/browser",
  },
  {
    id: "mcp_filesystem",
    name: "filesystem",
    status: "disconnected",
    tools: 0,
    endpoint: "https://mcp.acme.dev/fs",
  },
];

export async function fetchMcpServers(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<McpServer>> {
  void _accountId;
  void _workspaceId;
  return [...FIXTURES];
}
