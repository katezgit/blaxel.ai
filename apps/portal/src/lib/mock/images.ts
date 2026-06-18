export type ImageStatus = "ready" | "building" | "failed";

export interface Image {
  id: string;
  name: string;
  tag: string;
  status: ImageStatus;
  /** Bytes. */
  size: number;
}

const FIXTURES: ReadonlyArray<Image> = [
  {
    id: "img_python_eval",
    name: "python-eval",
    tag: "3.12-slim",
    status: "ready",
    size: 198_000_000,
  },
  {
    id: "img_playwright_browse",
    name: "playwright-browse",
    tag: "1.49",
    status: "ready",
    size: 1_240_000_000,
  },
  {
    id: "img_node_ci",
    name: "node-ci",
    tag: "22-bookworm",
    status: "ready",
    size: 412_000_000,
  },
  {
    id: "img_research_cuda",
    name: "research-cuda",
    tag: "12.4",
    status: "building",
    size: 0,
  },
];

export async function fetchImages(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<Image>> {
  void _accountId;
  void _workspaceId;
  return [...FIXTURES];
}
