import type { Metadata } from "next";
import AgentDrivePreviewView from "./_components/agent-drive-preview-view";

export const metadata: Metadata = {
  title: "Agent Drive",
};

export default function AgentDrivePage() {
  return <AgentDrivePreviewView />;
}
