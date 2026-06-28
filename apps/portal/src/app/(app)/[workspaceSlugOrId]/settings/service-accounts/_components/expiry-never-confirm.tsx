"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Button } from "@repo/ui/components/button";
import { EXPIRY_OPTIONS, type ExpiryOption } from "./create-shared";

interface ExpiryNeverConfirmProps {
  value: ExpiryOption;
  onChange: (next: ExpiryOption) => void;
  selectId: string;
}

/**
 * Expires-in Select with an inline confirm for "No expiration".
 *
 * State machine:
 *   - User picks any option != "never" → committed immediately; warning hidden.
 *   - User picks "never" → pending state: trigger reflects the previous committed
 *     value, warning + "Yes, no expiration" button render below.
 *   - User clicks "Yes, no expiration" → committed; warning hidden.
 *   - User picks any other option while pending → that option commits;
 *     pending cleared.
 *
 * The trigger shows the LAST COMMITTED value so an accidental "never" pick
 * does not lock the form into the dangerous default. The Select is closed at
 * the moment we render the warning — Radix closes on select by default.
 */
export default function ExpiryNeverConfirm({
  value,
  onChange,
  selectId,
}: ExpiryNeverConfirmProps) {
  const [pendingNever, setPendingNever] = useState(false);

  const handleSelect = (next: string) => {
    const opt = next as ExpiryOption;
    if (opt === "never") {
      setPendingNever(true);
      return;
    }
    setPendingNever(false);
    onChange(opt);
  };

  const confirmNever = () => {
    setPendingNever(false);
    onChange("never");
  };

  return (
    <div className="flex flex-col gap-2">
      <Select value={value} onValueChange={handleSelect}>
        <SelectTrigger id={selectId} className="w-full max-w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EXPIRY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {pendingNever && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-state-warning/30 bg-state-warning/5 px-3 py-2">
          <span className="flex items-center gap-2 typography-caption text-state-warning-text">
            <TriangleAlert
              aria-hidden="true"
              className="size-3.5 shrink-0 text-state-warning"
            />
            No expiration: this key never expires. Confirm?
          </span>
          <Button type="button" variant="ghost" onClick={confirmNever}>
            Yes, no expiration
          </Button>
        </div>
      )}
    </div>
  );
}
