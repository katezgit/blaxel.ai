// Sandbox Image catalog — feeds the create-step-1 gallery and the
// `image=` filter on the sandbox list. Categories are stable and used as
// chip-group filters in the gallery.

export type SandboxImageCategory =
  | "runtime"
  | "database"
  | "tool"
  | "custom";

export interface SandboxImage {
  id: string;
  name: string;
  /** Canonical reference (e.g. blaxel/python-3.12@9c1e4d6f). */
  ref: string;
  sha: string;
  version: string;
  publisher: string;
  category: SandboxImageCategory;
  description: string;
  /** Default memory the create form seeds when this Image is picked. */
  defaultMemoryMib: 2048 | 4096 | 8192 | 16384;
}

const FIXTURES: ReadonlyArray<SandboxImage> = [
  {
    id: "python-3.12",
    name: "Python 3.12",
    ref: "blaxel/python-3.12",
    sha: "9c1e4d6f",
    version: "3.12",
    publisher: "blaxel",
    category: "runtime",
    description: "Python with the standard ML/data stack pre-installed.",
    defaultMemoryMib: 2048,
  },
  {
    id: "node-20",
    name: "Node 20",
    ref: "blaxel/node-20",
    sha: "a4f29c0e",
    version: "20-bookworm",
    publisher: "blaxel",
    category: "runtime",
    description: "Node.js LTS with pnpm, playwright deps preloaded.",
    defaultMemoryMib: 2048,
  },
  {
    id: "node-22",
    name: "Node 22",
    ref: "blaxel/node-22",
    sha: "f817be11",
    version: "22-bookworm",
    publisher: "blaxel",
    category: "runtime",
    description: "Latest Node runtime for newer toolchains.",
    defaultMemoryMib: 2048,
  },
  {
    id: "base",
    name: "Blaxel Base",
    ref: "blaxel/base",
    sha: "5a4f1e9d",
    version: "1.0",
    publisher: "blaxel",
    category: "runtime",
    description: "Minimal Debian base with the Blaxel CLI baked in.",
    defaultMemoryMib: 2048,
  },
  {
    id: "expo",
    name: "Expo",
    ref: "blaxel/expo",
    sha: "0c3a82b1",
    version: "51",
    publisher: "blaxel",
    category: "tool",
    description: "Expo + iOS simulator harness for mobile agent flows.",
    defaultMemoryMib: 4096,
  },
  {
    id: "playwright",
    name: "Playwright",
    ref: "playwright/node-20",
    sha: "1f8a3c0b",
    version: "1.49",
    publisher: "blaxel",
    category: "tool",
    description: "Headless browser pool with Chromium + Firefox + Webkit.",
    defaultMemoryMib: 4096,
  },
  {
    id: "postgres-16",
    name: "Postgres 16",
    ref: "blaxel/postgres-16",
    sha: "722eaa10",
    version: "16",
    publisher: "blaxel",
    category: "database",
    description: "Postgres with pgvector for short-lived eval databases.",
    defaultMemoryMib: 4096,
  },
  {
    id: "redis-7",
    name: "Redis 7",
    ref: "blaxel/redis-7",
    sha: "33ca91dd",
    version: "7",
    publisher: "blaxel",
    category: "database",
    description: "Lightweight ephemeral cache for agent state.",
    defaultMemoryMib: 2048,
  },
  {
    id: "cuda-12-4",
    name: "CUDA 12.4",
    ref: "blaxel/cuda-12-4",
    sha: "bb14de7f",
    version: "12.4",
    publisher: "blaxel",
    category: "tool",
    description: "CUDA runtime for short GPU-bound inference jobs.",
    defaultMemoryMib: 8192,
  },
  {
    id: "research-cuda",
    name: "research-cuda",
    ref: "acme/research-cuda",
    sha: "ec5af7d3",
    version: "0.1",
    publisher: "acme (workspace)",
    category: "custom",
    description: "Internal research stack pinned to last week's tag.",
    defaultMemoryMib: 8192,
  },
];

export async function fetchSandboxImages(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<SandboxImage>> {
  void _accountId;
  void _workspaceId;
  return [...FIXTURES];
}

export function findSandboxImage(
  ref: string,
): SandboxImage | undefined {
  return FIXTURES.find((image) => image.ref === ref);
}
