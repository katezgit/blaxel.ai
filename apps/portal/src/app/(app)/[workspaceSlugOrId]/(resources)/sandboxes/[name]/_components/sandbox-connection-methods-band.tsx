"use client";

import { useState } from "react";
import { Code, Eye, Keyboard, Plug } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { CopyButton } from "@repo/ui/components/copy-button";
import { CodeBlock } from "@repo/ui/components/code-block";
import { cn } from "@repo/ui/lib/cn";
import type { Sandbox } from "@/lib/mock/sandboxes";
import BandFrame from "./band-frame";

interface SandboxConnectionMethodsBandProps {
  sandbox: Sandbox;
}

interface PortLookup {
  sandboxApi: number | null;
  preview: number | null;
  mcp: number | null;
}

function lookupPorts(
  ports: Sandbox["spec"]["ports"],
): PortLookup {
  return {
    sandboxApi: ports.find((p) => p.name === "sandbox-api")?.port ?? null,
    preview: ports.find((p) => p.name === "preview")?.port ?? null,
    mcp: ports.find((p) => p.name === "mcp")?.port ?? null,
  };
}

function buildBaseUrl(name: string, region: Sandbox["spec"]["region"]) {
  return `https://sbx-${name}-epzkrc.${region === "auto" ? "us-pdx-1" : region}.bl.run`;
}

/** §1.5 Connection methods band — four port-bound tabs (REST API, MCP
 *  server [conditional], Preview URL, Connect from terminal). Each tab
 *  surfaces a single URL or command in a `font-mono bg-muted-surface`
 *  block with a right-aligned copy affordance, plus a caption naming the
 *  bound port. The Connect-from-terminal tab additionally exposes
 *  language-tab samples (TS / Python / Go / cURL) per the project's
 *  spec-reference panel rule.
 *
 *  During DEPLOYING the band still renders but every tab carries a "not
 *  yet reachable" caption so the operator can copy the command in advance.
 *  The parent decides not to render the band entirely for TERMINATED /
 *  DELETING — there are no URLs to surface. */
export default function SandboxConnectionMethodsBand({
  sandbox,
}: SandboxConnectionMethodsBandProps) {
  const ports = lookupPorts(sandbox.spec.ports);
  const baseUrl = buildBaseUrl(sandbox.metadata.name, sandbox.spec.region);
  const mcpUrl = ports.mcp !== null ? `${baseUrl}/mcp` : null;
  const previewUrl = ports.preview !== null ? `${baseUrl}` : null;
  const cliCommand = `bl connect sandbox ${sandbox.metadata.name}`;
  const isDeploying = sandbox.status === "DEPLOYING" || sandbox.status === "BUILT";

  return (
    <BandFrame label="Connection methods">
      <Tabs defaultValue="rest" className="gap-4">
        <TabsList variant="underline" aria-label="Connection method">
          <TabsTrigger value="rest">
            <Code aria-hidden="true" /> REST API
          </TabsTrigger>
          {mcpUrl !== null && (
            <TabsTrigger value="mcp">
              <Plug aria-hidden="true" /> MCP server
            </TabsTrigger>
          )}
          <TabsTrigger value="preview">
            <Eye aria-hidden="true" /> Preview URL
          </TabsTrigger>
          <TabsTrigger value="terminal">
            <Keyboard aria-hidden="true" /> Connect from terminal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rest" className="m-0">
          <ConnectionPane
            value={baseUrl}
            caption={`Base URL for this Sandbox's REST API (port sandbox-api:${ports.sandboxApi ?? "—"}).`}
            isDeploying={isDeploying}
          />
        </TabsContent>

        {mcpUrl !== null && (
          <TabsContent value="mcp" className="m-0">
            <ConnectionPane
              value={mcpUrl}
              caption={`MCP endpoint for tool-use clients (port mcp:${ports.mcp}).`}
              isDeploying={isDeploying}
            />
          </TabsContent>
        )}

        <TabsContent value="preview" className="m-0">
          <ConnectionPane
            value={previewUrl ?? baseUrl}
            caption={`Public-facing app URL (port preview:${ports.preview ?? "—"}).`}
            isDeploying={isDeploying}
          />
        </TabsContent>

        <TabsContent value="terminal" className="m-0">
          <ConnectFromTerminal
            command={cliCommand}
            name={sandbox.metadata.name}
            isDeploying={isDeploying}
          />
        </TabsContent>
      </Tabs>
    </BandFrame>
  );
}

