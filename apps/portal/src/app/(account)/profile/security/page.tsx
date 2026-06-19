import type { Metadata } from "next";
import { SecurityClient } from "./_components/security-client";
import { activeSessions } from "@/lib/mock/profile";

export const metadata: Metadata = {
  title: "Security",
};

export default function SecurityPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Security</h1>
        <p className="text-muted-foreground">
          Strengthen your account with two-factor authentication and review
          everywhere you&rsquo;re signed in.
        </p>
      </header>

      <SecurityClient sessions={activeSessions} />
    </div>
  );
}
