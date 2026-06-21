import { LoaderIcon } from "lucide-react";

// 200ms opacity gate suppresses the spinner on sub-200ms loads so fast
// transitions don't flash a spinner the user never had time to read.
// motion-safe: Tailwind's animate-spin ignores prefers-reduced-motion.
export function RouteSpinner() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-full w-full items-center justify-center py-8"
    >
      <style>{`
        @keyframes spinner-appear {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        [data-slot="route-spinner"] {
          opacity: 0;
          animation: spinner-appear 120ms var(--ease-out-standard) 200ms forwards;
        }
      `}</style>
      <p
        data-slot="route-spinner"
        className="inline-flex items-center gap-2 text-muted-foreground md:gap-3"
      >
        <LoaderIcon
          className="size-6 motion-safe:animate-spin md:size-8"
          aria-hidden="true"
        />
        <span>Loading</span>
      </p>
    </div>
  );
}
