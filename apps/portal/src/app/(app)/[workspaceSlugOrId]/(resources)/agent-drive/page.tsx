import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/session";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import AgentDrivePreviewView from "./_components/agent-drive-preview-view";

export const metadata: Metadata = {
  title: "Agent Drive",
};

export default async function AgentDrivePage() {
  const [session, tenancy] = await Promise.all([
    requireSession(),
    getCurrentTenancy(),
  ]);
  return (
    <AgentDrivePreviewView
      userEmail={session.email}
      userName={session.name}
      accountId={tenancy.accountId}
    />
  );
}
