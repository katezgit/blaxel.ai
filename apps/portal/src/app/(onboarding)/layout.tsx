import type { ReactNode } from "react";
import Image from "next/image";
import UpsellPanel from "./_components/upsell-panel";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 lg:hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sidebar to-background" />
        <div className="absolute inset-0 bg-grid-overlay bg-grid-drift" />
        {/* Mobile warm halo — anchored behind the brand banner at the top of the page.
         * Same primary-tinted ambient glow as the desktop upsell halo, scaled for mobile. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-[320px] w-[420px] -translate-x-1/2 rounded-full bg-primary opacity-10 blur-3xl"
        />
      </div>
      <div className="absolute inset-0 hidden lg:grid lg:grid-cols-2">
        <div className="bg-sidebar bg-grid-overlay bg-grid-drift" />
        <div className="bg-background" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-(--page-max-width) flex-col items-center justify-center gap-12 px-6 py-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-0 lg:px-8 xl:px-20">
        <div className="hidden lg:flex lg:items-center lg:justify-center">
          <UpsellPanel />
        </div>
        <div className="flex w-full flex-col items-center gap-8 lg:gap-0">
          {/* Mobile brand banner — platform context above the form. Hidden on lg+ where
           * UpsellPanel fills the left column instead. */}
          <div className="relative flex flex-col items-center gap-3 text-center lg:hidden">
            <span
              aria-hidden="true"
              aria-label="Blaxel"
              className="flex items-center gap-2"
            >
              <span className="flex h-7 w-7 shrink-0 items-center overflow-hidden">
                <Image
                  src="/blaxel-logo.svg"
                  alt=""
                  width={70}
                  height={28}
                  priority
                  className="h-7 w-auto max-w-none dark:hidden"
                />
                <Image
                  src="/blaxel-logo-dark.svg"
                  alt=""
                  width={70}
                  height={28}
                  priority
                  className="hidden h-7 w-auto max-w-none dark:block"
                />
              </span>
              <span className="text-(length:--brand-text-size) leading-none font-semibold tracking-tight text-foreground">
                blaxel
              </span>
            </span>
            <p className="typography-body text-muted-foreground max-w-[300px]">
              The perpetual sandbox platform.
            </p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
