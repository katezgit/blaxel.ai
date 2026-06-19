"use client";

import { useState } from "react";
import { TwoFactorCard } from "./two-factor-card";
import { ActiveSessionsCard } from "./active-sessions-card";
import { TwoFactorDialog } from "./two-factor-dialog";
import type { ActiveSession } from "@/lib/mock/profile";

interface SecurityClientProps {
  sessions: ReadonlyArray<ActiveSession>;
}

export function SecurityClient({ sessions }: SecurityClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <>
      <TwoFactorCard
        enabled={twoFactorEnabled}
        onSetup={() => setDialogOpen(true)}
        onDisable={() => setTwoFactorEnabled(false)}
      />
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
