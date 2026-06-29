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

export default function InstallSdkStep() {
  const [tab, setTab] = useState("ts");

  return (
    <NumberedStep
      number={3}
      title="Install Blaxel SDK"
      description={
        <>
          Blaxel offers a Python and a TypeScript SDK to manage resources. Check
          out this{" "}
          <a
            href="https://docs.blaxel.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            documentation
          </a>{" "}
          for other installers (pnpm, uv, etc.)
        </>
      }
    >
      <Tabs value={tab} onValueChange={setTab} className="gap-3">
        <TabsList>
          <TabsTrigger value="ts">TypeScript</TabsTrigger>
          <TabsTrigger value="py">Python</TabsTrigger>
        </TabsList>
        <TabsContent value="ts">
          <CodeBlock
            variant="block"
            language="bash"
            code="npm install @blaxel/core"
          />
        </TabsContent>
        <TabsContent value="py">
          <CodeBlock variant="block" language="bash" code="pip install blaxel" />
        </TabsContent>
      </Tabs>
    </NumberedStep>
  );
}
