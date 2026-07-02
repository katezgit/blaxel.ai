import type { Metadata } from "next";
import { getSandboxSchedules } from "@/lib/mock/sandbox-schedules-fixtures";
import SandboxSchedulesExecutionHistory from "../_components/sandbox-schedules-execution-history";
import SandboxSchedulesSection from "../_components/sandbox-schedules-section";

export const metadata: Metadata = {
  title: "Sandbox schedules",
};

interface SandboxSchedulesPageProps {
  params: Promise<{ workspaceSlugOrId: string; name: string }>;
}

// Tab content for /{workspace}/sandboxes/[name]/schedules. The header +
// breadcrumb + tab strip live in the parent layout — this page renders
// only the Schedules + Execution history bands. Fixtures are read
// server-side and passed down as props; both child sections own their
// own filter state.
export default async function SandboxSchedulesPage({
  params,
}: SandboxSchedulesPageProps) {
  const { name } = await params;
  const { schedules, executions } = getSandboxSchedules(name);
  return (
    <>
      <SandboxSchedulesSection schedules={schedules} />
      <SandboxSchedulesExecutionHistory executions={executions} />
    </>
  );
}
