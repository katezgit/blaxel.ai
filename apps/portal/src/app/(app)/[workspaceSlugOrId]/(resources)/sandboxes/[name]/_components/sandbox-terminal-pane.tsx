"use client";

import { useState } from "react";
import {
  Copy,
  Expand,
  ExternalLink,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@repo/ui/lib/cn";
import {
  SANDBOX_TERMINAL_SESSION,
  type SandboxTerminalLine,
} from "@/lib/mock/sandbox-terminal-fixtures";

interface Session {
  id: string;
  label: string;
  status: "active" | "idle";
}

const INITIAL_SESSIONS: ReadonlyArray<Session> = [
  { id: "sess_bash_main", label: "bash · main", status: "active" },
  { id: "sess_tail_log", label: "tail -F /var/log", status: "active" },
  { id: "sess_node_repl", label: "node repl", status: "idle" },
];

/** Terminal tab body — v2 dark-panel styling. Connection header at top
 *  (live pill + reconnect), a session-tab row with per-session close +
 *  new-session affordance on the left and a compact toolbar on the right,
 *  the transcript body inside `bg-code-bg`, and a footer bar with session
 *  metadata. Demo-only: transcript comes from the fixture; every action
 *  toasts. */
export default function SandboxTerminalPane() {
  const [sessions, setSessions] =
    useState<ReadonlyArray<Session>>(INITIAL_SESSIONS);
  const [activeId, setActiveId] = useState<string>(INITIAL_SESSIONS[0]!.id);

  const activeSession = sessions.find((s) => s.id === activeId) ?? sessions[0];

  const addSession = () => {
    const nextIndex = sessions.length + 1;
    const next: Session = {
      id: `sess_new_${nextIndex}`,
      label: `bash · ${nextIndex}`,
      status: "active",
    };
    setSessions([...sessions, next]);
    setActiveId(next.id);
  };

  const closeSession = (id: string) => {
    if (sessions.length === 1) {
      toast.info("At least one session must remain open.");
      return;
    }
    const nextList = sessions.filter((s) => s.id !== id);
    setSessions(nextList);
    if (activeId === id) setActiveId(nextList[0]!.id);
  };

  const copyOutput = () => {
    const text = SANDBOX_TERMINAL_SESSION.map((line) =>
      line.kind === "command" ? `${line.prompt} ${line.command}` : line.text,
    ).join("\n");
    void navigator.clipboard.writeText(text);
    toast.success("Output copied to clipboard.");
  };

  return (
    <section
      aria-label="Sandbox terminal"
      className="flex flex-col overflow-hidden rounded-lg border border-code-border bg-code-bg"
    >
      <div className="flex items-center justify-between gap-4 border-b border-code-border px-3 py-1.5 typography-meta text-code-muted">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 animate-pulse rounded-full bg-state-scored"
          />
          <span className="text-code-fg">connected</span>
          <span>· 42ms · up 6h</span>
        </span>
        <button
          type="button"
          onClick={() => toast.success("Reconnecting session.")}
          className="rounded-sm px-1.5 py-0.5 transition-colors hover:bg-white/5 hover:text-code-fg"
        >
          Reconnect
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 border-b border-code-border px-2 py-1.5">
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
          {sessions.map((session) => {
            const isActive = session.id === activeId;
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => setActiveId(session.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-sm px-2 py-1 typography-meta transition-colors",
                  isActive
                    ? "bg-white/10 text-code-fg"
                    : "text-code-muted hover:bg-white/5 hover:text-code-fg",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 rounded-full",
                    session.status === "active"
                      ? "bg-state-scored"
                      : "bg-code-muted",
                  )}
                />
                <span className="whitespace-nowrap">{session.label}</span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Close ${session.label}`}
                  className="ml-1 rounded-sm p-0.5 text-code-muted hover:bg-white/10 hover:text-code-fg"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeSession(session.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      closeSession(session.id);
                    }
                  }}
                >
                  <X aria-hidden="true" className="size-3" />
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={addSession}
            className="flex items-center gap-1 rounded-sm px-2 py-1 typography-meta text-code-muted transition-colors hover:bg-white/5 hover:text-code-fg"
          >
            <Plus aria-hidden="true" className="size-3" />
            New
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <TerminalToolButton
            label="Reconnect"
            icon={<RefreshCw aria-hidden="true" className="size-3.5" />}
            onClick={() => toast.success("Reconnecting session.")}
          />
          <TerminalToolButton
            label="Copy output"
            icon={<Copy aria-hidden="true" className="size-3.5" />}
            onClick={copyOutput}
          />
          <TerminalToolButton
            label="Clear"
            icon={<Trash2 aria-hidden="true" className="size-3.5" />}
            onClick={() => toast.success("Terminal cleared.")}
          />
          <TerminalToolButton
            label="Open in new tab"
            icon={<ExternalLink aria-hidden="true" className="size-3.5" />}
            onClick={() => window.open(window.location.href, "_blank")}
          />
          <TerminalToolButton
            label="Fullscreen"
            icon={<Expand aria-hidden="true" className="size-3.5" />}
            onClick={() =>
              toast.info(
                "Fullscreen mode: collapse sidebar to icon rail (Esc to exit).",
              )
            }
          />
        </div>
      </div>

      <div className="flex min-h-[420px] flex-1 flex-col overflow-auto px-4 py-3 typography-code text-code-fg">
        {SANDBOX_TERMINAL_SESSION.map((line, i) => (
          <TerminalLine key={i} line={line} />
        ))}
        <div className="flex items-center whitespace-pre">
          <span>sandbox:~/app/src$ </span>
          <span
            aria-hidden="true"
            className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-code-fg"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-code-border px-3 py-1.5 typography-meta text-code-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-state-scored"
            />
            connected
          </span>
          <span>session {activeSession?.id}</span>
          <span>cwd /app</span>
          <span>shell bash 5.2.15</span>
        </div>
        <div className="flex items-center gap-3">
          <span>42ms</span>
          <span>up 6h</span>
        </div>
      </div>
    </section>
  );
}

function TerminalLine({ line }: { line: SandboxTerminalLine }) {
  if (line.kind === "command") {
    return (
      <div className="flex gap-2 whitespace-pre">
        <span className="text-code-muted">{line.prompt}</span>
        <span className="text-code-fg">{line.command}</span>
      </div>
    );
  }
  return (
    <div className="whitespace-pre text-code-fg">
      {line.text === "" ? " " : line.text}
    </div>
  );
}

interface TerminalToolButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function TerminalToolButton({ label, icon, onClick }: TerminalToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-sm p-1 text-code-muted transition-colors hover:bg-white/10 hover:text-code-fg"
    >
      {icon}
    </button>
  );
}
