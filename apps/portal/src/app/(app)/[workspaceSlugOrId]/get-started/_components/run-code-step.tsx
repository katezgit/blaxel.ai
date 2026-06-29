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

const API_CODE = `// List files in a directory
const { subdirectories, files } = await sandbox.fs.ls("/");
console.log("Files:", { files }, "Subdirectories:", { subdirectories });

// Run a command
const process = await sandbox.process.exec({
  name: "hello-process",
  command: "echo 'Hello, World!'"
});
const processInfo = await sandbox.process.get("hello-process");

// Get logs (in batch)
const logs = await sandbox.process.logs("hello-process");
console.log("Logs:", { logs });`;

export default function RunCodeStep() {
  const [tab, setTab] = useState("api");

  return (
    <NumberedStep
      number={5}
      title="Run code and commands"
      description="Use either the API, MCP server or manual terminal to run commands, manage the filesystem, stream or batch load process logs and mount volumes."
    >
      <Tabs value={tab} onValueChange={setTab} className="gap-3">
        <TabsList>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="mcp">MCP</TabsTrigger>
          <TabsTrigger value="terminal">Manual terminal</TabsTrigger>
        </TabsList>
        <TabsContent value="api">
          <CodeBlock variant="block" language="typescript" code={API_CODE} />
        </TabsContent>
        <TabsContent value="mcp">
          <CodeBlock
            variant="block"
            language="bash"
            code="bl mcp serve --sandbox my-sandbox"
          />
        </TabsContent>
        <TabsContent value="terminal">
          <CodeBlock
            variant="block"
            language="bash"
            code="bl sandbox shell my-sandbox"
          />
        </TabsContent>
      </Tabs>
    </NumberedStep>
  );
}
