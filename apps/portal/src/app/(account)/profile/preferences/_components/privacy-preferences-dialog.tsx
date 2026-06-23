"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Switch } from "@repo/ui/components/switch";
import PreferenceToggleRow from "./preference-toggle-row";

export interface PrivacyChoices {
  sale: boolean;
  sharing: boolean;
  targetedAds: boolean;
}

interface PrivacyPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Last-saved choices. The dialog seeds its draft from this on every open. */
  value: PrivacyChoices;
  onSave: (next: PrivacyChoices) => void;
}

export function PrivacyPreferencesDialog({
  open,
  onOpenChange,
  value,
  onSave,
}: PrivacyPreferencesDialogProps) {
  const [draft, setDraft] = useState<PrivacyChoices>(value);

  // Reseed draft from saved value on every open. Radix keeps the panel mounted
  // across open/close transitions, so closing-without-save would otherwise leak
  // a stale draft into the next session.
  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const setField = (key: keyof PrivacyChoices, next: boolean) =>
    setDraft((prev) => ({ ...prev, [key]: next }));

  const rejectAll = () =>
    setDraft({ sale: false, sharing: false, targetedAds: false });
  const acceptAll = () =>
    setDraft({ sale: true, sharing: true, targetedAds: true });
  const save = () => {
    onSave(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        // max-h-[90vh]: three toggle rows + footer crowd against the DS default
        // 80vh cap on short phones — override for more vertical room.
        className="max-h-[90vh]"
      >
        <DialogHeader>
          <DialogTitle>Your privacy choices</DialogTitle>
          <p className="typography-body text-muted-foreground">
            Manage how your personal data is used. These choices apply across
            every workspace you belong to.
          </p>
        </DialogHeader>
        <DialogBody>
          <ul className="flex flex-col gap-0">
            <PreferenceToggleRow
              label="Sale of my personal information"
              description="Allow Blaxel to sell your data to third parties."
            >
              <Switch
                checked={draft.sale}
                onCheckedChange={(next) => setField("sale", next)}
                aria-label="Sale of my personal information"
              />
            </PreferenceToggleRow>
            <PreferenceToggleRow
              label="Sharing of my personal information"
              description="Allow Blaxel to share your data with partners for cross-context advertising."
            >
              <Switch
                checked={draft.sharing}
                onCheckedChange={(next) => setField("sharing", next)}
                aria-label="Sharing of my personal information"
              />
            </PreferenceToggleRow>
            <PreferenceToggleRow
              label="Processing for targeted advertising"
              description="Allow Blaxel to use your data to personalize ads."
            >
              <Switch
                checked={draft.targetedAds}
                onCheckedChange={(next) => setField("targetedAds", next)}
                aria-label="Processing for targeted advertising"
              />
            </PreferenceToggleRow>
          </ul>
        </DialogBody>
        <DialogFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-2">
          <a
            href="https://blaxel.ai/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 self-start rounded-sm typography-caption text-muted-foreground outline-hidden hover:text-foreground focus-visible:shadow-focus-ring sm:mr-auto"
          >
            View full privacy policy
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
          <div className="flex flex-col-reverse gap-2 *:w-full sm:flex-row sm:items-center sm:gap-2 sm:*:w-auto">
            <Button variant="secondary" onClick={rejectAll}>
              Reject all
            </Button>
            <Button variant="secondary" onClick={acceptAll}>
              Accept all
            </Button>
            <Button variant="primary" onClick={save}>
              Save preferences
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
