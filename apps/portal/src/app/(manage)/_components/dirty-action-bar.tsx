"use client";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/cn";

interface DirtyActionBarProps {
  isDirty: boolean;
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  saving?: boolean;
  /**
   * Merged onto the bar's outer wrapper. Callers can opt out of the default
   * top separator (e.g. `border-t-0 pt-0`) when the surrounding panel already
   * supplies its own visual boundary.
   */
  className?: string;
}

export default function DirtyActionBar({
  isDirty,
  onCancel,
  onSave,
  saveLabel = "Save",
  saving = false,
  className,
}: DirtyActionBarProps) {
  return (
    <div
      role="region"
      aria-label={isDirty ? "Unsaved changes" : "Form actions"}
      className={cn(
        "mt-6 flex w-full items-center justify-end gap-2 border-t border-border pt-4",
        className,
      )}
    >
      {isDirty && !saving && (
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      )}
      <Button variant="primary" onClick={onSave} disabled={saving}>
        {saving ? "Saving…" : saveLabel}
      </Button>
    </div>
  );
}
