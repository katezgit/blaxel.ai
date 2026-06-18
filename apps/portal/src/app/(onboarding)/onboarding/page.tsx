import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding",
};

export default function OnboardingPage() {
  return (
    <div className="flex w-full max-w-[420px] flex-col gap-3 text-center">
      <h1 className="text-display font-semibold text-foreground">Onboarding</h1>
      <p className="text-muted-foreground">Placeholder.</p>
    </div>
  );
}
