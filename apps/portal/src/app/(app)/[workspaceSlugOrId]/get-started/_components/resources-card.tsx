import { BookOpen, Code2, FileCode, FileCode2 } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";

type ResourceItem = {
  title: string;
  description: string;
  linkLabel: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const RESOURCES: ResourceItem[] = [
  {
    title: "Documentation",
    description: "Learn about sandboxes and how to deploy them.",
    linkLabel: "Visit Docs",
    href: "https://docs.blaxel.ai/",
    Icon: BookOpen,
  },
  {
    title: "SDK Reference",
    description: "Learn how to manage sandboxes using the SDK.",
    linkLabel: "Visit SDK Reference",
    href: "https://docs.blaxel.ai/",
    Icon: Code2,
  },
  {
    title: "API Reference",
    description: "Learn how to manage sandboxes using the API.",
    linkLabel: "Visit API Reference",
    href: "https://docs.blaxel.ai/",
    Icon: FileCode,
  },
  {
    title: "Sandbox API Reference",
    description: "Learn how to manage files and directories in your sandbox.",
    linkLabel: "Visit API Reference",
    href: "https://docs.blaxel.ai/",
    Icon: FileCode2,
  },
];

export default function ResourcesCard() {
  return (
    <Card>
      <CardHeader>
        <h2 className="typography-subtitle font-medium text-foreground">
          Resources
        </h2>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <ul className="divide-y divide-border">
          {RESOURCES.map(({ title, description, linkLabel, href, Icon }) => (
            <li key={title} className="px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted-surface text-muted-foreground">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h3 className="typography-body font-medium text-foreground">
                    {title}
                  </h3>
                  <p className="typography-caption text-muted-foreground">
                    {description}
                  </p>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 self-end typography-caption text-primary hover:underline"
                  >
                    {linkLabel} <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