interface ConnectionPaneProps {
  value: string;
  caption: string;
  isDeploying: boolean;
}

function ConnectionPane({ value, caption, isDeploying }: ConnectionPaneProps) {
  return (
    <div className="flex flex-col gap-2">
      <UrlOrCommandBlock value={value} />
      <p className="typography-meta text-meta-foreground">
        {isDeploying ? "Not yet reachable — Sandbox deploying. " : ""}
        {caption}
      </p>
    </div>
  );
}

function UrlOrCommandBlock({ value }: { value: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border border-border bg-muted-surface px-3 py-2",
      )}
    >
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre font-mono typography-code text-foreground">
        {value}
      </code>
      <CopyButton value={value} ariaLabel={`Copy: ${value}`} />
    </div>
  );
}

interface ConnectFromTerminalProps {
  command: string;
  name: string;
  isDeploying: boolean;
}

type SampleLanguage = "typescript" | "python" | "go" | "curl";

const LANGUAGES: ReadonlyArray<{
  value: SampleLanguage;
  label: string;
  language: string;
}> = [
  { value: "typescript", label: "TypeScript", language: "typescript" },
  { value: "python", label: "Python", language: "python" },
  { value: "go", label: "Go", language: "go" },
  { value: "curl", label: "cURL", language: "bash" },
];

function buildSample(language: SampleLanguage, name: string): string {
  switch (language) {
    case "typescript":
      return [
        'import { SandboxInstance } from "@blaxel/core";',
        "",
        `const sbx = await SandboxInstance.get({ name: "${name}" });`,
        'await sbx.process.exec("ls -la /workspace");',
      ].join("\n");
    case "python":
      return [
        "from blaxel import SandboxInstance",
        "",
        `sbx = await SandboxInstance.get(name="${name}")`,
        'await sbx.process.exec("ls -la /workspace")',
      ].join("\n");
    case "go":
      return [
        "client, _ := blaxel.NewClient()",
        "",
        `sbx, _ := client.GetSandbox(ctx, "${name}")`,
        'sbx.ProcessExec(ctx, "ls -la /workspace")',
      ].join("\n");
    case "curl":
      return [
        `curl -X POST https://api.blaxel.ai/v0/sandboxes/${name}/process \\`,
        '  -H "Authorization: Bearer $BLAXEL_API_KEY" \\',
        '  -H "Content-Type: application/json" \\',
        "  -d '{\"command\":\"ls -la /workspace\"}'",
      ].join("\n");
  }
}

function ConnectFromTerminal({
  command,
  name,
  isDeploying,
}: ConnectFromTerminalProps) {
  const [language, setLanguage] = useState<SampleLanguage>("typescript");
  const sample = buildSample(language, name);
  const languageMeta = LANGUAGES.find((l) => l.value === language) ?? LANGUAGES[0]!;

  return (
    <div className="flex flex-col gap-3">
      <UrlOrCommandBlock value={command} />
      <p className="typography-meta text-meta-foreground">
        {isDeploying
          ? "Not yet reachable — Sandbox deploying. Command ready to paste."
          : "Opens an interactive terminal into this Sandbox (like SSH)."}
      </p>

      <div className="flex flex-col gap-2 pt-2">
        <span className="typography-meta text-meta-foreground">
          Or drive from local code:
        </span>
        <Tabs
          value={language}
          onValueChange={(v) => setLanguage(v as SampleLanguage)}
          className="gap-3"
        >
          <TabsList variant="underline" aria-label="Language">
            {LANGUAGES.map((lang) => (
              <TabsTrigger key={lang.value} value={lang.value}>
                {lang.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={language} className="m-0">
            <CodeBlock
              variant="block"
              language={languageMeta.language}
              code={sample}
              className="w-full"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
