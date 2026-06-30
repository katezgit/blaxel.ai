import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/session";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import AgentRuntimePreviewView from "./_components/agent-runtime-preview-view";

export const metadata: Metadata = {
  title: "Agent Runtime",
};

export default async function AgentRuntimePage() {
  const [session, tenancy] = await Promise.all([
    requireSession(),
    getCurrentTenancy(),
  ]);
  return (
    <AgentRuntimePreviewView
      userEmail={session.email}
      userName={session.name}
      accountId={tenancy.accountId}
    />
  );
}
