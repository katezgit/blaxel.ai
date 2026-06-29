import type { ReactNode } from "react";
import UpsellPanel from "./_components/upsell-panel";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background bg-grid-overlay bg-grid-drift">
      <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-center gap-12 px-6 py-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10">
        <div className="flex w-full justify-center lg:justify-end">{children}</div>
        <div className="hidden lg:flex lg:justify-start">
          <UpsellPanel />
        </div>
      </div>
    </main>
  );
}
