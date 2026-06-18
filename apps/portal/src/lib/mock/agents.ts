export type AgentStatus = "deployed" | "draft" | "paused";

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  /** Human-readable purpose, ~1 line. */
  description: string;
  lastDeployed: string | null;
}

const FIXTURES: ReadonlyArray<Agent> = [
  {
    id: "agt_pr_reviewer",
    name: "pr-reviewer",
    status: "deployed",
    description: "Reviews pull requests against the team style guide.",
    lastDeployed: "2026-06-17T16:02:00Z",
  },
  {
    id: "agt_inbox_triage",
    name: "inbox-triage",
    status: "deployed",
    description: "Classifies incoming support email and drafts replies.",
    lastDeployed: "2026-06-12T09:30:00Z",
  },
  {
    id: "agt_browser_qa",
    name: "browser-qa",
    status: "paused",
    description: "Runs nightly regression flows against the staging dashboard.",
    lastDeployed: "2026-06-08T22:10:00Z",
  },
  {
    id: "agt_research_scout",
    name: "research-scout",
    status: "draft",
    description: "Scrapes papers + summarises into the reading queue.",
    lastDeployed: null,
  },
];

export async function fetchAgents(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<Agent>> {
  void _accountId;
  void _workspaceId;
  return [...FIXTURES];
}
