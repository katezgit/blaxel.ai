// Fixed-geometry activity sparkline for the Sandboxes list Activity column.
// 12 bars over a 60×20 viewport — each bar 3px wide with a 2px gap. Height
// scales linearly from the normalized [0,1] amplitude with a 2px floor so a
// dead-quiet strip still reads as bars (not an empty rectangle).
//
// Visual only — every row shares the same geometry, so the column reads as a
// single visual set. `aria-label` describes the trend at a glance for screen
// readers per §Accessibility of the sandboxes-list-2026-07-01 wireframe.

interface ActivitySparklineProps {
  bars: ReadonlyArray<number>;
  ariaLabel: string;
}

const WIDTH = 60;
const HEIGHT = 20;
const BAR_COUNT = 12;
const BAR_WIDTH = 3;
const GAP = (WIDTH - BAR_COUNT * BAR_WIDTH) / (BAR_COUNT - 1);
const MIN_HEIGHT = 2;

export function ActivitySparkline({ bars, ariaLabel }: ActivitySparklineProps) {
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      className="block text-meta-foreground"
    >
      {bars.map((amplitude, i) => {
        const barHeight = Math.max(
          MIN_HEIGHT,
          Math.round(amplitude * (HEIGHT - MIN_HEIGHT)) + MIN_HEIGHT,
        );
        const x = i * (BAR_WIDTH + GAP);
        const y = HEIGHT - barHeight;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={BAR_WIDTH}
            height={barHeight}
            rx={0.5}
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
}
