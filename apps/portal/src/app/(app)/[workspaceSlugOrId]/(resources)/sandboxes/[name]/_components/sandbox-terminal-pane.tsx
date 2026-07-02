"use client";

import { ExternalLink } from "lucide-react";
import {
  SANDBOX_TERMINAL_SESSION,
  type SandboxTerminalLine,
} from "@/lib/mock/sandbox-terminal-fixtures";

/** §3 Terminal tab — full-viewport in-browser shell. Demo only: a hard-coded
 *  session renders inside the dark `code-bg` surface. Pop-out affordance
 *  sits in the top-right above the surface; the click mocks an
 *  "open the same route in a new tab" by calling `window.open` against the
 *  current URL. */
export default function SandboxTerminalPane() {
  return (
    <section
      aria-label="Sandbox terminal"
      className="flex flex-1 flex-col gap-2 min-h-[60vh]"
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => window.open(window.location.href, "_blank")}
          className="inline-flex items-center gap-1 typography-meta text-meta-foreground hover:text-foreground transition-colors duration-fast ease-out-standard"
        >
          Open in new tab
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col rounded-md border border-code-border bg-code-bg px-4 py-3 overflow-auto">
        <ol className="flex flex-col gap-0.5">
          {SANDBOX_TERMINAL_SESSION.map((line, idx) => (
            <TerminalLine key={idx} line={line} />
          ))}
          <Cursor />
        </ol>
      </div>
    </section>
  );
}

function TerminalLine({ line }: { line: SandboxTerminalLine }) {
  if (line.kind === "command") {
    return (
      <li className="flex gap-2 font-mono typography-code whitespace-pre">
        <span className="text-code-muted">{line.prompt}</span>
        <span className="text-code-fg">{line.command}</span>
      </li>
    );
  }
  return (
    <li className="font-mono typography-code whitespace-pre text-code-fg">
      {line.text === "" ? " " : line.text}
    </li>
  );
}

function Cursor() {
  return (
    <li
      aria-hidden="true"
      className="flex gap-2 font-mono typography-code whitespace-pre"
    >
      <span className="text-code-muted">sandbox:~/app/src$</span>
      <span className="inline-block h-[1em] w-[0.55em] bg-code-fg align-baseline" />
    </li>
  );
}
