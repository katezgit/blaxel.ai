"use client";

import { Breadcrumb } from "@/components/shell/breadcrumb";
import DetailPageHeader from "@/components/shell/detail-page-header";
import type { Sandbox } from "@/lib/mock/sandboxes";
import { StatePill } from "../../_components/state-pill";

interface SandboxDetailHeaderProps {
  sandbox: Sandbox;
  workspaceSlug: string;
}

export default function SandboxDetailHeader({
  sandbox,
  workspaceSlug,
}: SandboxDetailHeaderProps) {
  const heading = sandbox.metadata.displayName || sandbox.metadata.name;
  const listHref = `/${workspaceSlug}/sandboxes`;
  return (
    <DetailPageHeader
      breadcrumb={
        <Breadcrumb
          parent={{ href: listHref, label: "Sandboxes" }}
          current={heading}
        />
      }
      heading={heading}
      description={
        <span className="flex flex-wrap items-center gap-2">
          <StatePill sandbox={sandbox} />
          <span className="font-mono typography-body text-muted-foreground">
            {sandbox.metadata.externalId}
          </span>
        </span>
      }
    />
  );
}
