import Image from "next/image";

type Feature = { eyebrow: string; body: string; live?: boolean };

const FEATURES: ReadonlyArray<Feature> = [
  {
    eyebrow: "NO COLD START",
    body: "Sandboxes resume from standby in ~25ms. No cold-start orchestration.",
    live: true,
  },
  {
    eyebrow: "ONE PLANE",
    body: "Agents, models, and MCP servers run on the same private network as the sandbox. Co-hosted by default.",
  },
  {
    eyebrow: "PERSISTENT STATE",
    body: "Snapshots persist indefinitely. Resume weeks later with memory and filesystem intact.",
  },
];

export default function UpsellPanel() {
  return (
    <section
      aria-labelledby="onboarding-upsell-headline"
      className="relative flex w-full max-w-[480px] flex-col gap-8"
    >
      {/* Halo glow — radial fade, ambient, anchored behind the wordmark + headline.
       * Sits before content in DOM, absolutely positioned, low opacity so it doesn't
       * compete with the form column to the left. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-16 h-[360px] w-[420px] rounded-full bg-primary opacity-[0.07] blur-3xl"
      />

      <span
        aria-hidden="true"
        aria-label="Blaxel"
        className="relative flex items-center gap-2"
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

      <div className="relative flex flex-col gap-3">
        <h2
          id="onboarding-upsell-headline"
          className="typography-display font-semibold text-foreground"
        >
          The perpetual sandbox platform.
        </h2>
        <p className="typography-body max-w-prose text-muted-foreground">
          Keep infinite, secure sandboxes on automatic standby. Co-host your agents and context for near-instant latency.
        </p>
      </div>

      <SchematicIllustration />

      <ul className="relative flex flex-col gap-6">
        {FEATURES.map((feature) => (
          <li key={feature.eyebrow} className="flex flex-col gap-1">
            <span className="flex items-center gap-2 font-mono typography-meta font-medium uppercase tracking-wider text-muted-foreground">
              {feature.live ? (
                <span
                  aria-hidden="true"
                  className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-primary"
                />
              ) : null}
              {feature.eyebrow}
            </span>
            <p className="typography-body text-foreground">{feature.body}</p>
          </li>
        ))}
      </ul>

      <p className="relative typography-caption text-muted-foreground">
        Trusted by builders at Cubic, Shortwave, Webflow, Strapi, and Thomas.
      </p>
    </section>
  );
}

/* Decorative — three nodes (sandbox / agent / model) plus an mcp fourth.
 * Hairline strokes, no fill, currentColor at low opacity so it inherits theme.
 * Two edges pulse (sandbox↔agent, agent↔model); the mcp edge stays static
 * to keep the schematic from reading as a screensaver. */
function SchematicIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 440 96"
      className="h-[88px] w-full text-foreground/35"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {/* Edges first so they render behind nodes */}
      {/* sandbox → agent (top row, animated) */}
      <line x1="92" y1="32" x2="180" y2="32" className="pulse-edge" />
      {/* agent → model (top row, animated, offset phase via inline style delay) */}
      <line
        x1="272"
        y1="32"
        x2="360"
        y2="32"
        className="pulse-edge"
        style={{ animationDelay: "1s" }}
      />
      {/* agent → mcp (down to bottom row, static) */}
      <line x1="226" y1="48" x2="226" y2="68" opacity="0.25" />

      {/* Nodes — small rounded rects, label inside in mono */}
      <g>
        <rect x="12" y="16" width="80" height="32" rx="6" />
        <text
          x="52"
          y="36"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="11"
          fill="currentColor"
          stroke="none"
        >
          sandbox
        </text>
      </g>
      <g>
        <rect x="180" y="16" width="92" height="32" rx="6" />
        <text
          x="226"
          y="36"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="11"
          fill="currentColor"
          stroke="none"
        >
          agent
        </text>
      </g>
      <g>
        <rect x="360" y="16" width="68" height="32" rx="6" />
        <text
          x="394"
          y="36"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="11"
          fill="currentColor"
          stroke="none"
        >
          model
        </text>
      </g>
      <g opacity="0.7">
        <rect x="186" y="68" width="80" height="22" rx="5" />
        <text
          x="226"
          y="83"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="currentColor"
          stroke="none"
        >
          mcp
        </text>
      </g>
    </svg>
  );
}
