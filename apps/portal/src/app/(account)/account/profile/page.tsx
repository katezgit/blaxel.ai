import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account · Profile",
};

export default function ProfilePage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Name, email, avatar, password, 2FA, connected identities. Page coming soon.
        </p>
      </header>
    </div>
  );
}
