import type { Metadata } from "next";
import SandboxTerminalPane from "../_components/sandbox-terminal-pane";

export const metadata: Metadata = {
  title: "Sandbox terminal",
};

export default function SandboxTerminalPage() {
  return <SandboxTerminalPane />;
}
