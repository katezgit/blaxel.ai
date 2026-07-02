"use client";

// Bulk-action bar — appears above the table when at least one row is
// selected. Per sandboxes-list-2026-07-01 wireframe §1.3 the only bulk verb
// at list level is Delete; Restart-all is deferred pending operator
// confirmation (audit question #6).

import { Trash2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";

interface SandboxesBulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
}

export function SandboxesBulkActionBar({
  selectedCount,
  onClearSelection,
  onDelete,
}: SandboxesBulkActionBarProps) {
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted-surface px-3 py-2"
    >
      <div className="flex items-center gap-3 typography-body">
        <span className="tabular-nums font-medium text-foreground">
          {selectedCount.toLocaleString("en-US")} selected
        </span>
        <button
          type="button"
          onClick={onClearSelection}
          className="typography-meta text-muted-foreground underline-offset-2 hover:underline"
        >
          Clear
        </button>
      </div>
      <Button variant="destructive" onClick={onDelete}>
        <Trash2 aria-hidden="true" />
        Delete
      </Button>
    </div>
  );
}
