import type { Metadata } from "next";
import SandboxLogsView from "../_components/sandbox-logs-view";

export const metadata: Metadata = {
  title: "Sandbox logs",
};

export default function SandboxLogsPage() {
  return <SandboxLogsView />;
}
