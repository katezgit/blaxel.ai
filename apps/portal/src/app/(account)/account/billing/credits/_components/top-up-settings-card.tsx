"use client";

import { useState } from "react";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import AutoTopUpRule from "./auto-top-up-rule";
import MonthlyTopUpRule from "./monthly-top-up-rule";

type ExpandedRow = "auto" | "monthly" | null;

export default function TopUpSettingsCard() {
  const [expandedRow, setExpandedRow] = useState<ExpandedRow>(null);

  const requestExpand = (row: "auto" | "monthly") => setExpandedRow(row);
  const collapseRow = () => setExpandedRow(null);

  return (
    <Panel
      title="Automatic top-ups"
      subtitle="Rules that keep your balance from running out."
    >
      <div className="flex flex-col gap-3">
        <AutoTopUpRule
          isExpanded={expandedRow === "auto"}
          onRequestEdit={() => requestExpand("auto")}
          onCollapse={collapseRow}
        />
        <MonthlyTopUpRule
          isExpanded={expandedRow === "monthly"}
          onRequestEdit={() => requestExpand("monthly")}
          onCollapse={collapseRow}
        />
      </div>
    </Panel>
  );
}
