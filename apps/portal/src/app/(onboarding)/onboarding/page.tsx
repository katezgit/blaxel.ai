import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import CreateOrganizationForm from "./create-organization-form";

export const metadata: Metadata = {
  title: "Onboarding",
};

export default function OnboardingPage() {
  return (
    <Card variant="elevated" className="w-full max-w-[420px]">
      <CardHeader className="gap-1">
        <h1 className="typography-subtitle font-semibold text-foreground">
          Create your organization
        </h1>
        <p className="typography-caption text-muted-foreground">
          You can change this later in Settings.
        </p>
      </CardHeader>
      <CardContent>
        <CreateOrganizationForm />
      </CardContent>
    </Card>
  );
}
