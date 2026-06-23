"use client";

import { CodeBlock } from "@repo/ui/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import type { CustomDomain } from "@/lib/mock/custom-domains";
import { Band } from "./band";

interface CliBandProps {
  domain: CustomDomain;
}

export function CliBand({ domain }: CliBandProps) {
  const { metadata, spec } = domain;
  const registerCommand = `bl domain register ${metadata.name} --region ${spec.region}`;
  const verifyCommand = `bl domain verify ${metadata.name}`;
  const deleteCommand = `bl domain delete ${metadata.name}`;

  return (
    <Band title="CLI">
      <Tabs defaultValue="verify" className="gap-3">
        <TabsList variant="underline" aria-label="CLI command">
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="verify">Verify</TabsTrigger>
          <TabsTrigger value="delete">Delete</TabsTrigger>
        </TabsList>
        <TabsContent value="register" className="m-0">
          <CodeBlock variant="block" language="bash" code={registerCommand} />
        </TabsContent>
        <TabsContent value="verify" className="m-0">
          <CodeBlock variant="block" language="bash" code={verifyCommand} />
        </TabsContent>
        <TabsContent value="delete" className="m-0">
          <CodeBlock variant="block" language="bash" code={deleteCommand} />
        </TabsContent>
      </Tabs>
    </Band>
  );
}
