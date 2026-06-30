// Snippet builders for the Launch section on step 3 (live-updating code
// block) and for the empty-state CLI on the list page. Each builder takes
// the form snapshot and returns a plain string the CodeBlock renders.

import type { CreateFormState } from "./form-state";

export type SnippetLanguage = "typescript" | "python" | "go" | "curl" | "cli";

export interface SnippetContext {
  name: string;
  imageRef: string;
  memoryMib: number;
  region: string;
}

export function snippetContextFrom(state: CreateFormState): SnippetContext {
  return {
    name: state.sandboxName || "<your-sandbox-name>",
    imageRef: state.imageRef ?? "<pick-an-image>",
    memoryMib: state.memoryMib,
    region: state.region,
  };
}

export function buildSnippet(
  language: SnippetLanguage,
  ctx: SnippetContext,
): string {
  switch (language) {
    case "typescript":
      return [
        'import { SandboxInstance } from "@blaxel/core";',
        "",
        "const sb = await SandboxInstance.createIfNotExists({",
        `  name: "${ctx.name}",`,
        `  image: "${ctx.imageRef}",`,
        `  memory: ${ctx.memoryMib},`,
        `  region: "${ctx.region}",`,
        "});",
      ].join("\n");
    case "python":
      return [
        "from blaxel import SandboxInstance",
        "",
        "sb = await SandboxInstance.create_if_not_exists(",
        `    name="${ctx.name}",`,
        `    image="${ctx.imageRef}",`,
        `    memory=${ctx.memoryMib},`,
        `    region="${ctx.region}",`,
        ")",
      ].join("\n");
    case "go":
      return [
        "client, _ := blaxel.NewClient()",
        "",
        "sb, err := client.CreateSandbox(ctx, blaxel.Sandbox{",
        `  Name:   "${ctx.name}",`,
        `  Image:  "${ctx.imageRef}",`,
        `  Memory: ${ctx.memoryMib},`,
        `  Region: "${ctx.region}",`,
        "})",
      ].join("\n");
    case "curl":
      return [
        "curl -X POST https://api.blaxel.ai/v0/sandboxes \\",
        '  -H "Authorization: Bearer $BLAXEL_API_KEY" \\',
        '  -H "Content-Type: application/json" \\',
        `  -d '{"name":"${ctx.name}","image":"${ctx.imageRef}","memory":${ctx.memoryMib},"region":"${ctx.region}"}'`,
      ].join("\n");
    case "cli":
      return [
        `bl sandbox create \\`,
        `  --name ${ctx.name} \\`,
        `  --image ${ctx.imageRef} \\`,
        `  --memory ${ctx.memoryMib} \\`,
        `  --region ${ctx.region}`,
      ].join("\n");
  }
}
