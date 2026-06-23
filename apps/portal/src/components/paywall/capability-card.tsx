import { Card } from "@repo/ui/components/card";

interface CapabilityCardProps {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  title: string;
  description: string;
}

export default function CapabilityCard({ icon: Icon, title, description }: CapabilityCardProps) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2">
        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        <h3 className="typography-label font-medium text-foreground">
          {title}
        </h3>
      </div>
      <p className="typography-caption text-muted-foreground">{description}</p>
    </Card>
  );
}
