"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { CodeBlock } from "@repo/ui/components/code-block";
import NumberedStep from "./numbered-step";

const BREW_CMD = `brew tap blaxel-ai/blaxel
brew install blaxel`;

const CURL_CMD = `curl -fsSL https://raw.githubusercontent.com/blaxel-ai/toolkit/main/install.sh | BINDIR=/usr/local/bin sudo -E sh`;

export default function InstallCliStep() {
  const [tab, setTab] = useState("brew");

  return (
    <NumberedStep
      number={1}
      title="Install Blaxel CLI"
      description={
        <>
          The Blaxel CLI allows to log in and manage your deployments. Check out
          this{" "}
          <a
            href="https://docs.blaxel.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            documentation
          </a>{" "}
          for other installers (non-sudo, etc.)
        </>
      }
    >
      <Tabs value={tab} onValueChange={setTab} className="gap-3">
        <TabsList>
          <TabsTrigger value="brew">For Mac (brew)</TabsTrigger>
          <TabsTrigger value="curl">Other (cURL)</TabsTrigger>
        </TabsList>
        <TabsContent value="brew">
          <CodeBlock variant="block" language="bash" code={BREW_CMD} />
        </TabsContent>
        <TabsContent value="curl">
          <CodeBlock variant="block" language="bash" code={CURL_CMD} />
        </TabsContent>
      </Tabs>
    </NumberedStep>
  );
}
