"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CodeBlock } from "@repo/ui/components/code-block";
import { BandFrame } from "./band-frame";
import type { Policy } from "@/lib/mock/policies";

interface PolicyCliBandProps {
  policy: Policy;
}

export function PolicyCliBand({ policy }: PolicyCliBandProps) {
  const blGetCommand = `bl policy get ${policy.metadata.name}`;
  const yaml = buildYamlManifest(policy);
  const applyCommand = `bl apply -f - <<'EOF'\n${yaml}\nEOF`;

  return (
    <BandFrame label="CLI">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-mono typography-meta uppercase tracking-wider text-meta-foreground">
            Read
          </span>
          <CodeBlock variant="block" code={blGetCommand} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono typography-meta uppercase tracking-wider text-meta-foreground">
            YAML manifest
          </span>
          <CodeBlock variant="block" language="yaml" code={yaml} />
        </div>

        <div className="flex flex-wrap gap-2">
          <CopyValueButton label="Copy YAML" value={yaml} />
          <CopyValueButton label="Copy bl policy get" value={blGetCommand} />
          <CopyValueButton label="Copy bl apply" value={applyCommand} />
        </div>
      </div>
    </BandFrame>
  );
}

function CopyValueButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function onClick() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <Button variant="secondary" type="button" onClick={onClick}>
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? "Copied" : label}
    </Button>
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
