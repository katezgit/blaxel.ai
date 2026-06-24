import type { Metadata } from "next";
import SecurityClient from "./_components/security-client";
import { activeSessions } from "@/lib/mock/profile";

export const metadata: Metadata = {
  title: "Security",
};

export default function SecurityPage() {
  return (
    <>
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">Security</h1>
        <p className="text-muted-foreground">
          Two-factor authentication and active sessions.
        </p>
      </header>

      <SecurityClient sessions={activeSessions} />
    </>
  );
}
