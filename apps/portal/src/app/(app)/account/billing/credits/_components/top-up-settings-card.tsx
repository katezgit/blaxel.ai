"use client";

import { useState } from "react";
import AutoTopUpRule from "./auto-top-up-rule";
import MonthlyTopUpRule from "./monthly-top-up-rule";

type ExpandedRow = "auto" | "monthly" | null;

export default function TopUpSettingsCard() {
  const [expandedRow, setExpandedRow] = useState<ExpandedRow>(null);

  const requestExpand = (row: "auto" | "monthly") => setExpandedRow(row);
  const collapseRow = () => setExpandedRow(null);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="typography-subtitle font-semibold text-foreground">
          Automatic top-ups
        </h2>
        <p className="typography-body text-muted-foreground">
          Rules that keep your balance from running out.
        </p>
      </div>
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
    </section>
  );
}
