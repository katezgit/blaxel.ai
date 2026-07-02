import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/cn";

const TRANSCRIPT_WIDTHS = [
  "w-2/3",
  "w-1/2",
  "w-3/4",
  "w-1/3",
  "w-3/5",
  "w-1/2",
  "w-2/3",
  "w-2/5",
  "w-1/2",
  "w-3/4",
];

const SESSION_TAB_WIDTHS = ["w-24", "w-28", "w-20"];

export default function Loading() {
  return (
    <section
      aria-label="Sandbox terminal loading"
      className="flex flex-col overflow-hidden rounded-lg border border-code-border bg-code-bg"
    >
      <div className="flex items-center justify-between gap-4 border-b border-code-border px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-1.5 rounded-full bg-white/10" />
          <Skeleton className="h-3 w-16 rounded-sm bg-white/10" />
          <Skeleton className="h-3 w-24 rounded-sm bg-white/10" />
        </div>
        <Skeleton className="h-4 w-16 rounded-sm bg-white/10" />
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-code-border px-2 py-1.5">
        <div className="flex min-w-0 items-center gap-1">
          {SESSION_TAB_WIDTHS.map((width) => (
            <Skeleton
              key={width}
              className={cn("h-6 rounded-sm bg-white/10", width)}
            />
          ))}
          <Skeleton className="ml-1 h-6 w-12 rounded-sm bg-white/10" />
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="size-6 rounded-sm bg-white/10" />
          ))}
        </div>
      </div>

      <div className="flex min-h-[420px] flex-1 flex-col gap-1.5 px-4 py-3">
        {TRANSCRIPT_WIDTHS.map((width, idx) => (
          <Skeleton
            key={idx}
            className={cn("h-3 rounded-sm bg-white/10", width)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-code-border px-3 py-1.5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-20 rounded-sm bg-white/10" />
          <Skeleton className="h-3 w-28 rounded-sm bg-white/10" />
          <Skeleton className="h-3 w-16 rounded-sm bg-white/10" />
          <Skeleton className="h-3 w-24 rounded-sm bg-white/10" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-10 rounded-sm bg-white/10" />
          <Skeleton className="h-3 w-10 rounded-sm bg-white/10" />
        </div>
      </div>
    </section>
  );
}
