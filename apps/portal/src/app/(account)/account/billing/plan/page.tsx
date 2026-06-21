import type { Metadata } from "next";
import { PlanQuotasView } from "./_components/plan-quotas-view";

export const metadata: Metadata = {
  title: "Tier & quotas",
};

export default function TierQuotasPage() {
  return <PlanQuotasView />;
}
