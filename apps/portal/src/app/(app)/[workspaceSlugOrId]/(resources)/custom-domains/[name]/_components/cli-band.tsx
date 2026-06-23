import { CodeBlock } from "@repo/ui/components/code-block";
import type { CustomDomain } from "@/lib/mock/custom-domains";
import { Band } from "./band";

interface CliBandProps {
  domain: CustomDomain;
}

export function CliBand({ domain }: CliBandProps) {
  const { metadata, spec } = domain;
  return (
    <Band title="CLI">
      <div className="flex flex-col gap-4">
        <CliCommand
          label="Register this domain"
          command={`bl domain register ${metadata.name} --region ${spec.region}`}
        />
        <CliCommand
          label="Verify this domain"
          command={`bl domain verify ${metadata.name}`}
        />
        <CliCommand
          label="Delete this domain"
          command={`bl domain delete ${metadata.name}`}
        />
      </div>
    </Band>
  );
}

interface CliCommandProps {
  label: string;
  command: string;
}

function CliCommand({ label, command }: CliCommandProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="typography-meta font-medium uppercase tracking-wider text-meta-foreground">
        {label}
      </span>
      <CodeBlock variant="block" code={command} />
    </div>
  );
}
