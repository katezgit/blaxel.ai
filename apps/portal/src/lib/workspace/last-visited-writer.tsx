"use client";

import { useEffect } from "react";
import { recordLastVisitedWorkspace } from "@/lib/workspace/actions";

// Fires once per slug change so the proxy at / can route returning visits to
// the correct workspace.
interface LastVisitedWorkspaceWriterProps {
  slug: string;
}

export default function LastVisitedWorkspaceWriter({
  slug,
}: LastVisitedWorkspaceWriterProps) {
  useEffect(() => {
    void recordLastVisitedWorkspace(slug);
  }, [slug]);
  return null;
}
