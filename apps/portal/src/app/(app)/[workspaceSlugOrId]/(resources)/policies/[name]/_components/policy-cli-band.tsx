"use client";

import { CodeBlock } from "@repo/ui/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import BandFrame from "./band-frame";
import type { Policy } from "@/lib/mock/policies";

interface PolicyCliBandProps {
  policy: Policy;
}

export default function PolicyCliBand({ policy }: PolicyCliBandProps) {
  const yaml = buildYamlManifest(policy);
  const blGetCommand = `bl policy get ${policy.metadata.name}`;
  const blApplyCommand = `bl apply -f - <<'EOF'\n${yaml}\nEOF`;

  return (
    <BandFrame label="CLI">
      <Tabs defaultValue="yaml" className="gap-3">
        <TabsList variant="underline" aria-label="CLI view">
          <TabsTrigger value="yaml">YAML</TabsTrigger>
          <TabsTrigger value="bl-get">bl get</TabsTrigger>
          <TabsTrigger value="bl-apply">bl apply</TabsTrigger>
        </TabsList>
        <TabsContent value="yaml" className="m-0">
          <CodeBlock variant="block" language="yaml" code={yaml} />
        </TabsContent>
        <TabsContent value="bl-get" className="m-0">
          <CodeBlock variant="block" language="bash" code={blGetCommand} />
        </TabsContent>
        <TabsContent value="bl-apply" className="m-0">
          <CodeBlock variant="block" language="bash" code={blApplyCommand} />
        </TabsContent>
      </Tabs>
    </BandFrame>
  );
}

function buildYamlManifest(policy: Policy): string {
  const lines: string[] = [
    "apiVersion: blaxel.ai/v1alpha1",
    "kind: Policy",
    "metadata:",
    `  name: ${policy.metadata.name}`,
    `  displayName: ${policy.metadata.displayName}`,
  ];
  const labels = Object.entries(policy.metadata.labels);
  if (labels.length > 0) {
    lines.push("  labels:");
    for (const [key, value] of labels) {
      lines.push(`    ${key}: ${value}`);
    }
  }
  lines.push("spec:", `  type: ${policy.spec.type}`, "  resourceTypes:");
  for (const kind of policy.spec.resourceTypes) {
    lines.push(`    - ${kind}`);
  }
  if (policy.spec.type === "location" && policy.spec.locations) {
    lines.push("  locations:");
    for (const location of policy.spec.locations) {
      lines.push(`    - type: ${location.type}`);
      lines.push(`      name: ${location.name}`);
    }
  }
  if (policy.spec.type === "maxToken" && policy.spec.maxTokens) {
    const m = policy.spec.maxTokens;
    lines.push(
      "  maxTokens:",
      `    granularity: ${m.granularity}`,
      `    step: ${m.step}`,
      `    input: ${m.input}`,
      `    output: ${m.output}`,
      `    total: ${m.total}`,
      `    ratioInputOverOutput: ${m.ratioInputOverOutput}`,
    );
  }
  if (policy.spec.type === "flavor" && policy.spec.flavors) {
    lines.push("  flavors:");
    for (const flavor of policy.spec.flavors) {
      lines.push(`    - name: ${flavor.name}`);
      lines.push(`      type: ${flavor.type}`);
    }
  }
  return lines.join("\n");
}
