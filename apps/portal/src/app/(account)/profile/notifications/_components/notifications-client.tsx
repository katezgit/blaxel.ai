"use client";

import { useId, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Switch } from "@repo/ui/components/switch";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { NotificationToggleRow } from "./notification-toggle-row";

interface NotificationPrefs {
  productUpdates: boolean;
  weeklyDigest: boolean;
  marketing: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  productUpdates: true,
  weeklyDigest: false,
  marketing: false,
};

export function NotificationsClient() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  const securityId = useId();

  return (
    <>
      <Panel title="Email preferences">
        <ul className="flex flex-col gap-0">
          <NotificationToggleRow
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
          </NotificationToggleRow>
          <NotificationToggleRow
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
          </NotificationToggleRow>
          <NotificationToggleRow
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
          </NotificationToggleRow>
        </ul>
      </Panel>

      <Panel title="Marketing">
        <ul className="flex flex-col gap-0">
          <NotificationToggleRow
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
          </NotificationToggleRow>
        </ul>
      </Panel>

      <Panel title="Privacy">
        <p className="text-body text-muted-foreground">
          Data sharing, telemetry, and cookie choices live on the public site.{" "}
          <a
            href="https://blaxel.ai/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-medium text-primary underline-offset-4 hover:underline focus-visible:shadow-focus-ring focus-visible:outline-none"
          >
            Manage preferences
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        </p>
      </Panel>
    </>
  );
}
