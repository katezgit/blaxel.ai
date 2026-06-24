"use client";

import { useState } from "react";
import {
  TwoFactorDisabledCard,
  TwoFactorEnabledCard,
} from "./two-factor-card";
import ActiveSessionsCard from "./active-sessions-card";
import { TwoFactorDialog } from "./two-factor-dialog";
import type { ActiveSession } from "@/lib/mock/profile";

interface SecurityClientProps {
  sessions: ReadonlyArray<ActiveSession>;
}

export default function SecurityClient({ sessions }: SecurityClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <>
      {twoFactorEnabled ? (
        <TwoFactorEnabledCard onDisable={() => setTwoFactorEnabled(false)} />
      ) : (
        <TwoFactorDisabledCard onSetup={() => setDialogOpen(true)} />
      )}
      <ActiveSessionsCard sessions={sessions} />
      <TwoFactorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onComplete={() => {
          setTwoFactorEnabled(true);
          setDialogOpen(false);
        }}
      />
    </>
  );
}
