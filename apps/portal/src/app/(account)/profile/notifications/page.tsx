import type { Metadata } from "next";
import { NotificationsClient } from "./_components/notifications-client";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Notifications</h1>
        <p className="text-muted-foreground">
          What we send you and how often. These apply to every workspace you belong to.
        </p>
      </header>

      <NotificationsClient />
    </div>
  );
}
