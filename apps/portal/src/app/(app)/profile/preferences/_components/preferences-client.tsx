"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import PreferenceToggleRow from "./preference-toggle-row";
import {
  PrivacyPreferencesDialog,
  type PrivacyChoices,
} from "./privacy-preferences-dialog";

// Privacy-respecting default: every consent toggle starts OFF until the user
// actively opts in. Mirrors CCPA / "do not sell" expectations.
const DEFAULT_PRIVACY: PrivacyChoices = {
  sale: false,
  sharing: false,
  targetedAds: false,
};

export default function PreferencesClient() {
  const [marketing, setMarketing] = useState(false);
  const [privacy, setPrivacy] = useState<PrivacyChoices>(DEFAULT_PRIVACY);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="typography-subtitle font-semibold text-foreground">Email</h2>
          <p className="typography-body text-muted-foreground">
            Keep your inbox focused on the updates you care about.
          </p>
        </div>
        <ul className="flex flex-col gap-0">
          <PreferenceToggleRow
            label="Marketing emails"
            description="Optional announcements, tips, and curated product news."
          >
            <Switch
              checked={marketing}
              onCheckedChange={setMarketing}
              aria-label="Marketing emails"
            />
          </PreferenceToggleRow>
        </ul>
      </section>

      <section className="mt-2 flex items-start justify-between gap-4 border-t border-border pt-8">
        <div className="flex flex-col gap-1">
          <h2 className="typography-subtitle font-semibold text-foreground">Privacy</h2>
          <p className="typography-body text-muted-foreground">
            Manage your cookie and tracking preferences.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setPrivacyDialogOpen(true)}
          className="shrink-0"
        >
          Manage privacy preferences
        </Button>
      </section>

      <PrivacyPreferencesDialog
        open={privacyDialogOpen}
        onOpenChange={setPrivacyDialogOpen}
        value={privacy}
        onSave={setPrivacy}
      />
    </>
  );
}
