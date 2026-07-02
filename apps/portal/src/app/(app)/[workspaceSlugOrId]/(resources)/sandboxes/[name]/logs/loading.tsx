import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/cn";

// Fixed pattern (not random) so the histogram silhouette is deterministic
// across renders — random heights per mount create a visible flicker as
// the skeleton unmounts, since the eye tracks the bar envelope.
const VOLUME_BAR_HEIGHTS = [
  22, 34, 18, 46, 28, 62, 40, 30, 52, 70, 44, 38, 56, 26, 48, 60, 74, 42, 34,
  50, 66, 32, 44, 58, 40, 28, 54, 68, 36, 46, 24, 38,
];

const LOG_ROW_COUNT = 15;

// Message-column widths cycle through this ramp so rows feel varied without
// looking randomized; keeps the eye scanning down the level column, not the
// message column, matching how populated rows read.
const MESSAGE_WIDTHS = [
  "w-3/4",
  "w-2/3",
  "w-5/6",
  "w-1/2",
  "w-3/5",
  "w-4/5",
  "w-2/3",
  "w-3/4",
  "w-1/2",
  "w-5/6",
  "w-2/3",
  "w-3/4",
  "w-3/5",
  "w-4/5",
  "w-2/3",
];

export default function Loading() {
  return (
    <section aria-label="Logs loading" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative min-w-0 flex-1">
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex h-8 items-end gap-0.5">
          {VOLUME_BAR_HEIGHTS.map((height, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="flex-1 rounded-t-xs bg-border"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24 rounded-sm" />
          <Skeleton className="h-3 w-28 rounded-sm" />
          <Skeleton className="h-3 w-24 rounded-sm" />
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-lg border border-code-border bg-code-bg">
        <div className="flex items-center justify-between gap-4 border-b border-code-border px-3 py-1.5 typography-meta text-code-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-1.5 py-0.5">
              <Skeleton className="size-1.5 rounded-full bg-white/10" />
              <Skeleton className="h-3 w-8 rounded-sm bg-white/10" />
            </span>
            <Skeleton className="h-3 w-32 rounded-sm bg-white/10" />
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="size-[22px] rounded-sm bg-white/10"
              />
            ))}
          </div>
        </div>
        <div className="h-[min(calc(100vh-24rem),35rem)] overflow-hidden">
          <table className="w-full border-collapse typography-code text-code-fg">
            <thead className="bg-code-bg">
              <tr className="border-b border-code-border text-code-muted">
                <th className="w-12 px-3 py-2 text-right typography-meta font-medium">
                  <Skeleton className="ml-auto h-3 w-3 rounded-sm bg-white/10" />
                </th>
                <th className="w-56 px-3 py-2 text-left typography-meta font-medium">
                  <Skeleton className="h-3 w-16 rounded-sm bg-white/10" />
                </th>
                <th className="w-24 px-3 py-2 text-left typography-meta font-medium">
                  <Skeleton className="h-3 w-10 rounded-sm bg-white/10" />
                </th>
                <th className="px-3 py-2 text-left typography-meta font-medium">
                  <Skeleton className="h-3 w-16 rounded-sm bg-white/10" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: LOG_ROW_COUNT }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-code-border/60"
                >
                  <td className="w-12 px-3 py-1.5 align-top text-right">
                    <Skeleton className="ml-auto h-3 w-4 rounded-sm bg-white/10" />
                  </td>
                  <td className="w-56 px-3 py-1.5 align-top">
                    <Skeleton className="h-3 w-44 rounded-sm bg-white/10" />
                  </td>
                  <td className="w-24 px-3 py-1.5 align-top">
                    <span className="flex items-center gap-1.5">
                      <Skeleton className="size-1.5 rounded-full bg-white/10" />
                      <Skeleton className="h-3 w-10 rounded-sm bg-white/10" />
                    </span>
                  </td>
                  <td className="px-3 py-1.5 align-top">
                    <Skeleton
                      className={cn(
                        "h-3 rounded-sm bg-white/10",
                        MESSAGE_WIDTHS[index % MESSAGE_WIDTHS.length],
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
