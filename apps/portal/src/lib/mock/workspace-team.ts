import type { TeamMember } from "@/lib/mock/types";

/**
 * Workspace team roster — the operator's own row is first so the page
 * always shows the active user in context, mirroring the operator-supplied
 * screenshot of live Blaxel.
 */
const FIXTURES: ReadonlyArray<TeamMember> = [
  {
    id: "u_kate",
    name: "Kate Zhang",
    email: "katezuzy@gmail.com",
    role: "owner",
    source: "local",
    status: "accepted",
    isYou: true,
  },
  {
    id: "u_avery",
    name: "Avery Lin",
    email: "avery@acme.dev",
    role: "admin",
    source: "invitation",
    status: "accepted",
  },
  {
    id: "u_kai",
    name: "Kai Chen",
    email: "kai@acme.dev",
    role: "member",
    source: "directory-sync",
    status: "accepted",
  },
  {
    id: "u_mira",
    name: "Mira Patel",
    email: "mira@acme.dev",
    role: "member",
    source: "directory-sync",
    status: "accepted",
  },
  {
    id: "u_jordan",
    name: "Jordan Rivera",
    email: "jordan@webflow.com",
    role: "member",
    source: "domain-capture",
    status: "accepted",
  },
  {
    id: "u_sam",
    name: "Sam Brooks",
    email: "sam@webflow.com",
    role: "admin",
    source: "domain-capture",
    status: "accepted",
  },
  {
    id: "u_pending_1",
    name: "Reyna Ortega",
    email: "reyna@acme.dev",
    role: "member",
    source: "invitation",
    status: "pending",
  },
  {
    id: "u_pending_2",
    name: "Theo Walker",
    email: "theo@acme.dev",
    role: "admin",
    source: "invitation",
    status: "pending",
  },
  {
    id: "u_expired",
    name: "Lin Park",
    email: "lin@acme.dev",
    role: "member",
    source: "invitation",
    status: "expired",
  },
  {
    id: "u_dir_3",
    name: "Devon Hayes",
    email: "devon@acme.dev",
    role: "member",
    source: "directory-sync",
    status: "accepted",
  },
];

export async function fetchWorkspaceTeam(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<TeamMember>> {
  void _accountId;
  void _workspaceId;
  await new Promise((r) => setTimeout(r, 60));
  return [...FIXTURES];
}
