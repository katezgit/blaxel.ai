"use client";

import { useId, useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { PreferenceToggleRow } from "./preference-toggle-row";
import {
  PrivacyPreferencesDialog,
  type PrivacyChoices,
} from "./privacy-preferences-dialog";

interface EmailPrefs {
  productUpdates: boolean;
  weeklyDigest: boolean;
  marketing: boolean;
}

const DEFAULT_EMAIL_PREFS: EmailPrefs = {
  productUpdates: true,
  weeklyDigest: false,
  marketing: false,
};

// Privacy-respecting default: every consent toggle starts OFF until the user
// actively opts in. Mirrors CCPA / "do not sell" expectations.
const DEFAULT_PRIVACY: PrivacyChoices = {
  sale: false,
  sharing: false,
  targetedAds: false,
};

export function PreferencesClient() {
  const [prefs, setPrefs] = useState<EmailPrefs>(DEFAULT_EMAIL_PREFS);
  const [privacy, setPrivacy] = useState<PrivacyChoices>(DEFAULT_PRIVACY);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);

  const securityId = useId();

  return (
    <>
      <Panel title="Email preferences">
        <ul className="flex flex-col gap-0">
          <PreferenceToggleRow
            label="Product updates"
            description="New features, breaking changes, deprecations. About once a month."
          >
            <Switch
              checked={prefs.productUpdates}
              onCheckedChange={(value) =>
                setPrefs((p) => ({ ...p, productUpdates: value }))
              }
              aria-label="Product updates"
            />
          </PreferenceToggleRow>
          <PreferenceToggleRow
            label="Security alerts"
            description="Sign-ins from new devices, recovery code use, MFA changes."
            forced
          >
            <Switch
              id={securityId}
              checked
              disabled
              aria-label="Security alerts (required)"
            />
          </PreferenceToggleRow>
          <PreferenceToggleRow
            label="Weekly digest"
            description="Sandbox activity and usage summary every Monday."
          >
            <Switch
              checked={prefs.weeklyDigest}
              onCheckedChange={(value) =>
                setPrefs((p) => ({ ...p, weeklyDigest: value }))
              }
              aria-label="Weekly digest"
            />
          </PreferenceToggleRow>
        </ul>
      </Panel>

      <Panel title="Marketing">
        <ul className="flex flex-col gap-0">
          <PreferenceToggleRow
            label="Marketing emails"
            description="Occasional product news, customer stories, and event invites."
          >
            <Switch
              checked={prefs.marketing}
              onCheckedChange={(value) =>
                setPrefs((p) => ({ ...p, marketing: value }))
              }
              aria-label="Marketing emails"
            />
          </PreferenceToggleRow>
        </ul>
      </Panel>

      <Panel
        title="Privacy"
        subtitle="Control how your data is shared, sold, or used for advertising."
      >
        <Button
          variant="secondary"
          onClick={() => setPrivacyDialogOpen(true)}
          className="w-full self-start sm:w-auto"
        >
          Manage privacy preferences
        </Button>
      </Panel>

      <PrivacyPreferencesDialog
        open={privacyDialogOpen}
        onOpenChange={setPrivacyDialogOpen}
        value={privacy}
        onSave={setPrivacy}
      />
    </>
  );
}
