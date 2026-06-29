import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { CodeBlock } from "@repo/ui/components/code-block";
import NumberedStep from "./numbered-step";
import InstallCliStep from "./install-cli-step";
import InstallSdkStep from "./install-sdk-step";
import RunCodeStep from "./run-code-step";

const SANDBOX_CODE = `import { SandboxInstance } from "@blaxel/core";

async function main() {
  // Create a new sandbox
  const sandbox = await SandboxInstance.createIfNotExists({
    name: "my-sandbox",
    image: "blaxel/nextjs:latest",    // public or custom image
    memory: 4096,                     // in MB
    ports: [{ target: 3000, protocol: "HTTP" }],   // ports to expose
    region: "us-pdx-1",               // if not specified, Blaxel will choose a default region
  });
  console.log("Sandbox created:", { sandbox });

  /// ADD REST OF CODE HERE
}

main().catch(console.error);`;

export default function CreateSandboxCard() {
  return (
    <Card>
      <CardHeader>
        <h2 className="typography-subtitle font-medium text-foreground">
          Create a sandbox
        </h2>
      </CardHeader>
      <CardContent className="px-6 py-0">
        <ol className="divide-y divide-border">
          <li>
            <InstallCliStep />
          </li>
          <li>
            <NumberedStep
              number={2}
              title="Login locally"
              description="When developing locally, the recommended method is to just log in to your workspace with Blaxel CLI. This allows you to run Blaxel SDK functions that will automatically connect to your workspace without additional setup."
            >
              <CodeBlock
                variant="block"
                language="bash"
                code="bl login katezbuilds"
              />
            </NumberedStep>
          </li>
          <li>
            <InstallSdkStep />
          </li>
          <li>
            <NumberedStep
              number={4}
              title="Create a sandbox"
              description="Create a new sandbox by specifying a name, image to use, optional deployment region, and the ports to expose — or retrieve the existing sandbox of the same name."
            >
              <CodeBlock
                variant="block"
                language="typescript"
                code={SANDBOX_CODE}
              />
            </NumberedStep>
          </li>
          <li>
            <RunCodeStep />
          </li>
        </ol>
        <div className="border-t border-border py-4">
          <Link
            href="https://docs.blaxel.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 typography-body text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
            Next: Create a preview
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
