"use client";

import Image from "next/image";
import Link from "next/link";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";

interface BrandMarkProps {
  collapsed?: boolean;
}

export function BrandMark({ collapsed }: BrandMarkProps = {}) {
  const isRail = useIsSidebarRail();
  const showBall = collapsed ?? isRail;
  if (showBall) return <BrandBall />;
  return (
    <>
      <span className="hidden md:contents">
        <BrandWordmark />
      </span>
      <span className="contents md:hidden">
        <BrandBall />
      </span>
    </>
  );
}

function BrandBall() {
  return (
    <Link
      href="/"
      aria-label="Blaxel, go to dashboard"
      className="flex h-8 shrink-0 items-center justify-center rounded-sm outline-hidden focus-visible:shadow-focus-ring"
    >
      <div className="flex h-5 w-5 items-center overflow-hidden">
        <Image
          src="/blaxel-logo.svg"
          alt=""
          aria-hidden="true"
          width={70}
          height={20}
          priority
          className="h-5 w-auto max-w-none dark:hidden"
        />
        <Image
          src="/blaxel-logo-dark.svg"
          alt=""
          aria-hidden="true"
          width={70}
          height={20}
          priority
          className="hidden h-5 w-auto max-w-none dark:block"
        />
      </div>
    </Link>
  );
}

export function BrandWordmark() {
  return (
    <Link
      href="/"
      aria-label="Blaxel, go to dashboard"
      className="flex h-8 shrink-0 items-center gap-2 rounded-sm px-1 outline-hidden focus-visible:shadow-focus-ring"
    >
      <div className="flex h-5 w-5 shrink-0 items-center overflow-hidden">
        <Image
          src="/blaxel-logo.svg"
          alt=""
          aria-hidden="true"
          width={50}
          height={20}
          priority
          className="h-5 w-auto max-w-none dark:hidden"
        />
        <Image
          src="/blaxel-logo-dark.svg"
          alt=""
          aria-hidden="true"
          width={50}
          height={20}
          priority
          className="hidden h-5 w-auto max-w-none dark:block"
        />
      </div>
      <span className="text-(length:--brand-text-size) leading-none font-semibold tracking-tight text-foreground">
        blaxel
      </span>
    </Link>
  );
}
