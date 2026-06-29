import type { ReactNode } from "react";
import UpsellPanel from "./_components/upsell-panel";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-background bg-grid-overlay bg-grid-drift lg:hidden" />
      <div className="absolute inset-0 hidden lg:grid lg:grid-cols-2">
        <div className="bg-sidebar bg-grid-overlay bg-grid-drift" />
        <div className="bg-background" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-(--page-max-width) flex-col items-center justify-center gap-12 px-6 py-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-0 lg:px-8 xl:px-20">
        <div className="hidden lg:flex lg:items-center lg:justify-center">
          <UpsellPanel />
        </div>
        <div className="flex w-full justify-center">{children}</div>
      </div>
    </main>
  );
}
