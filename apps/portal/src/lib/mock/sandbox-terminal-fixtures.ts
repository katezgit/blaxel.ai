// Mock session for the Sandbox detail Terminal tab. Demo only — no real
// shell integration this phase. Each line is either a prompt+command the
// "user" typed, or output from the previous command. The fixture is
// authored so the resulting frame reads as a plausible boot+test session
// inside a freshly attached Sandbox.

export type SandboxTerminalLine =
  | { kind: "command"; prompt: string; command: string }
  | { kind: "output"; text: string };

export const SANDBOX_TERMINAL_PROMPT = "sandbox:~/app$";

export const SANDBOX_TERMINAL_SESSION: ReadonlyArray<SandboxTerminalLine> = [
  { kind: "command", prompt: SANDBOX_TERMINAL_PROMPT, command: "ls" },
  { kind: "output", text: "README.md  package.json  src/  tests/  tsconfig.json" },
  { kind: "command", prompt: SANDBOX_TERMINAL_PROMPT, command: "cd src/" },
  {
    kind: "command",
    prompt: "sandbox:~/app/src$",
    command: "node --version",
  },
  { kind: "output", text: "v22.11.0" },
  {
    kind: "command",
    prompt: "sandbox:~/app/src$",
    command: "npm test -- --run",
  },
  { kind: "output", text: "" },
  { kind: "output", text: "> blaxel-agent-sample@0.4.2 test" },
  { kind: "output", text: "> vitest --run" },
  { kind: "output", text: "" },
  { kind: "output", text: " RUN  v3.2.4" },
  { kind: "output", text: " ✓ src/router.test.ts (8 tests) 41ms" },
  { kind: "output", text: " ✓ src/agent.test.ts (12 tests) 113ms" },
  { kind: "output", text: " ✓ src/tools/web.test.ts (4 tests) 18ms" },
  { kind: "output", text: "" },
  { kind: "output", text: " Test Files  3 passed (3)" },
  { kind: "output", text: "      Tests  24 passed (24)" },
  { kind: "output", text: "   Duration  486ms" },
];
