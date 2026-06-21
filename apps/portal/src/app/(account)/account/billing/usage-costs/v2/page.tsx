import type { Metadata } from "next";
import UsageView from "./_components/usage-view";

export const metadata: Metadata = {
  title: "Usage",
};

export default function UsagePage() {
  return <UsageView />;
}
