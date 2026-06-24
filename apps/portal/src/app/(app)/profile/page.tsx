import type { Metadata } from "next";
import ProfileForm from "./_components/profile-form";
import OAuthConnectionsSection from "./_components/oauth-connections-section";
import { oauthConnections, profileIdentity } from "@/lib/mock/profile";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  const lastUsedProvider = oauthConnections.find((c) => c.lastUsed);

  return (
    <>
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Your personal identity across every Blaxel workspace.
        </p>
      </header>

      <ProfileForm identity={profileIdentity} />

      <OAuthConnectionsSection
        connections={oauthConnections}
        lastUsedProviderLabel={lastUsedProvider?.label}
      />
    </>
  );
}
