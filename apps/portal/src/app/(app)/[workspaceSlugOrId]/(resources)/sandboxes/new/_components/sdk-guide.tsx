"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CodeBlock } from "@repo/ui/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";

interface SdkGuideProps {
  listHref: string;
}

interface StepDef {
  id: string;
  title: string;
  description: string;
  snippets: ReadonlyArray<{ label: string; language: string; code: string }>;
}

const STEPS: ReadonlyArray<StepDef> = [
  {
    id: "install-cli",
    title: "Install the Blaxel CLI",
    description: "macOS and Linux. The CLI runs `bl` from your terminal.",
    snippets: [
      {
        label: "brew",
        language: "bash",
        code: "brew tap blaxel-ai/blaxel\nbrew install blaxel",
      },
      {
        label: "curl",
        language: "bash",
        code: "curl -fsSL https://raw.githubusercontent.com/blaxel-ai/toolkit/main/install.sh | sh",
      },
    ],
  },
  {
    id: "login",
    title: "Sign in",
    description: "Pairs the CLI with this workspace.",
    snippets: [{ label: "CLI", language: "bash", code: "bl login" }],
  },
  {
    id: "install-sdk",
    title: "Install the SDK",
    description: "Pick the language you're building in.",
    snippets: [
      { label: "TypeScript", language: "bash", code: "pnpm add @blaxel/core" },
      { label: "Python", language: "bash", code: "pip install blaxel" },
    ],
  },
  {
    id: "create-sandbox",
    title: "Create a Sandbox",
    description: "Spin up a runtime — the Sandbox stays on standby afterwards.",
    snippets: [
      {
        label: "TypeScript",
        language: "typescript",
        code: [
          'import { SandboxInstance } from "@blaxel/core";',
          "",
          "const sb = await SandboxInstance.createIfNotExists({",
          '  name: "my-sandbox",',
          '  image: "blaxel/base",',
          "});",
        ].join("\n"),
      },
      {
        label: "Python",
        language: "python",
        code: [
          "from blaxel import SandboxInstance",
          "",
          "sb = await SandboxInstance.create_if_not_exists(",
          '    name="my-sandbox",',
          '    image="blaxel/base",',
          ")",
        ].join("\n"),
      },
    ],
  },
  {
    id: "run-code",
    title: "Run code in the Sandbox",
    description: "Stream stdout/stderr; exit code returns when the process ends.",
    snippets: [
      {
        label: "TypeScript",
        language: "typescript",
        code: [
          `const result = await sb.exec("python -c 'print(\\"hi\\")'");`,
          "console.log(result.stdout);",
        ].join("\n"),
      },
    ],
  },
];

export function SdkGuide({ listHref }: SdkGuideProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function copyAsMarkdown() {
    const markdown = STEPS.map((step, i) => {
      const codeBlocks = step.snippets
        .map(
          (snippet) =>
            "```" + snippet.language + "\n" + snippet.code + "\n```",
        )
        .join("\n\n");
      return `## ${i + 1}. ${step.title}\n\n${step.description}\n\n${codeBlocks}`;
    }).join("\n\n");
    const heading = "# Create a Sandbox with the Blaxel SDK\n\n";
    try {
      await navigator.clipboard.writeText(heading + markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // No-op — clipboard unavailable; silent. The button still toggles
      // visually in mock contexts thanks to the same handler firing.
    }
  }

  return (
    <div className="page-shell">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="page-header">
            <h1 className="typography-display font-semibold text-foreground">
              Use SDK / CLI
            </h1>
            <p className="typography-body text-muted-foreground">
              Create a Sandbox from your terminal — same surface as the
              dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="ghost" onClick={copyAsMarkdown}>
              {copied ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <FileText aria-hidden="true" className="size-4" />
              )}
              {copied ? "Copied" : "Copy as Markdown"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(listHref)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </header>

      <ol className="flex flex-col gap-8">
        {STEPS.map((step, i) => (
          <li
            key={step.id}
            className="flex flex-col gap-3 lg:grid lg:grid-cols-[20rem_1fr] lg:gap-8"
          >
            <div className="flex flex-col gap-2">
              <span className="typography-meta font-mono text-meta-foreground">
                Step {i + 1}
              </span>
              <h2 className="typography-subtitle font-semibold text-foreground">
                {step.title}
              </h2>
              <p className="typography-body text-muted-foreground">
                {step.description}
              </p>
            </div>
            <SnippetTabs snippets={step.snippets} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function SnippetTabs({
  snippets,
}: {
  snippets: ReadonlyArray<{ label: string; language: string; code: string }>;
}) {
  if (snippets.length === 1) {
    const only = snippets[0]!;
    return (
      <CodeBlock
        variant="block"
        language={only.language}
        code={only.code}
        className="w-full"
      />
    );
  }
  const first = snippets[0]!;
  return (
    <Tabs defaultValue={first.label} className="gap-3">
      <TabsList variant="underline" aria-label="Snippet language">
        {snippets.map((snippet) => (
          <TabsTrigger key={snippet.label} value={snippet.label}>
            {snippet.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {snippets.map((snippet) => (
        <TabsContent key={snippet.label} value={snippet.label} className="m-0">
          <CodeBlock
            variant="block"
            language={snippet.language}
            code={snippet.code}
            className="w-full"
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
