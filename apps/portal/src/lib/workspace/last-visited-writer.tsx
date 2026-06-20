"use client";

import { useEffect } from "react";
import { recordLastVisitedWorkspace } from "@/lib/workspace/actions";

// Fires once per slug change. The workspace layout renders this with the
// audited slug so that the proxy at / can route to the user's last-visited
// workspace on the next visit.
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
