"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";

interface InlineEditableProps {
  value: string;
  onSave: (next: string) => void;
  ariaLabel: string;
  /** Read-only display node. `startEdit` should be wired to a click handler on the visible text. */
  renderDisplay: (value: string, startEdit: () => void) => ReactNode;
}

export default function InlineEditable({
  value,
  onSave,
  ariaLabel,
  renderDisplay,
}: InlineEditableProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(value);
  };

  const save = async () => {
    const next = draft.trim();
    if (next === "" || next === value) {
      cancel();
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 150));
    onSave(next);
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void save();
            } else if (event.key === "Escape") {
              cancel();
            }
          }}
          aria-label={ariaLabel}
          className="max-w-2xl"
          disabled={saving}
        />
        <Button
          type="button"
          variant="primary"
          onClick={() => void save()}
          disabled={saving}
        >
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={cancel}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="group/inline-edit inline-flex items-center gap-1.5">
      {renderDisplay(value, startEdit)}
      <IconButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={startEdit}
        aria-label={ariaLabel}
        className="opacity-0 transition-opacity group-hover/inline-edit:opacity-100 focus-visible:opacity-100"
      >
        <Pencil />
      </IconButton>
    </div>
  );
}
