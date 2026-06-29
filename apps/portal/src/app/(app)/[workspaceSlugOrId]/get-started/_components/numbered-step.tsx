import type { ReactNode } from "react";

export default function NumberedStep({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-6 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card font-mono typography-meta text-foreground"
        >
          {number}
        </span>
        <h3 className="typography-subtitle font-medium text-foreground pt-0.5">
          {title}
        </h3>
      </div>
      {description ? (
        <p className="typography-body text-muted-foreground max-w-prose">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
