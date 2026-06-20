import type { Metadata } from "next";
import { PlanQuotasView } from "./_components/plan-quotas-view";

export const metadata: Metadata = {
  title: "Plan & Quotas",
};

export default function PlanQuotasPage() {
  return <PlanQuotasView />;
}
