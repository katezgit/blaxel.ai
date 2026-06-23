import { CodeBlock } from "@repo/ui/components/code-block";
import { Card, CardContent } from "@repo/ui/components/card";

export function CustomDomainsEmpty() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h2 className="typography-subtitle font-semibold text-foreground">
            Register your first domain
          </h2>
          <p className="typography-body text-muted-foreground">
            Start in the CLI. The dashboard updates automatically once the
            registration lands.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="typography-label font-medium uppercase tracking-wider text-muted-foreground">
              1. Register
            </span>
            <CodeBlock
              variant="block"
              code="bl domain register <apex-domain> --region us-pdx-1"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="typography-label font-medium uppercase tracking-wider text-muted-foreground">
              2. Publish DNS records, then verify
            </span>
            <CodeBlock
              variant="block"
              code="bl domain verify <apex-domain>"
            />
          </div>
        </div>

        <p className="typography-caption text-muted-foreground">
          Or use the <span className="font-medium text-foreground">Add domain</span>{" "}
          button above to paste a domain name from your terminal.
        </p>
      </CardContent>
    </Card>
  );
}
