import Image from "next/image";
import Link from "next/link";
import { cn } from "@repo/ui/lib/cn";

interface BrandMarkProps {
  collapsed?: boolean;
}

export function BrandMark({ collapsed = false }: BrandMarkProps) {
  const wrapperClass = cn(
    "flex h-14 shrink-0 items-center rounded-sm outline-hidden focus-visible:shadow-focus-ring",
    collapsed ? "justify-center px-2" : "gap-2 px-4",
  );

  // Collapsed: clip the wordmark SVG to a 20×20 viewport so only the left-side
  // mark is visible. The mark occupies the leftmost ~18px of the rendered image;
  // the "blaxel" wordmark sits to the right and is hidden by overflow.
  if (collapsed) {
    return (
      <Link href="/" aria-label="Blaxel, go to dashboard" className={wrapperClass}>
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

  return (
    <Link href="/" aria-label="Blaxel, go to dashboard" className={wrapperClass}>
      <Image
        src="/blaxel-logo.svg"
        alt=""
        aria-hidden="true"
        width={90}
        height={24}
        priority
        className="h-6 w-auto dark:hidden"
      />
      <Image
        src="/blaxel-logo-dark.svg"
        alt=""
        aria-hidden="true"
        width={90}
        height={24}
        priority
        className="hidden h-6 w-auto dark:block"
      />
    </Link>
  );
}
